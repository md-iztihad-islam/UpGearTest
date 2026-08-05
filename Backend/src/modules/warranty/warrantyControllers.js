import {
    addWarrantyService,
    deleteWarrantyByIdService,
    updateWarrantyByIdService,
    getAllWarrantiesService,
    getWarrantyByIdService,
} from "./warrantyServices.js";

export const addWarrantyController = async (req, res) => {
    try {
        const warrantyData = { ...req.body };

        if (!warrantyData.title) {
            return res.status(400).json({
                success: false,
                message: "Warranty title is required",
            });
        }

        if (!warrantyData.status) {
            return res.status(400).json({
                success: false,
                message: "Warranty status is required",
            });
        }

        const parsedOrderIndex = Number.parseInt(warrantyData.orderIndex, 10);
        if (Number.isNaN(parsedOrderIndex)) {
            return res.status(400).json({
                success: false,
                message: "Warranty orderIndex must be a valid number",
            });
        }

        warrantyData.orderIndex = parsedOrderIndex;

        const response = await addWarrantyService(warrantyData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding warranty",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Warranty added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addWarrantyController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding warranty in controller",
        });
    }
};

export const getAllWarrantiesController = async (req, res) => {
    try {
        const response = await getAllWarrantiesService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching warranties",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllWarrantiesController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching warranties in controller",
        });
    }
};

export const getWarrantyByIdController = async (req, res) => {
    try {
        const warrantyId = req.params.id;

        if (!warrantyId) {
            return res.status(400).json({
                success: false,
                message: "Warranty id is required",
            });
        }

        const response = await getWarrantyByIdService(warrantyId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Warranty not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getWarrantyByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching warranty in controller",
        });
    }
};

export const updateWarrantyByIdController = async (req, res) => {
    try {
        const warrantyId = req.params.id;
        const updateData = { ...req.body };

        if (!warrantyId) {
            return res.status(400).json({
                success: false,
                message: "Warranty id is required",
            });
        }

        if (updateData.orderIndex !== undefined) {
            const parsedOrderIndex = Number.parseInt(updateData.orderIndex, 10);

            if (Number.isNaN(parsedOrderIndex)) {
                return res.status(400).json({
                    success: false,
                    message: "Warranty orderIndex must be a valid number",
                });
            }

            updateData.orderIndex = parsedOrderIndex;
        }

        const response = await updateWarrantyByIdService(warrantyId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating warranty",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Warranty updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateWarrantyByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating warranty in controller",
        });
    }
};

export const deleteWarrantyByIdController = async (req, res) => {
    try {
        const warrantyId = req.params.id;

        if (!warrantyId) {
            return res.status(400).json({
                success: false,
                message: "Warranty id is required",
            });
        }

        const response = await deleteWarrantyByIdService(warrantyId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting warranty",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Warranty deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteWarrantyByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting warranty in controller",
        });
    }
};