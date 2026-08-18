import {
    addStoreService,
    deleteStoreByIdService,
    updateStoreByIdService,
    getAllStoresService,
    getStoreByIdService,
} from "./storeServices.js";

export const addStoreController = async (req, res) => {
    try {
        const storeData = { ...req.body };

        console.log("Received store data:", storeData);

        if (!storeData.title) {
            return res.status(400).json({
                success: false,
                message: "Store title is required",
            });
        }

        if (!storeData.address) {
            return res.status(400).json({
                success: false,
                message: "Store address is required",
            });
        }

        if (!storeData.phone) {
            return res.status(400).json({
                success: false,
                message: "Store phone is required",
            });
        }

        if (!storeData.email) {
            return res.status(400).json({
                success: false,
                message: "Store email is required",
            });
        }

        if (!storeData.password) {
            return res.status(400).json({
                success: false,
                message: "Store password is required",
            });
        }

        if (!storeData.status) {
            return res.status(400).json({
                success: false,
                message: "Store status is required",
            });
        }

        const response = await addStoreService(storeData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding store",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Store added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addStoreController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error adding store in controller",
        });
    }
};

export const getAllStoresController = async (req, res) => {
    try {
        const response = await getAllStoresService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching stores",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllStoresController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching stores in controller",
        });
    }
};

export const getStoreByIdController = async (req, res) => {
    try {
        const storeId = req.params.storeId;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: "Store id is required",
            });
        }

        const response = await getStoreByIdService(storeId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Store not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getStoreByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching store in controller",
        });
    }
};

export const updateStoreByIdController = async (req, res) => {
    try {
        const storeId = req.params.storeId;
        const updateData = { ...req.body };

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: "Store id is required",
            });
        }

        if (updateData.orderIndex !== undefined) {
            const parsedOrderIndex = Number.parseInt(updateData.orderIndex, 10);
            if (Number.isNaN(parsedOrderIndex)) {
                return res.status(400).json({
                    success: false,
                    message: "Store orderIndex must be a valid number",
                });
            }
            updateData.orderIndex = parsedOrderIndex;
        }

        const response = await updateStoreByIdService(storeId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating store",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Store updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateStoreByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating store in controller",
        });
    }
};

export const deleteStoreByIdController = async (req, res) => {
    try {
        const storeId = req.params.storeId;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: "Store id is required",
            });
        }

        const response = await deleteStoreByIdService(storeId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting store",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Store deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteStoreByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting store in controller",
        });
    }
};
