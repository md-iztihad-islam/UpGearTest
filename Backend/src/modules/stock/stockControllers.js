import {
    addStockService,
    deleteStockByIdService,
    updateStockByIdService,
    getAllStocksService,
    getStockByIdService,
} from "./stockServices.js";

const normalizeDecimal = (value) => {
    if (value === undefined || value === null) return undefined;
    return typeof value === "string" ? parseFloat(value) : value;
};

export const addStockController = async (req, res) => {
    try {
        const stockData = { ...req.body };

        if (!stockData.productId) {
            return res.status(400).json({
                success: false,
                message: "Stock productId is required",
            });
        }

        if (stockData.quantity === undefined || stockData.quantity === null) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity is required",
            });
        }

        if (stockData.remaining === undefined || stockData.remaining === null) {
            return res.status(400).json({
                success: false,
                message: "Stock remaining is required",
            });
        }

        if (!stockData.purchasingPrice) {
            return res.status(400).json({
                success: false,
                message: "Stock purchasingPrice is required",
            });
        }

        if (!stockData.status) {
            return res.status(400).json({
                success: false,
                message: "Stock status is required",
            });
        }

        const parsedQuantity = Number.parseInt(stockData.quantity, 10);
        if (Number.isNaN(parsedQuantity)) {
            return res.status(400).json({
                success: false,
                message: "Stock quantity must be a valid number",
            });
        }

        const parsedRemaining = Number.parseInt(stockData.remaining, 10);
        if (Number.isNaN(parsedRemaining)) {
            return res.status(400).json({
                success: false,
                message: "Stock remaining must be a valid number",
            });
        }

        stockData.quantity = parsedQuantity;
        stockData.remaining = parsedRemaining;
        stockData.purchasingPrice = normalizeDecimal(stockData.purchasingPrice);

        const response = await addStockService(stockData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding stock",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Stock added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addStockController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding stock in controller",
        });
    }
};

export const getAllStocksController = async (req, res) => {
    try {
        const response = await getAllStocksService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching stocks",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllStocksController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching stocks in controller",
        });
    }
};

export const getStockByIdController = async (req, res) => {
    try {
        const stockId = req.params.stockId;

        if (!stockId) {
            return res.status(400).json({
                success: false,
                message: "Stock id is required",
            });
        }

        const response = await getStockByIdService(stockId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Stock not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getStockByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching stock in controller",
        });
    }
};

export const updateStockByIdController = async (req, res) => {
    try {
        const stockId = req.params.stockId;
        const updateData = { ...req.body };

        if (!stockId) {
            return res.status(400).json({
                success: false,
                message: "Stock id is required",
            });
        }

        if (updateData.quantity !== undefined) {
            const parsedQuantity = Number.parseInt(updateData.quantity, 10);
            if (Number.isNaN(parsedQuantity)) {
                return res.status(400).json({
                    success: false,
                    message: "Stock quantity must be a valid number",
                });
            }
            updateData.quantity = parsedQuantity;
        }

        if (updateData.remaining !== undefined) {
            const parsedRemaining = Number.parseInt(updateData.remaining, 10);
            if (Number.isNaN(parsedRemaining)) {
                return res.status(400).json({
                    success: false,
                    message: "Stock remaining must be a valid number",
                });
            }
            updateData.remaining = parsedRemaining;
        }

        updateData.purchasingPrice = normalizeDecimal(updateData.purchasingPrice);

        const response = await updateStockByIdService(stockId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating stock",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateStockByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating stock in controller",
        });
    }
};

export const deleteStockByIdController = async (req, res) => {
    try {
        const stockId = req.params.stockId;

        if (!stockId) {
            return res.status(400).json({
                success: false,
                message: "Stock id is required",
            });
        }

        const response = await deleteStockByIdService(stockId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting stock",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Stock deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteStockByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting stock in controller",
        });
    }
};
