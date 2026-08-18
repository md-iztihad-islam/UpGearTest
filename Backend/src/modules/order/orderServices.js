// import { prisma } from "../../utils/prisma.js";
// import { getCustomerByPhoneRepository } from "../customer/customerRepositories.js"
// import { addCustomerService } from "../customer/customerServices.js";
// import { decreaseOnlyRemainingStockQuantityRepository, decreaseRemainingStockQuantityRepository, releaseReservedStockQuantityRepository, reserveStockQuantityRepository } from "../stock/stockRepositories.js";
// import { acceptOrderRepository, addOrderRepository, addProductsToOrderRepository, cancelOrderRepository, getAllAcceptedOrdersRepository, getAllCanceledOrdersRepository, getAllPendingOrdersRepository, getAllShippedOrdersRepository, getOrderByIdRepository, getOrderProductsByOrderIdRepository, shipOrderRepository } from "./orderRepository.js";


// export const addOrderService = async (orderReqData) => {
//     try {

//         //All of these operations should be done in a transaction to ensure data integrity. If any operation fails, the entire transaction should be rolled back.

//         const orderDetails = await prisma.$transaction(async (tx) => {
        

//             console.log("Order Request Data:", orderReqData);
//             const customerData = {
//                 name: orderReqData.customerName,
//                 email: orderReqData.customerEmail,
//                 phone: orderReqData.customerPhone,
//             }

//             let customer;

//             customer = await getCustomerByPhoneRepository(customerData.phone, tx);

//             if(!customer) {
//                 customer = await addCustomerService(customerData, tx);
//             }

//             const orderData = {
//                 customerId: customer.customerId,
//                 insideDhaka: orderReqData.insideDhaka,
//                 deliveryAddress: orderReqData.deliveryAddress,
//                 paymentMethod: orderReqData.paymentMethod,
//                 subTotal: orderReqData.subTotal,
//                 deliveryCharge: orderReqData.deliveryCharge,
//                 discount: orderReqData.discount,
//                 totalBill: orderReqData.totalBill,
//                 orderStatus: orderReqData.orderStatus || "PENDING",
//                 couponId: orderReqData.couponId,
//                 storeId: orderReqData.storeId,
//                 employeeId: orderReqData.employeeId,
//                 paymentStatus: orderReqData.paymentStatus,
//                 paidAmount: orderReqData.paidAmount,
//                 dueAmount: orderReqData.dueAmount,
//                 transactionId: orderReqData.transactionId,
//                 invoiceURL: orderReqData.invoiceURL,
//                 orderType: orderReqData.orderType,
//                 deliveryNote: orderReqData.deliveryNote,
//                 sellerNote: orderReqData.sellerNote,
//             }

//             const order = await addOrderRepository(orderData, tx);

//             let orderItems = [];

//             for (const item of orderReqData.products) {
//                 const { reservedStockIds, reservedSerialNumbers } = await reserveStockQuantityRepository(item.productId, 1, tx);
//                 const orderItemData = {
//                     orderId: order.orderId,
//                     productId: item.productId,
//                     serialNumber: item.serialNumber || reservedSerialNumbers[0], // Use the reserved serial number if not provided
//                     originalPrice: item.originalPrice,
//                     discountAmount: item.discountAmount,
//                     purchasePrice: item.purchasePrice,
//                 }
                

//                 orderItems.push(orderItemData);
//             }

//             const orderProducts = await addProductsToOrderRepository(orderItems, tx);

//             const orderDetail = {
//                 orderData: order,
//                 products: orderProducts,
//             }

//             return orderDetail;
//         }, {
//             timeout: 10000, // 10 seconds timeout for the transaction
//         })
        
//         return orderDetails;
//     } catch (error) {
//         console.log("Error in addOrderService:", error);
//         throw error;
//     }
// }

// export const getOrderByIdService = async (orderId) => {
//     try {
//         const orderDetails = await getOrderByIdRepository(orderId);
//         return orderDetails;
//     } catch (error) {
//         console.log("Error in getOrderByIdService:", error);
//         throw error;
//     }
// }

// export const getAllPendingOrdersService = async (startDate, endDate) => {
//     try {
//         const pendingOrders = await getAllPendingOrdersRepository(startDate, endDate);
//         return pendingOrders;
//     } catch (error) {
//         console.log("Error in getAllPendingOrdersService:", error);
//         throw error;
//     }
// }

// export const getAllAcceptedOrdersService = async (startDate, endDate) => {
//     try {
//         const acceptedOrders = await getAllAcceptedOrdersRepository(startDate, endDate);
//         return acceptedOrders;
//     } catch (error) {
//         console.log("Error in getAllAcceptedOrdersService:", error);
//         throw error;
//     }
// }

// export const getAllShippedOrdersService = async (startDate, endDate) => {
//     try {
//         const shippedOrders = await getAllShippedOrdersRepository(startDate, endDate);
//         return shippedOrders;
//     } catch (error) {
//         console.log("Error in getAllShippedOrdersService:", error);
//         throw error;
//     }
// }

// export const getAllCanceledOrdersService = async (startDate, endDate) => {
//     try {
//         const canceledOrders = await getAllCanceledOrdersRepository(startDate, endDate);
//         return canceledOrders;
//     } catch (error) {
//         console.log("Error in getAllCanceledOrdersService:", error);
//         throw error;
//     }
// }

// export const acceptOrderService = async (orderId) => {
//     try {
//         const acceptedOrder = await prisma.$transaction(async (tx) => {

//             const order = await acceptOrderRepository(orderId, tx);

//             const orderProducts = await getOrderProductsByOrderIdRepository(orderId, tx);

//             for (const product of orderProducts) {
//                 const serialNumber = product.serial.serialNumber;
//                 const stockId = serialNumber.substring(6, 12);
//                 await decreaseRemainingStockQuantityRepository(stockId, tx);
//             }

//             return order;
//         });

//         return acceptedOrder;
//     } catch (error) {
//         console.log("Error in acceptOrderService:", error);
//         throw error;
//     }
// }

// export const shipOrderService = async (orderId) => {
//     try {
//         const shippedOrder = await shipOrderRepository(orderId);
//         return shippedOrder;
//     } catch (error) {
//         console.log("Error in shipOrderService:", error);
//         throw error;
//     }
// }

// export const cancelOrderService = async (orderId) => {
//     try {
//         const canceledOrder = await prisma.$transaction(async (tx) => {

//             const order = await cancelOrderRepository(orderId, tx);

//             const orderProducts = await getOrderProductsByOrderIdRepository(orderId, tx);

//             for (const product of orderProducts) {
//                 const serialNumber = product.serial.serialNumber;
                
//                 const stockId = serialNumber.substring(6, 12);
                
//                 await releaseReservedStockQuantityRepository(stockId, serialNumber, tx);             
//             }

//             return order;
//         });

//         return canceledOrder;
//     } catch (error) {
//         console.log("Error in cancelOrderService:", error);
//         throw error;
//     }
// }

// export const cancelAcceptedOrShippedOrderService = async (orderId) => {
//     try {
//         const canceledOrder = await prisma.$transaction(async (tx) => {

//             const order = await cancelOrderRepository(orderId, tx);

//             const orderProducts = await getOrderProductsByOrderIdRepository(orderId, tx);

//             for (const product of orderProducts) {
//                 const serialNumber = product.serial.serialNumber;
                
//                 const stockId = serialNumber.substring(6, 12);

//                 await decreaseOnlyRemainingStockQuantityRepository(stockId, serialNumber, tx);
//             }

//             return order;
//         });

//         return canceledOrder;
//     } catch(error) {
//         console.log("Error canceling accepted or shipped order");
//         throw error;
//     }
// }


import { prisma } from "../../utils/prisma.js";
import { getCustomerByPhoneRepository } from "../customer/customerRepositories.js";
import { addCustomerService } from "../customer/customerServices.js";
import {
    decreaseOnlyRemainingStockQuantityRepository,
    decreaseRemainingStockQuantityRepository,
    releaseReservedStockQuantityRepository,
    reserveStockQuantityRepository,
} from "../stock/stockRepositories.js";
import {
    acceptOrderRepository,
    addOrderRepository,
    addProductsToOrderRepository,
    cancelOrderRepository,
    getAllAcceptedOrdersRepository,
    getAllCanceledOrdersRepository,
    getAllPendingOrdersRepository,
    getAllShippedOrdersRepository,
    getOrderByIdRepository,
    getOrderProductsByOrderIdRepository,
    shipOrderRepository,
} from "./orderRepository.js";

const ORDER_TRANSACTION_TIMEOUT_MS = 15000;

export const addOrderService = async (orderReqData) => {
    return prisma.$transaction(async (tx) => {
        const customerData = {
            name: orderReqData.customerName,
            email: orderReqData.customerEmail,
            phone: orderReqData.customerPhone,
        };

        let customer = await getCustomerByPhoneRepository(customerData.phone, tx);
        if (!customer) {
            customer = await addCustomerService(customerData, tx);
        }

        const orderData = {
            customerId: customer.customerId,
            insideDhaka: orderReqData.insideDhaka,
            deliveryAddress: orderReqData.deliveryAddress,
            paymentMethod: orderReqData.paymentMethod,
            subTotal: orderReqData.subTotal,
            deliveryCharge: orderReqData.deliveryCharge,
            discount: orderReqData.discount,
            totalBill: orderReqData.totalBill,
            orderStatus: orderReqData.orderStatus || "PENDING",
            couponId: orderReqData.couponId,
            storeId: orderReqData.storeId,
            employeeId: orderReqData.employeeId,
            paymentStatus: orderReqData.paymentStatus,
            paidAmount: orderReqData.paidAmount,
            dueAmount: orderReqData.dueAmount,
            transactionId: orderReqData.transactionId,
            invoiceURL: orderReqData.invoiceURL,
            orderType: orderReqData.orderType,
            deliveryNote: orderReqData.deliveryNote,
            sellerNote: orderReqData.sellerNote,
        };

        const order = await addOrderRepository(orderData, tx);

        // Reservation still happens per line item (each product may draw
        // from a different stock), but a failure here now throws a real,
        // descriptive error instead of returning undefined — it will
        // correctly abort and roll back the whole order.
        const orderItems = [];
        for (const item of orderReqData.products) {
            const { reservedSerialNumbers } = await reserveStockQuantityRepository(
                item.productId,
                1,
                tx,
            );

            orderItems.push({
                orderId: order.orderId,
                productId: item.productId,
                serialNumber: item.serialNumber || reservedSerialNumbers[0],
                originalPrice: item.originalPrice,
                discountAmount: item.discountAmount,
                purchasePrice: item.purchasePrice,
            });
        }

        const orderProducts = await addProductsToOrderRepository(orderItems, tx);

        return { orderData: order, products: orderProducts };
    }, {
        timeout: ORDER_TRANSACTION_TIMEOUT_MS,
    });
};

export const getOrderByIdService = async (orderId) => {
    return getOrderByIdRepository(orderId);
};

export const getAllPendingOrdersService = async (startDate, endDate) => {
    return getAllPendingOrdersRepository(startDate, endDate);
};

export const getAllAcceptedOrdersService = async (startDate, endDate) => {
    return getAllAcceptedOrdersRepository(startDate, endDate);
};

export const getAllShippedOrdersService = async (startDate, endDate) => {
    return getAllShippedOrdersRepository(startDate, endDate);
};

export const getAllCanceledOrdersService = async (startDate, endDate) => {
    return getAllCanceledOrdersRepository(startDate, endDate);
};

export const acceptOrderService = async (orderId) => {
    return prisma.$transaction(async (tx) => {
        const order = await acceptOrderRepository(orderId, tx);
        const orderProducts = await getOrderProductsByOrderIdRepository(orderId, tx);

        for (const product of orderProducts) {
            const stockId = product.serial.serialNumber.substring(6, 12);
            await decreaseRemainingStockQuantityRepository(stockId, tx);
        }

        return order;
    }, {
        timeout: ORDER_TRANSACTION_TIMEOUT_MS,
    });
};

export const shipOrderService = async (orderId) => {
    return shipOrderRepository(orderId);
};

export const cancelOrderService = async (orderId) => {
    return prisma.$transaction(async (tx) => {
        const order = await cancelOrderRepository(orderId, tx);
        const orderProducts = await getOrderProductsByOrderIdRepository(orderId, tx);

        for (const product of orderProducts) {
            const stockId = product.serial.serialNumber.substring(6, 12);
            await releaseReservedStockQuantityRepository(stockId, product.serial.serialNumber, tx);
        }

        return order;
    }, {
        timeout: ORDER_TRANSACTION_TIMEOUT_MS,
    });
};

export const cancelAcceptedOrShippedOrderService = async (orderId) => {
    return prisma.$transaction(async (tx) => {
        const order = await cancelOrderRepository(orderId, tx);
        const orderProducts = await getOrderProductsByOrderIdRepository(orderId, tx);

        for (const product of orderProducts) {
            const stockId = product.serial.serialNumber.substring(6, 12);
            await decreaseOnlyRemainingStockQuantityRepository(stockId, product.serial.serialNumber, tx);
        }

        return order;
    }, {
        timeout: ORDER_TRANSACTION_TIMEOUT_MS,
    });
};