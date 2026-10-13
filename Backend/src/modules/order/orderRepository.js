import { prisma } from "../../utils/prisma.js";

const generateOrderId = async (tx) => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const dd = String(now.getDate()).padStart(2, "0");

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
    try {
        const orderId = await generateOrderId(tx);

        const response = await tx.order.create({
            data: {
                ...orderData,
                orderId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in addOrderRepository:", error);
        throw error;
    }
}

export const addProductsToOrderRepository = async (products, tx = prisma) => {
    try {
        const response = await tx.orderProduct.createMany({
            data: products.map(product => ({
                orderId: product.orderId,
                productId: product.productId,
                serialNumber: product.serialNumber,
                originalPrice: product.originalPrice,
                discountAmount: product.discountAmount,
                purchasePrice: product.purchasePrice,
            })),
        });

        return response;
    } catch (error) {
        console.log("Error in addProductsToOrderRepository:", error);
        throw error;
    }
}

export const getAllPendingOrdersRepository = async (startDate, endDate, tx = prisma) => {
    try {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end   = new Date(`${endDate}T23:59:59.999Z`);
        const response = await tx.order.findMany({
            where: {
                orderStatus: "PENDING",
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                orderProducts: {
                    include: {
                        product: true,
                        serial: true,
                    },
                },
                customer: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllPendingOrdersRepository:", error);
        throw error;
    }
}

export const getAllAcceptedOrdersRepository = async (startDate, endDate, tx = prisma) => {
    try {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end   = new Date(`${endDate}T23:59:59.999Z`);

        const response = await tx.order.findMany({
            where: {
                orderStatus: "ACCEPTED",
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                orderProducts: {
                    include: {
                        product: true,
                        serial: true,
                    },
                },
                customer: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllAcceptedOrdersRepository:", error);
        throw error;
    }
}

export const getAllShippedOrdersRepository = async (startDate, endDate, tx = prisma) => {
    try {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end   = new Date(`${endDate}T23:59:59.999Z`);
        const response = await tx.order.findMany({
            where: {
                orderStatus: "SHIPPED",
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                orderProducts: {
                    include: {
                        product: true,
                        serial: true,
                    },
                },
                customer: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllShippedOrdersRepository:", error);
        throw error;
    }
}

export const getAllCanceledOrdersRepository = async (startDate, endDate, tx = prisma) => {
    try {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end   = new Date(`${endDate}T23:59:59.999Z`);

        const response = await tx.order.findMany({
            where: {
                orderStatus: "CANCELED",
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                orderProducts: {
                    include: {
                        product: true,
                        serial: true,
                    },
                },
                customer: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllCanceledOrdersRepository:", error);
        throw error;
    }
}

export const acceptOrderRepository = async (orderId, tx = prisma) => {
    try {
        const response = await tx.order.update({
            where: {
                orderId: orderId,
            },
            data: {
                orderStatus: "ACCEPTED",
            },
        });

        return response;
    } catch (error) {
        console.log("Error in acceptOrderRepository:", error);
        throw error;
    }
}

export const shipOrderRepository = async (orderId, tx = prisma) => {
    try {
        const response = await tx.order.update({
            where: {
                orderId: orderId,
            },
            data: {
                orderStatus: "SHIPPED",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in shipOrderRepository:", error);
        throw error;
    }
}

export const cancelOrderRepository = async (orderId, tx = prisma) => {
    try {
        const response = await tx.order.update({
            where: {
                orderId: orderId,
            },
            data: {
                orderStatus: "CANCELED",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in cancelOrderRepository:", error);
        throw error;
    }
}

export const getOrderProductsByOrderIdRepository = async (orderId, tx = prisma) => {
    try {
        const response = await tx.orderProduct.findMany({
            where: {
                orderId: orderId,
            },
            include: {
                product: true,
                serial: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getOrderProductsByOrderIdRepository:", error);
        throw error;
    }
}

export const getOrderByIdRepository = async (orderId, tx = prisma) => {
    try {
        const response = await tx.order.findUnique({
            where: {
                orderId: orderId,
            },
            include: {
                orderProducts: {
                    include: {
                        product: true,
                        serial: true,
                    },
                },
                customer: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getOrderByIdRepository:", error);
        throw error;
    }
}
// Removes an order and the rows that reference it. Stock and serial numbers
// are intentionally left untouched — the caller decides whether that is safe.
export const deleteOrderRepository = async (orderId, tx = prisma) => {
    try {
        await tx.couponUsage.deleteMany({ where: { orderId } });
        await tx.returnRequest.deleteMany({ where: { orderId } });
        await tx.orderProduct.deleteMany({ where: { orderId } });

        const response = await tx.order.delete({
            where: {
                orderId: orderId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteOrderRepository:", error);
        throw error;
    }
}
