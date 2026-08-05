import {
    addCategoryService,
    deleteCategoryByIdService,
    updateCategoryByIdService,
    getAllCategoriesService,
    getCategoryByIdService,
} from "./categoryServices.js";

export const addCategoryController = async (req, res) => {
    try {
        const categoryData = { ...req.body };

        if (!categoryData.title) {
            return res.status(400).json({
                success: false,
                message: "Category title is required",
            });
        }

        if (!categoryData.slug) {
            return res.status(400).json({
                success: false,
                message: "Category slug is required",
            });
        }

        const response = await addCategoryService(categoryData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding category",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Category added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addCategoryController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding category in controller",
        });
    }
};

export const getAllCategoriesController = async (req, res) => {
    try {
        const response = await getAllCategoriesService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching categories",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllCategoriesController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching categories in controller",
        });
    }
};

export const getCategoryByIdController = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category id is required",
            });
        }

        const response = await getCategoryByIdService(categoryId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getCategoryByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching category in controller",
        });
    }
};

export const updateCategoryByIdController = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const updateData = { ...req.body };

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category id is required",
            });
        }

        if (updateData.orderIndex !== undefined) {
            const parsedOrderIndex = Number.parseInt(updateData.orderIndex, 10);
            if (Number.isNaN(parsedOrderIndex)) {
                return res.status(400).json({
                    success: false,
                    message: "Category orderIndex must be a valid number",
                });
            }
            updateData.orderIndex = parsedOrderIndex;
        }

        const response = await updateCategoryByIdService(categoryId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating category",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateCategoryByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating category in controller",
        });
    }
};

export const deleteCategoryByIdController = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category id is required",
            });
        }

        const response = await deleteCategoryByIdService(categoryId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting category",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteCategoryByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting category in controller",
        });
    }
};
