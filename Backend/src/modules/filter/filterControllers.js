import {
    addFilterService,
    deleteFilterByIdService,
    updateFilterByIdService,
    getAllFiltersService,
    getFilterByIdService,
    getFiltersBySubCategoryIdService,
} from "./filterServices.js";

export const addFilterController = async (req, res) => {
    try {
        const filterData = { ...req.body };

        // console.log("Received filter data:", filterData);

        if (!filterData.subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "Filter subCategoryId is required",
            });
        }

        if (!filterData.title) {
            return res.status(400).json({
                success: false,
                message: "Filter title is required",
            });
        }

        

        const response = await addFilterService(filterData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding filter",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Filter added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addFilterController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding filter in controller",
        });
    }
};

export const getAllFiltersController = async (req, res) => {
    try {
        const response = await getAllFiltersService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching filters",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllFiltersController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching filters in controller",
        });
    }
};

export const getFilterByIdController = async (req, res) => {
    try {
        const filterId = req.params.filterId;

        if (!filterId) {
            return res.status(400).json({
                success: false,
                message: "Filter id is required",
            });
        }

        const response = await getFilterByIdService(filterId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Filter not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getFilterByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching filter in controller",
        });
    }
};

export const updateFilterByIdController = async (req, res) => {
    try {
        const filterId = req.params.filterId;
        const updateData = { ...req.body };

        if (!filterId) {
            return res.status(400).json({
                success: false,
                message: "Filter id is required",
            });
        }

        if (updateData.orderIndex !== undefined) {
            const parsedOrderIndex = Number.parseInt(updateData.orderIndex, 10);
            if (Number.isNaN(parsedOrderIndex)) {
                return res.status(400).json({
                    success: false,
                    message: "Filter orderIndex must be a valid number",
                });
            }
            updateData.orderIndex = parsedOrderIndex;
        }

        const response = await updateFilterByIdService(filterId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating filter",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Filter updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateFilterByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating filter in controller",
        });
    }
};

export const deleteFilterByIdController = async (req, res) => {
    try {
        const filterId = req.params.filterId;

        if (!filterId) {
            return res.status(400).json({
                success: false,
                message: "Filter id is required",
            });
        }

        const response = await deleteFilterByIdService(filterId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting filter",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Filter deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteFilterByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting filter in controller",
        });
    }
};

export const getFiltersBySubCategoryIdController = async (req, res) => {
    try {
        const subCategoryId = req.params.subCategoryId;

        if (!subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "Sub-category id is required",
            });
        }

        const response = await getFiltersBySubCategoryIdService(subCategoryId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching filters by sub-category ID",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getFiltersBySubCategoryIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching filters by sub-category ID in controller",
        });
    }
};