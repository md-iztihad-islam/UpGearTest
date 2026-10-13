import { prisma } from "../../utils/prisma.js";

// Orders are shown to staff in Bangladesh time, so a date filter like
// "2026-10-13" means that whole day in UTC+6, not in UTC.
const BD_OFFSET = "+06:00";

// What the dashboard needs for an order — never the customer's password/OTP.
export const ORDER_INCLUDE = {
    customer: {
        select: { customerId: true, name: true, phone: true, email: true },
    },
    coupon: { select: { couponId: true, code: true } },
    store: { select: { storeId: true, title: true } },
    employee: { select: { employeeId: true, name: true } },
    orderProducts: {
        orderBy: { createdAt: "asc" },
        include: {
            product: {
                select: {
                    productId: true,
                    title: true,
                    subTitle: true,
                    slug: true,
                    bannerImageURL: true,
                    images: { orderBy: { createdAt: "asc" }, take: 1, select: { imageURL: true } },
                },
            },
        },
    },
};

// What a customer may see when tracking their own order.
const TRACKING_SELECT = {
    orderId: true,
    orderStatus: true,
    orderType: true,
    createdAt: true,
    updatedAt: true,
    insideDhaka: true,
    deliveryAddress: true,
    paymentMethod: true,
    paymentStatus: true,
    subTotal: true,
    deliveryCharge: true,
    discount: true,
    totalBill: true,
    paidAmount: true,
    dueAmount: true,
    deliveryNote: true,
    customer: { select: { name: true, phone: true } },
    orderProducts: {
        orderBy: { createdAt: "asc" },
        select: {
            orderProductId: true,
            productId: true,
            originalPrice: true,
            purchasePrice: true,
            product: {
                select: {
                    title: true,
                    subTitle: true,
                    slug: true,
                    bannerImageURL: true,
                    images: { orderBy: { createdAt: "asc" }, take: 1, select: { imageURL: true } },
                },
            },
        },
    },
};

const generateOrderId = async (tx) => {
    // Order ids are MMYYDD + a 3-digit daily sequence, in Bangladesh time.
    const now = new Date(Date.now() + 6 * 60 * 60 * 1000);
    const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const yy = String(now.getUTCFullYear()).slice(-2);
    const dd = String(now.getUTCDate()).padStart(2, "0");

    const datePrefix = `${mm}${yy}${dd}`;

    // Continue from the highest sequence already used today rather than
    // counting today's orders — orders can be deleted, and a count would
    // then hand out an orderId that still exists.
    const todaysOrders = await tx.order.findMany({
        where: { orderId: { startsWith: datePrefix } },
        select: { orderId: true },
    });

    const lastSequence = todaysOrders.reduce((max, { orderId }) => {
        const sequence = Number.parseInt(orderId.slice(datePrefix.length), 10);
        return Number.isNaN(sequence) ? max : Math.max(max, sequence);
    }, 0);

    const sequenceNumber = String(lastSequence + 1).padStart(3, "0"); // 001, 002, ...

    return `${datePrefix}${sequenceNumber}`;
};

export const addOrderRepository = async (orderData, tx = prisma) => {
    const orderId = await generateOrderId(tx);
    return tx.order.create({
        data: { ...orderData, orderId },
    });
};

export const addProductsToOrderRepository = async (products, tx = prisma) => {
    return tx.orderProduct.createMany({ data: products });
};

const dateRangeFilter = (startDate, endDate) => {
    const range = {};
    const start = startDate ? new Date(`${startDate}T00:00:00.000${BD_OFFSET}`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59.999${BD_OFFSET}`) : null;
    if (start && !Number.isNaN(start.getTime())) range.gte = start;
    if (end && !Number.isNaN(end.getTime())) range.lte = end;
    return Object.keys(range).length ? { createdAt: range } : {};
};

export const getOrdersByStatusRepository = async (orderStatus, { startDate, endDate } = {}, tx = prisma) => {
    return tx.order.findMany({
        where: { orderStatus, ...dateRangeFilter(startDate, endDate) },
        include: ORDER_INCLUDE,
        orderBy: { createdAt: "desc" },
    });
};

export const getOrderByIdRepository = async (orderId, tx = prisma) => {
    return tx.order.findUnique({
        where: { orderId },
        include: ORDER_INCLUDE,
    });
};

// Units of an order with the stock each serial came from.
export const getOrderUnitsRepository = async (orderId, tx = prisma) => {
    const rows = await tx.orderProduct.findMany({
        where: { orderId },
        select: { serialNumber: true, serial: { select: { stockId: true } } },
    });
    return rows
        .filter((row) => row.serialNumber)
        .map((row) => ({ serialNumber: row.serialNumber, stockId: row.serial?.stockId }));
};

// Moves an order from one of `fromStatuses` to `toStatus`. The update is
// conditional on the status we read, so two staff clicking at once can't
// apply the same transition (and its stock movement) twice.
export const transitionOrderStatusRepository = async (orderId, fromStatus, toStatus, tx = prisma) => {
    const { count } = await tx.order.updateMany({
        where: { orderId, orderStatus: fromStatus },
        data: { orderStatus: toStatus },
    });
    return count === 1;
};

// Dashboard search: order id, customer phone or customer name.
export const searchOrdersRepository = async (query, limit = 50, tx = prisma) => {
    const text = query.trim();
    const digits = text.replace(/\D/g, "");
    const or = [
        { orderId: { startsWith: text } },
        { customer: { name: { contains: text, mode: "insensitive" } } },
    ];
    if (digits.length >= 4) {
        // stored phones are 01XXXXXXXXX; accept 8801… / +8801… input too
        const localDigits = digits.startsWith("880") ? digits.slice(2) : digits;
        or.push({ customer: { phone: { contains: localDigits } } });
    }

    return tx.order.findMany({
        where: { OR: or },
        include: ORDER_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: limit,
    });
};

// Public tracking: the order is only returned when the phone matches.
export const getOrderForTrackingRepository = async (orderId, phone, tx = prisma) => {
    return tx.order.findFirst({
        where: { orderId, customer: { phone } },
        select: TRACKING_SELECT,
    });
};

// Removes an order and the rows that reference it. Stock and serial numbers
// are intentionally left untouched — the caller decides whether that is safe.
export const deleteOrderRepository = async (orderId, tx = prisma) => {
    await tx.couponUsage.deleteMany({ where: { orderId } });
    await tx.returnRequest.deleteMany({ where: { orderId } });
    await tx.orderProduct.deleteMany({ where: { orderId } });
    return tx.order.delete({ where: { orderId } });
};

// Orders placed in a date range (any status), with each unit's purchase cost
// so reports can work out profit.
export const getOrdersInRangeRepository = async ({ startDate, endDate } = {}, tx = prisma) => {
    return tx.order.findMany({
        where: dateRangeFilter(startDate, endDate),
        orderBy: { createdAt: "desc" },
        include: {
            customer: { select: { customerId: true, name: true, phone: true, email: true } },
            orderProducts: {
                select: {
                    productId: true,
                    purchasePrice: true,
                    product: { select: { title: true, subTitle: true } },
                    serial: { select: { stock: { select: { purchasingPrice: true } } } },
                },
            },
        },
    });
};

// Numbers for the dashboard home cards.
export const getOrderSummaryRepository = async (tx = prisma) => {
    const [pendingCount, sold] = await Promise.all([
        tx.order.count({ where: { orderStatus: "PENDING" } }),
        tx.order.aggregate({
            where: { orderStatus: { in: ["ACCEPTED", "SHIPPED"] } },
            _sum: { subTotal: true, discount: true },
            _count: true,
        }),
    ]);
    // Revenue excludes delivery charges (they go to the courier).
    const revenue = Number(sold._sum.subTotal || 0) - Number(sold._sum.discount || 0);
    return { pendingCount, revenue, soldOrders: sold._count };
};

// Everything an invoice shows, for one or more orders (returned in the
// order the ids were given).
export const getOrdersForInvoiceRepository = async (orderIds, tx = prisma) => {
    const orders = await tx.order.findMany({
        where: { orderId: { in: orderIds } },
        include: {
            customer: { select: { name: true, phone: true, email: true } },
            coupon: { select: { code: true } },
            store: { select: { title: true } },
            orderProducts: {
                orderBy: { createdAt: "asc" },
                select: {
                    productId: true,
                    serialNumber: true,
                    originalPrice: true,
                    discountAmount: true,
                    purchasePrice: true,
                    product: {
                        select: {
                            title: true,
                            subTitle: true,
                            group: { select: { warranty: { select: { title: true } } } },
                        },
                    },
                },
            },
        },
    });
    const byId = new Map(orders.map((order) => [order.orderId, order]));
    return orderIds.map((id) => byId.get(id)).filter(Boolean);
};
