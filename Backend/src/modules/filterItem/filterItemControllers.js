import {
    addFilterItemService,
    deleteFilterItemByIdService,
    updateFilterItemByIdService,
    getAllFilterItemsService,
    getFilterItemByIdService,
    getFilterItemBySubCategoryIdService,
} from "./filterItemServices.js";

export const addFilterItemController = async (req, res) => {
    try {
        const filterItemData = { ...req.body };

        if (!filterItemData.filterId) {
            return res.status(400).json({
                success: false,
                message: "FilterItem filterId is required",
            });
        }

        if (!filterItemData.title) {
            return res.status(400).json({
                success: false,
                message: "FilterItem title is required",
            });
        }

        const response = await addFilterItemService(filterItemData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding filter item",
            });
        }

        return res.status(201).json({
            success: true,
            message: "FilterItem added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addFilterItemController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding filter item in controller",
        });
    }
};

export const getAllFilterItemsController = async (req, res) => {
    try {
        const response = await getAllFilterItemsService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching filter items",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllFilterItemsController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching filter items in controller",
        });
    }
};

export const getFilterItemByIdController = async (req, res) => {
    try {
        const filterItemId = req.params.filterItemId;

        if (!filterItemId) {
            return res.status(400).json({
                success: false,
                message: "FilterItem id is required",
            });
        }

        const response = await getFilterItemByIdService(filterItemId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "FilterItem not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getFilterItemByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching filter item in controller",
        });
    }
};

export const updateFilterItemByIdController = async (req, res) => {
    try {
        const filterItemId = req.params.filterItemId;
        const updateData = { ...req.body };

        if (!filterItemId) {
            return res.status(400).json({
                success: false,
                message: "FilterItem id is required",
            });
        }

        if (updateData.orderIndex !== undefined) {
            const parsedOrderIndex = Number.parseInt(updateData.orderIndex, 10);
            if (Number.isNaN(parsedOrderIndex)) {
                return res.status(400).json({
                    success: false,
                    message: "FilterItem orderIndex must be a valid number",
                });
            }
            updateData.orderIndex = parsedOrderIndex;
        }

        const response = await updateFilterItemByIdService(filterItemId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating filter item",
            });
        }

        return res.status(200).json({
            success: true,
            message: "FilterItem updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateFilterItemByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating filter item in controller",
        });
    }
};

export const deleteFilterItemByIdController = async (req, res) => {
    try {
        const filterItemId = req.params.filterItemId;

        if (!filterItemId) {
            return res.status(400).json({
                success: false,
                message: "FilterItem id is required",
            });
        }

        const response = await deleteFilterItemByIdService(filterItemId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting filter item",
            });
        }

        return res.status(200).json({
            success: true,
            message: "FilterItem deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteFilterItemByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting filter item in controller",
        });
    }
};

export const getFilterItemBySubCategoryIdController = async (req, res) => {
    try {
        const subCategoryId = req.params.subCategoryId;

        if (!subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "SubCategory id is required",
            });
        }

        const response = await getFilterItemBySubCategoryIdService(subCategoryId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching filter items by sub category id",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getFilterItemBySubCategoryIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching filter items by sub category id in controller",
        });
    }
}