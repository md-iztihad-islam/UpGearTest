import { acceptOrderService, addOrderService, cancelAcceptedOrShippedOrderService, cancelOrderService, getAllAcceptedOrdersService, getAllCanceledOrdersService, getAllPendingOrdersService, getAllShippedOrdersService, getOrderByIdService, shipOrderService } from "./orderServices.js";

export const addOrderController = async (req, res) => {
    try {
        const orderReqData = req.body;

        const orderDetails = await addOrderService(orderReqData);

        return res.status(201).json({ 
            message: "Order added successfully", 
            order: orderDetails 
        });
    } catch (error) {
        console.error("Error adding order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getOrderByIdController = async (req, res) => {
    try {
        const { orderId } = req.params;

        const orderDetails = await getOrderByIdService(orderId);

        if (!orderDetails) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({ 
            message: "Order fetched successfully", 
            data: orderDetails 
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllPendingOrdersController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const pendingOrders = await getAllPendingOrdersService(startDate, endDate);

        return res.status(200).json({
            message: "Pending orders fetched successfully",
            orders: pendingOrders
        });
    } catch (error) {
        console.error("Error fetching pending orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllAcceptedOrdersController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;   

        const acceptedOrders = await getAllAcceptedOrdersService(startDate, endDate);

        return res.status(200).json({
            message: "Accepted orders fetched successfully",
            orders: acceptedOrders
        });
    } catch (error) {
        console.error("Error fetching accepted orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllShippedOrdersController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const shippedOrders = await getAllShippedOrdersService(startDate, endDate);

        return res.status(200).json({
            message: "Shipped orders fetched successfully",
            orders: shippedOrders
        });
    } catch (error) {
        console.error("Error fetching shipped orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllCanceledOrdersController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const canceledOrders = await getAllCanceledOrdersService(startDate, endDate);

        return res.status(200).json({
            message: "Canceled orders fetched successfully",
            orders: canceledOrders
        });
    } catch (error) {
        console.error("Error fetching canceled orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const acceptOrderController = async (req, res) => {
    try {
        const { orderId } = req.params;

        const acceptedOrder = await acceptOrderService(orderId);

        return res.status(200).json({
            message: "Order accepted successfully",
            order: acceptedOrder
        });
    } catch (error) {
        console.error("Error accepting order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const shipOrderController = async (req, res) => {
    try {
        const { orderId } = req.params;

        const shippedOrder = await shipOrderService(orderId);

        return res.status(200).json({
            message: "Order shipped successfully",
            order: shippedOrder
        });
    } catch (error) {
        console.error("Error shipping order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const cancelOrderController = async (req, res) => {
    try {
        const { orderId } = req.params;

        const canceledOrder = await cancelOrderService(orderId);

        return res.status(200).json({
            message: "Order canceled successfully",
            order: canceledOrder
        });
    } catch (error) {
        console.error("Error canceling order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const cancelAcceptedOrShippedOrderController = async (req, res) => {
    try {
        const { orderId } = req.params;

        const canceledOrder = await cancelAcceptedOrShippedOrderService(orderId);

        return canceledOrder;
    } catch (error) {
        console.error("Error canceling accepted or shipped order:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


//Accepting and canceling multiple pending orders

export const acceptMultiplePendingOrdersController = async (req, res) => {
    try {
        const { orderIds } = req.body;

        console.log("Order IDs to accept:", orderIds);

        for (const orderId of orderIds) {
            await acceptOrderService(orderId);
        }
    } catch (error) {
        console.error("Error accepting multiple orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const cancelMultiplePendingOrdersController = async (req, res) => {
    try {
        const { orderIds } = req.body;

        console.log("Order IDs to cancel:", orderIds);

        for (const orderId of orderIds) {
            await cancelOrderService(orderId);
        }
    } catch (error) {
        console.error("Error canceling multiple orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
} 

// Shipping and canceling multiple accepted orders

export const shipMultipleAcceptedOrdersController = async (req, res) => {
    try {
        const { orderIds } = req.body;

        for (const orderId of orderIds) {
            await shipOrderService(orderId);
        }

    } catch (error) {
        console.error("Error shipping multiple orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const cancelMultipleAcceptedOrdersController = async (req, res) => {
    try {
        const { orderIds } = req.body;

        for (const orderId of orderIds) {
            await cancelAcceptedOrShippedOrderService(orderId);
        }

    } catch (error) {
        console.error("Error canceling multiple accepted orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Canceling multiple shipped orders

export const cancelMultipleShippedOrdersController = async (req, res) => {
    try {
        const { orderIds } = req.body;

        for (const orderId of orderIds) {
            await cancelAcceptedOrShippedOrderController(orderId);
        }

    } catch (error) {
        console.error("Error canceling multiple shipped orders:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}