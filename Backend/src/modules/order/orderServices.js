import { prisma } from "../../utils/prisma.js";
import {
    StockUnavailableError,
    commitReservedUnitsRepository,
    releaseReservedUnitsRepository,
    reserveStockQuantityRepository,
    restockSoldUnitsRepository,
} from "../stock/stockRepositories.js";
import {
    addOrderRepository,
    addProductsToOrderRepository,
    deleteOrderRepository,
    getOrderByIdRepository,
    getOrderForTrackingRepository,
    getOrderSummaryRepository,
    getOrderUnitsRepository,
    getOrdersForInvoiceRepository,
    getOrdersByStatusRepository,
    getOrdersInRangeRepository,
    searchOrdersRepository,
    transitionOrderStatusRepository,
} from "./orderRepository.js";

const ORDER_TRANSACTION_OPTIONS = { timeout: 20000 };
const MAX_UNITS_PER_PRODUCT = 50;

export const ORDER_STATUS = {
    PENDING: "PENDING",
    ACCEPTED: "ACCEPTED",
    SHIPPED: "SHIPPED",
    CANCELED: "CANCELED",
};

// ONLINE = storefront checkout, POS = sale made from the dashboard.
export const ORDER_CHANNEL = { ONLINE: "ONLINE", POS: "POS" };

const ONLINE_PAYMENT_METHODS = ["cod", "bkash"];
const POS_PAYMENT_METHODS = ["cash", "bkash", "nagad", "card", "bank"];

// An error the customer/staff should see as-is (4xx), optionally tied to a
// form field so the UI can show it in the right place.
export class OrderError extends Error {
    constructor(message, statusCode = 400, field) {
        super(message);
        this.statusCode = statusCode;
        this.field = field;
    }
}

const money = (value) => Math.round(Number(value || 0) * 100) / 100;

// Phones are stored as 01XXXXXXXXX. Returns null when not a valid BD mobile.
export const normalizePhone = (value) => {
    let phone = String(value ?? "").replace(/[\s-]/g, "");
    if (phone.startsWith("+880")) phone = "0" + phone.slice(4);
    else if (phone.startsWith("880")) phone = "0" + phone.slice(3);
    return /^01[3-9]\d{8}$/.test(phone) ? phone : null;
};

// Older customer rows may have been saved with a country code.
const phoneVariants = (phone) => [phone, `+88${phone}`, `88${phone}`];

// ── Pricing ──────────────────────────────────────────────────────────────────

// Accepts { items: [{ productId, quantity }] } or the older flattened
// { products: [{ productId }, …] } (one row per unit) and merges duplicates.
const normalizeItems = (input) => {
    const rows = Array.isArray(input.items)
        ? input.items
        : Array.isArray(input.products)
            ? input.products.map((p) => ({ productId: p.productId, quantity: p.quantity ?? 1 }))
            : [];

    const quantities = new Map();
    for (const row of rows) {
        const productId = String(row?.productId ?? "").trim();
        const quantity = Number(row?.quantity);
        if (!productId || !Number.isInteger(quantity) || quantity < 1) {
            throw new OrderError("Every item needs a product and a quantity of at least 1", 400, "items");
        }
        quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }

    if (quantities.size === 0) throw new OrderError("Add at least one product", 400, "items");

    return [...quantities].map(([productId, quantity]) => {
        if (quantity > MAX_UNITS_PER_PRODUCT) {
            throw new OrderError(`You can order at most ${MAX_UNITS_PER_PRODUCT} units of one product`, 400, "items");
        }
        return { productId, quantity };
    });
};

const validateCoupon = (coupon, subTotal) => {
    if (!coupon) throw new OrderError("Coupon not found", 422, "coupon");
    if (!coupon.isActive) throw new OrderError("This coupon is not active", 422, "coupon");
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        throw new OrderError("This coupon has expired", 422, "coupon");
    }
    if (coupon.maxUsageLimit !== null && coupon.maxUsageLimit !== undefined && coupon.usedCount >= coupon.maxUsageLimit) {
        throw new OrderError("This coupon has reached its usage limit", 422, "coupon");
    }
    const minOrder = Number(coupon.minOrderAmount || 0);
    if (minOrder > 0 && subTotal < minOrder) {
        throw new OrderError(`This coupon needs a minimum order of ৳${minOrder.toLocaleString()}`, 422, "coupon");
    }

    let discount = coupon.discountPCT
        ? (subTotal * Number(coupon.discountPCT)) / 100
        : Number(coupon.discountAMT || 0);
    if (coupon.maxDiscountAmt) discount = Math.min(discount, Number(coupon.maxDiscountAmt));
    return money(Math.min(Math.round(discount), subTotal));
};

/**
 * Prices an order from the database. Used both for the live quote shown in
 * checkout / Sell and for placing the order, so what is shown is exactly
 * what gets charged. Nothing the client sends about prices is trusted.
 *
 * POS only: unpublished products may be sold, delivery charge is entered by
 * staff, and a custom discount ({ type: "amount" | "percent", value, reason })
 * can be given on top of a coupon.
 */
export const priceOrder = async (input, { channel }, tx = prisma) => {
    const items = normalizeItems(input);
    const insideDhaka = !(input.insideDhaka === false || input.insideDhaka === "false");

    const productIds = items.map((i) => i.productId);
    // Sequential on purpose: inside an interactive transaction both queries
    // share one connection, which can't run them concurrently.
    const products = await tx.product.findMany({
        where: { productId: { in: productIds } },
        select: {
            productId: true,
            title: true,
            subTitle: true,
            status: true,
            price: true,
            mainPrice: true,
            group: { select: { insideDhakaCharge: true, outsideDhakaCharge: true } },
        },
    });
    const stocks = await tx.stock.findMany({
        where: { productId: { in: productIds } },
        select: { productId: true, remaining: true, reserved: true },
    });

    const productById = new Map(products.map((p) => [p.productId, p]));
    const availableById = new Map();
    stocks.forEach((s) => {
        availableById.set(s.productId, (availableById.get(s.productId) || 0) + Math.max(0, s.remaining - s.reserved));
    });

    const lines = items.map(({ productId, quantity }) => {
        const product = productById.get(productId);
        if (!product) throw new OrderError("A product in this order no longer exists", 404, "items");
        if (channel === ORDER_CHANNEL.ONLINE && product.status !== "published") {
            throw new OrderError(`"${product.title}" is not available right now`, 409, "items");
        }
        const unitPrice = money(product.price);
        const unitMainPrice = Math.max(unitPrice, money(product.mainPrice ?? product.price));
        return {
            productId,
            title: product.title,
            subTitle: product.subTitle,
            quantity,
            available: availableById.get(productId) || 0,
            unitPrice,
            unitMainPrice,
            lineTotal: money(unitPrice * quantity),
            insideDhakaCharge: money(product.group?.insideDhakaCharge),
            outsideDhakaCharge: money(product.group?.outsideDhakaCharge),
        };
    });

    const subTotal = money(lines.reduce((sum, line) => sum + line.lineTotal, 0));

    // Delivery: online orders ship as one parcel, so the highest per-product
    // charge applies (not the sum). POS staff enter it themselves.
    let deliveryCharge;
    if (channel === ORDER_CHANNEL.POS) {
        const manual = Number(input.deliveryCharge ?? 0);
        if (!Number.isFinite(manual) || manual < 0) {
            throw new OrderError("Delivery charge must be 0 or more", 400, "deliveryCharge");
        }
        deliveryCharge = money(manual);
    } else {
        deliveryCharge = money(
            Math.max(...lines.map((line) => (insideDhaka ? line.insideDhakaCharge : line.outsideDhakaCharge)))
        );
    }

    let coupon = null;
    let couponDiscount = 0;
    const couponCode = String(input.couponCode ?? "").trim();
    if (couponCode) {
        coupon = await tx.coupon.findFirst({ where: { code: { equals: couponCode, mode: "insensitive" } } });
        couponDiscount = validateCoupon(coupon, subTotal);
    }

    let customDiscount = 0;
    let customDiscountLabel = "";
    const custom = input.customDiscount;
    if (channel === ORDER_CHANNEL.POS && custom && custom.value !== "" && custom.value !== undefined && custom.value !== null) {
        const value = Number(custom.value);
        if (!Number.isFinite(value) || value < 0) {
            throw new OrderError("Custom discount must be 0 or more", 400, "customDiscount");
        }
        if (custom.type === "percent") {
            if (value > 100) throw new OrderError("Custom discount can't be more than 100%", 400, "customDiscount");
            customDiscount = money(Math.round((subTotal * value) / 100));
            customDiscountLabel = `${value}%`;
        } else {
            customDiscount = money(value);
        }
    }

    if (couponDiscount + customDiscount > subTotal) {
        throw new OrderError("The total discount can't be more than the subtotal", 400, "customDiscount");
    }

    const discount = money(couponDiscount + customDiscount);

    return {
        channel,
        insideDhaka,
        lines: lines.map(({ insideDhakaCharge, outsideDhakaCharge, ...line }) => line),
        subTotal,
        deliveryCharge,
        coupon: coupon ? { couponId: coupon.couponId, code: coupon.code } : null,
        couponDiscount,
        customDiscount,
        customDiscountLabel,
        customDiscountReason: String(custom?.reason ?? "").trim().slice(0, 200),
        discount,
        totalBill: money(subTotal - discount + deliveryCharge),
    };
};

export const quoteOrderService = async (input, channel, tx = prisma) => priceOrder(input, { channel }, tx);

// ── Placing an order ─────────────────────────────────────────────────────────

const findOrCreateCustomer = async (tx, { name, phone, email }) => {
    const existing = await tx.customer.findFirst({ where: { phone: { in: phoneVariants(phone) } } });

    // Email is optional and unique, so it's only stored when no other
    // customer already uses it.
    const emailIsFree = async () =>
        email && !(await tx.customer.findUnique({ where: { email }, select: { customerId: true } }));

    if (existing) {
        if (email && !existing.email && (await emailIsFree())) {
            return tx.customer.update({ where: { customerId: existing.customerId }, data: { email } });
        }
        return existing;
    }

    return tx.customer.create({
        data: { name, phone, email: (await emailIsFree()) ? email : null },
    });
};

const validateOrderInput = (input, channel) => {
    const name = String(input.customerName ?? "").trim();
    if (name.length < 2) throw new OrderError("Customer name is required", 400, "customerName");

    const phone = normalizePhone(input.customerPhone);
    if (!phone) throw new OrderError("Enter a valid Bangladeshi mobile number (01XXXXXXXXX)", 400, "customerPhone");

    const email = String(input.customerEmail ?? "").trim().toLowerCase() || null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new OrderError("Email address is not valid", 400, "customerEmail");
    }

    const deliveryAddress = String(input.deliveryAddress ?? "").trim();
    if (channel === ORDER_CHANNEL.ONLINE && deliveryAddress.length < 5) {
        throw new OrderError("Delivery address is required", 400, "deliveryAddress");
    }

    const paymentMethod = String(input.paymentMethod ?? (channel === ORDER_CHANNEL.POS ? "cash" : "cod")).toLowerCase();
    const allowed = channel === ORDER_CHANNEL.POS ? POS_PAYMENT_METHODS : ONLINE_PAYMENT_METHODS;
    if (!allowed.includes(paymentMethod)) throw new OrderError("Payment method is not supported", 400, "paymentMethod");

    const transactionId = String(input.transactionId ?? "").trim() || null;
    if (channel === ORDER_CHANNEL.ONLINE && paymentMethod === "bkash" && !transactionId) {
        throw new OrderError("Enter the bKash transaction ID", 400, "transactionId");
    }

    return { name, phone, email, deliveryAddress, paymentMethod, transactionId };
};

/**
 * Places an order. ONLINE orders start PENDING with their units reserved;
 * POS sales are handed over at the counter, so they start ACCEPTED and their
 * units are taken out of stock straight away.
 */
export const createOrderService = async (input, { channel, employeeId } = {}) => {
    const customerInput = validateOrderInput(input, channel);
    const storeId = channel === ORDER_CHANNEL.POS ? String(input.storeId ?? "").trim() || null : null;

    return prisma.$transaction(async (tx) => {
        const quote = await priceOrder(input, { channel }, tx);

        if (storeId && !(await tx.store.findUnique({ where: { storeId }, select: { storeId: true } }))) {
            throw new OrderError("The selected store doesn't exist", 400, "storeId");
        }

        const customer = await findOrCreateCustomer(tx, customerInput);

        // Payment
        let paidAmount = 0;
        if (channel === ORDER_CHANNEL.POS) {
            const requested = input.paidAmount === undefined || input.paidAmount === "" ? quote.totalBill : Number(input.paidAmount);
            if (!Number.isFinite(requested) || requested < 0) {
                throw new OrderError("Paid amount must be 0 or more", 400, "paidAmount");
            }
            paidAmount = money(Math.min(requested, quote.totalBill));
        }
        const dueAmount = money(quote.totalBill - paidAmount);
        const paymentStatus = dueAmount <= 0 ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID";

        // Staff-facing note: custom discount details + whatever was typed.
        const notes = [];
        if (quote.customDiscount > 0) {
            notes.push(
                `Custom discount ৳${quote.customDiscount.toLocaleString()}` +
                (quote.customDiscountLabel ? ` (${quote.customDiscountLabel})` : "") +
                (quote.customDiscountReason ? ` — ${quote.customDiscountReason}` : "")
            );
        }
        const typedNote = String(input.sellerNote ?? "").trim();
        if (typedNote) notes.push(typedNote.slice(0, 300));

        const order = await addOrderRepository(
            {
                customerId: customer.customerId,
                insideDhaka: quote.insideDhaka,
                deliveryAddress: customerInput.deliveryAddress || (channel === ORDER_CHANNEL.POS ? "In-store" : ""),
                paymentMethod: customerInput.paymentMethod,
                subTotal: quote.subTotal,
                deliveryCharge: quote.deliveryCharge,
                discount: quote.discount,
                totalBill: quote.totalBill,
                orderStatus: channel === ORDER_CHANNEL.POS ? ORDER_STATUS.ACCEPTED : ORDER_STATUS.PENDING,
                couponId: quote.coupon?.couponId ?? null,
                storeId,
                employeeId: employeeId || null,
                paymentStatus,
                paidAmount,
                dueAmount,
                transactionId: customerInput.transactionId,
                orderType: channel,
                deliveryNote: String(input.deliveryNote ?? "").trim().slice(0, 300) || null,
                sellerNote: notes.join(" · ") || null,
            },
            tx
        );

        // Coupon usage is counted here, inside the order transaction. The
        // increment locks the coupon row, so the limit re-check below is safe
        // against two customers using the last slot at once.
        if (quote.coupon) {
            const coupon = await tx.coupon.update({
                where: { couponId: quote.coupon.couponId },
                data: { usedCount: { increment: 1 } },
            });
            if (coupon.maxUsageLimit !== null && coupon.usedCount > coupon.maxUsageLimit) {
                throw new OrderError("This coupon has reached its usage limit", 422, "coupon");
            }
            await tx.couponUsage.create({
                data: { couponId: coupon.couponId, customerId: customer.customerId, orderId: order.orderId },
            });
        }

        // Reserve one serial per unit
        const units = [];
        const orderProducts = [];
        for (const line of quote.lines) {
            let reservedUnits;
            try {
                ({ reservedUnits } = await reserveStockQuantityRepository(line.productId, line.quantity, tx));
            } catch (error) {
                if (error instanceof StockUnavailableError) {
                    throw new OrderError(
                        line.available > 0
                            ? `Only ${line.available} of "${line.title}" left in stock`
                            : `"${line.title}" is out of stock`,
                        409,
                        "items"
                    );
                }
                throw error;
            }
            reservedUnits.forEach((unit) => {
                units.push(unit);
                orderProducts.push({
                    orderId: order.orderId,
                    productId: line.productId,
                    serialNumber: unit.serialNumber,
                    originalPrice: line.unitMainPrice,
                    discountAmount: money(line.unitMainPrice - line.unitPrice),
                    purchasePrice: line.unitPrice,
                });
            });
        }
        await addProductsToOrderRepository(orderProducts, tx);

        if (channel === ORDER_CHANNEL.POS) {
            await commitReservedUnitsRepository(units, tx, { storeId });
        }

        return getOrderByIdRepository(order.orderId, tx);
    }, ORDER_TRANSACTION_OPTIONS);
};

// ── Status changes ───────────────────────────────────────────────────────────

const STATUS_VERB = {
    [ORDER_STATUS.ACCEPTED]: "accepted",
    [ORDER_STATUS.SHIPPED]: "shipped",
    [ORDER_STATUS.CANCELED]: "cancelled",
};

const requireOrder = async (tx, orderId) => {
    const order = await tx.order.findUnique({
        where: { orderId },
        select: { orderId: true, orderStatus: true, couponId: true },
    });
    if (!order) throw new OrderError(`Order ${orderId} was not found`, 404);
    return order;
};

const moveOrder = async (tx, order, allowedFrom, toStatus) => {
    if (!allowedFrom.includes(order.orderStatus)) {
        throw new OrderError(
            `Order ${order.orderId} is ${order.orderStatus.toLowerCase()} and can't be ${STATUS_VERB[toStatus]}`,
            409
        );
    }
    const moved = await transitionOrderStatusRepository(order.orderId, order.orderStatus, toStatus, tx);
    if (!moved) {
        throw new OrderError(`Order ${order.orderId} was just changed by someone else, refresh and try again`, 409);
    }
};

// PENDING → ACCEPTED: reserved units are now sold.
export const acceptOrderService = (orderId) =>
    prisma.$transaction(async (tx) => {
        const order = await requireOrder(tx, orderId);
        await moveOrder(tx, order, [ORDER_STATUS.PENDING], ORDER_STATUS.ACCEPTED);
        await commitReservedUnitsRepository(await getOrderUnitsRepository(orderId, tx), tx);
        return { orderId, orderStatus: ORDER_STATUS.ACCEPTED };
    }, ORDER_TRANSACTION_OPTIONS);

// ACCEPTED → SHIPPED: no stock movement.
export const shipOrderService = (orderId) =>
    prisma.$transaction(async (tx) => {
        const order = await requireOrder(tx, orderId);
        await moveOrder(tx, order, [ORDER_STATUS.ACCEPTED], ORDER_STATUS.SHIPPED);
        return { orderId, orderStatus: ORDER_STATUS.SHIPPED };
    }, ORDER_TRANSACTION_OPTIONS);

// Any open order → CANCELED. A pending order gives its reservation back; an
// accepted or shipped (returned) order puts its units back into stock. The
// coupon use is given back too.
export const cancelOrderService = (orderId) =>
    prisma.$transaction(async (tx) => {
        const order = await requireOrder(tx, orderId);
        const wasPending = order.orderStatus === ORDER_STATUS.PENDING;
        await moveOrder(
            tx,
            order,
            [ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED, ORDER_STATUS.SHIPPED],
            ORDER_STATUS.CANCELED
        );

        const units = await getOrderUnitsRepository(orderId, tx);
        if (wasPending) await releaseReservedUnitsRepository(units, tx);
        else await restockSoldUnitsRepository(units, tx);

        if (order.couponId) {
            const { count } = await tx.couponUsage.deleteMany({ where: { orderId } });
            if (count > 0) {
                await tx.coupon.updateMany({
                    where: { couponId: order.couponId, usedCount: { gt: 0 } },
                    data: { usedCount: { decrement: 1 } },
                });
            }
        }

        return { orderId, orderStatus: ORDER_STATUS.CANCELED };
    }, ORDER_TRANSACTION_OPTIONS);

// Shipped orders have already left the warehouse, so deleting one is purely a
// record clean-up: stock quantities and serial numbers stay exactly as they are.
export const deleteShippedOrderService = (orderId) =>
    prisma.$transaction(async (tx) => {
        const order = await requireOrder(tx, orderId);
        if (order.orderStatus !== ORDER_STATUS.SHIPPED) {
            throw new OrderError("Only shipped orders can be deleted", 400);
        }
        return deleteOrderRepository(orderId, tx);
    }, ORDER_TRANSACTION_OPTIONS);

// Runs an action for each order independently, so one bad order doesn't
// stop the rest. Returns which succeeded and why the others failed.
export const runForOrders = async (orderIds, action) => {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
        throw new OrderError("Select at least one order", 400);
    }
    const succeeded = [];
    const failed = [];
    for (const orderId of [...new Set(orderIds.map(String))]) {
        try {
            await action(orderId);
            succeeded.push(orderId);
        } catch (error) {
            failed.push({
                orderId,
                message: error instanceof OrderError ? error.message : "Unexpected error",
            });
            if (!(error instanceof OrderError)) console.error(`Order ${orderId} failed:`, error);
        }
    }
    return { succeeded, failed };
};

// ── Reading ──────────────────────────────────────────────────────────────────

export const getOrdersByStatusService = (status, dates) => getOrdersByStatusRepository(status, dates);

export const getOrderByIdService = (orderId) => getOrderByIdRepository(orderId);

export const getOrdersInRangeService = (dates) => getOrdersInRangeRepository(dates);

const MAX_INVOICES_PER_PDF = 200;

// Orders to print, in the order requested. Unknown ids are reported rather
// than silently skipped.
export const getOrdersForInvoiceService = async (orderIds) => {
    const ids = [...new Set((Array.isArray(orderIds) ? orderIds : [orderIds]).map((id) => String(id ?? "").trim()).filter(Boolean))];
    if (ids.length === 0) throw new OrderError("Select at least one order", 400);
    if (ids.length > MAX_INVOICES_PER_PDF) {
        throw new OrderError(`You can download up to ${MAX_INVOICES_PER_PDF} invoices at once`, 400);
    }
    const orders = await getOrdersForInvoiceRepository(ids);
    const missing = ids.filter((id) => !orders.some((order) => order.orderId === id));
    if (missing.length) throw new OrderError(`Order not found: ${missing.join(", ")}`, 404);
    return orders;
};

export const getOrderSummaryService = () => getOrderSummaryRepository();

export const searchOrdersService = (query, tx = prisma) => {
    const text = String(query ?? "").trim();
    if (text.length < 2) throw new OrderError("Type at least 2 characters to search", 400);
    return searchOrdersRepository(text.slice(0, 100), 50, tx);
};

// Customers track an order with its id and the phone used to place it.
export const trackOrderService = async (orderId, phoneInput, tx = prisma) => {
    const id = String(orderId ?? "").trim();
    const phone = normalizePhone(phoneInput);
    if (!id) throw new OrderError("Enter your order ID", 400, "orderId");
    if (!phone) throw new OrderError("Enter the phone number you ordered with", 400, "phone");

    for (const variant of phoneVariants(phone)) {
        const order = await getOrderForTrackingRepository(id, variant, tx);
        if (order) return order;
    }
    // Same message whether the id or the phone is wrong, so ids can't be probed.
    throw new OrderError("No order matches that order ID and phone number", 404);
};
