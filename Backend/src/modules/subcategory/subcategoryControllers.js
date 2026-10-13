import { R2_PUBLIC_URL } from "../../config/serverConfig.js";
import {
    addSubCategoryService,
    deleteSubCategoryByIdService,
    updateSubCategoryByIdService,
    getAllSubCategoriesService,
    getSubCategoryByIdService,
    getSubCategoriesByCategoryIdService,
} from "./subcategoryServices.js";

const SUBCATEGORY_FIELDS = ["categoryId", "title", "slug", "metaTitle", "metaDescription"];

// Keep only real SubCategory columns from the (possibly multipart) body.
const pickSubCategoryFields = (body = {}) =>
    Object.fromEntries(Object.entries(body).filter(([key]) => SUBCATEGORY_FIELDS.includes(key)));

const uploadedImageURL = (file) => (file?.key ? `${R2_PUBLIC_URL}/${file.key}` : undefined);

export const addSubCategoryController = async (req, res) => {
    try {
        const subCategoryData = pickSubCategoryFields(req.body);
        const imageURL = uploadedImageURL(req.file);
        if (imageURL) subCategoryData.imageURL = imageURL;

        if (!subCategoryData.categoryId) {
            return res.status(400).json({
                success: false,
                message: "SubCategory categoryId is required",
            });
        }

        if (!subCategoryData.title) {
            return res.status(400).json({
                success: false,
                message: "SubCategory title is required",
            });
        }

        if (!subCategoryData.slug) {
            return res.status(400).json({
                success: false,
                message: "SubCategory slug is required",
            });
        }

        const response = await addSubCategoryService(subCategoryData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding subcategory",
            });
        }

        return res.status(201).json({
            success: true,
            message: "SubCategory added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addSubCategoryController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding subcategory in controller",
        });
    }
};

export const getAllSubCategoriesController = async (req, res) => {
    try {
        const response = await getAllSubCategoriesService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching subcategories",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllSubCategoriesController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching subcategories in controller",
        });
    }
};

export const getSubCategoryByIdController = async (req, res) => {
    try {
        const subCategoryId = req.params.subCategoryId;

        if (!subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "SubCategory id is required",
            });
        }

        const response = await getSubCategoryByIdService(subCategoryId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "SubCategory not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getSubCategoryByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching subcategory in controller",
        });
    }
};

export const updateSubCategoryByIdController = async (req, res) => {
    try {
        const subCategoryId = req.params.subCategoryId;
        const updateData = pickSubCategoryFields(req.body);

        // A new upload replaces the image; removeImage=true clears it.
        const imageURL = uploadedImageURL(req.file);
        if (imageURL) {
            updateData.imageURL = imageURL;
        } else if (req.body?.removeImage === "true" || req.body?.removeImage === true) {
            updateData.imageURL = null;
        }

        if (!subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "SubCategory id is required",
            });
        }


        const response = await updateSubCategoryByIdService(subCategoryId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating subcategory",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SubCategory updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateSubCategoryByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating subcategory in controller",
        });
    }
};

export const deleteSubCategoryByIdController = async (req, res) => {
    try {
        const subCategoryId = req.params.subCategoryId;

        if (!subCategoryId) {
            return res.status(400).json({
                success: false,
                message: "SubCategory id is required",
            });
        }

        const response = await deleteSubCategoryByIdService(subCategoryId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting subcategory",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SubCategory deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteSubCategoryByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting subcategory in controller",
        });
    }
};

export const getSubCategoriesByCategoryIdController = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category id is required",
            });
        }

        const response = await getSubCategoriesByCategoryIdService(categoryId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching subcategories by category ID",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getSubCategoriesByCategoryIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching subcategories by category ID in controller",
        });
    }
};