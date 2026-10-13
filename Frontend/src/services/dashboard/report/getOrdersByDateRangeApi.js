import axiosInstance from "@/helpers/dashboard/axiosInstance";

const STATUS_LABELS = { PENDING: "Pending", ACCEPTED: "Accepted", SHIPPED: "Shipped", CANCELED: "Cancelled" };

// The report page works with one entry per product (quantity, selling price,
// buying price). Orders store one row per unit with the stock it came from,
// so group them here and use the real purchase cost of the units sold.
const toReportOrder = (order) => {
    const byProduct = new Map();
    (order.orderProducts || []).forEach((unit) => {
        if (!byProduct.has(unit.productId)) {
            byProduct.set(unit.productId, {
                productId: unit.productId,
                productName: [unit.product?.title, unit.product?.subTitle].filter(Boolean).join(" ") || unit.productId,
                productQuantity: 0,
                productPrice: Number(unit.purchasePrice) || 0,
                costTotal: 0,
                costedUnits: 0,
            });
        }
        const line = byProduct.get(unit.productId);
        line.productQuantity += 1;
        const cost = unit.serial?.stock?.purchasingPrice;
        if (cost !== undefined && cost !== null) {
            line.costTotal += Number(cost);
            line.costedUnits += 1;
        }
    });

    return {
        ...order,
        orderStatus: STATUS_LABELS[order.orderStatus] || order.orderStatus,
        subTotal: Number(order.subTotal) || 0,
        discount: Number(order.discount) || 0,
        shippingCost: Number(order.deliveryCharge) || 0,
        totalBill: Number(order.totalBill) || 0,
        totalAmount: Number(order.totalBill) || 0,
        customerName: order.customer?.name,
        customerPhone: order.customer?.phone,
        customerEmail: order.customer?.email,
        products: [...byProduct.values()].map(({ costTotal, costedUnits, ...line }) => ({
            ...line,
            // average buying price of the units actually sold
            stockId: costedUnits > 0 ? { price: costTotal / costedUnits } : null,
        })),
    };
};

const getOrdersByDateRangeApi = async (startDate, endDate) => {
    const response = await axiosInstance.get(`/order/date-range`, { params: { startDate, endDate } });
    return { ...response.data, data: (response.data?.data || []).map(toReportOrder) };
};

export default getOrdersByDateRangeApi;
