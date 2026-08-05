import {
    addSpecificationService,
    deleteSpecificationByIdService,
    updateSpecificationByIdService,
    getAllSpecificationsService,
    getSpecificationByIdService,
    getSpecificationBySubCategoryIdService,
} from "./specificationServices.js";

export const addSpecificationController = async (req, res) => {
    try {
        const specificationData = { ...req.body };

        if (!specificationData.subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "Specification subCategoryId is required",
            });
        }

        if (!specificationData.title) {
            return res.status(400).json({
                success: false,
                message: "Specification title is required",
            });
        }

        const response = await addSpecificationService(specificationData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding specification",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Specification added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addSpecificationController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding specification in controller",
        });
    }
};

export const getAllSpecificationsController = async (req, res) => {
    try {
        const response = await getAllSpecificationsService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching specifications",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllSpecificationsController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching specifications in controller",
        });
    }
};

export const getSpecificationByIdController = async (req, res) => {
    try {
        const specificationId = req.params.specificationId;

        if (!specificationId) {
            return res.status(400).json({
                success: false,
                message: "Specification id is required",
            });
        }

        const response = await getSpecificationByIdService(specificationId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Specification not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getSpecificationByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching specification in controller",
        });
    }
};

export const updateSpecificationByIdController = async (req, res) => {
    try {
        const specificationId = req.params.specificationId;
        const updateData = { ...req.body };

        if (!specificationId) {
            return res.status(400).json({
                success: false,
                message: "Specification id is required",
            });
        }

        if (updateData.orderIndex !== undefined) {
            const parsedOrderIndex = Number.parseInt(updateData.orderIndex, 10);
            if (Number.isNaN(parsedOrderIndex)) {
                return res.status(400).json({
                    success: false,
                    message: "Specification orderIndex must be a valid number",
                });
            }
            updateData.orderIndex = parsedOrderIndex;
        }

        const response = await updateSpecificationByIdService(specificationId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating specification",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Specification updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateSpecificationByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating specification in controller",
        });
    }
};

export const deleteSpecificationByIdController = async (req, res) => {
    try {
        const specificationId = req.params.specificationId;

        if (!specificationId) {
            return res.status(400).json({
                success: false,
                message: "Specification id is required",
            });
        }

        const response = await deleteSpecificationByIdService(specificationId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting specification",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Specification deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteSpecificationByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting specification in controller",
        });
    }
};

export const getSpecificationBySubCategoryIdController = async (req, res) => {
    try {
        const subCategoryId = req.params.subCategoryId;

        if (!subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "SubCategory id is required",
            });
        }

        const response = await getSpecificationBySubCategoryIdService(subCategoryId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Specifications not found for the given SubCategory ID",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getSpecificationBySubCategoryIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching specifications by SubCategory ID in controller",
        });
    }
};