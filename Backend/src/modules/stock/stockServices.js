import {
    addStockRepository,
    deleteStockByIdRepository,
    updateStockByIdRepository,
    getAllStocksRepository,
    getStockByIdRepository,
} from "./stockRepositories.js";

export const addStockService = async (stockData) => {
    try {
        const response = await addStockRepository(stockData);
        return response;
    } catch (error) {
        console.log("Error in addStockService:", error);
        return {
            message: "Error adding stock in service",
        };
    }
};

export const deleteStockByIdService = async (stockId) => {
    try {
        const response = await deleteStockByIdRepository(stockId);
        return response;
    } catch (error) {
        console.log("Error in deleteStockByIdService:", error);
        return {
            message: "Error deleting stock in service",
        };
    }
};

export const updateStockByIdService = async (stockId, updateData) => {
    try {
        const response = await updateStockByIdRepository(stockId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateStockByIdService:", error);
        return {
            message: "Error updating stock in service",
        };
    }
};

export const getAllStocksService = async () => {
    try {
        const response = await getAllStocksRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllStocksService:", error);
        return {
            message: "Error fetching stocks in service",
        };
    }
};

export const getStockByIdService = async (stockId) => {
    try {
        const response = await getStockByIdRepository(stockId);
        return response;
    } catch (error) {
        console.log("Error in getStockByIdService:", error);
        return {
            message: "Error fetching stock by ID in service",
        };
    }
};
