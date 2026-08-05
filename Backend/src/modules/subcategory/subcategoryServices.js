import {
    addSubCategoryRepository,
    deleteSubCategoryByIdRepository,
    updateSubCategoryByIdRepository,
    getAllSubCategoriesRepository,
    getSubCategoryByIdRepository,
    getSubCategoryByCategoryIdRepository,
} from "./subcategoryRepositories.js";

export const addSubCategoryService = async (subCategoryData) => {
    try {
        const response = await addSubCategoryRepository(subCategoryData);
        return response;
    } catch (error) {
        console.log("Error in addSubCategoryService:", error);
        return {
            message: "Error adding subcategory in service",
        };
    }
};

export const deleteSubCategoryByIdService = async (subCategoryId) => {
    try {
        const response = await deleteSubCategoryByIdRepository(subCategoryId);
        return response;
    } catch (error) {
        console.log("Error in deleteSubCategoryByIdService:", error);
        return {
            message: "Error deleting subcategory in service",
        };
    }
};

export const updateSubCategoryByIdService = async (subCategoryId, updateData) => {
    try {
        const response = await updateSubCategoryByIdRepository(subCategoryId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateSubCategoryByIdService:", error);
        return {
            message: "Error updating subcategory in service",
        };
    }
};

export const getAllSubCategoriesService = async () => {
    try {
        const response = await getAllSubCategoriesRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllSubCategoriesService:", error);
        return {
            message: "Error fetching subcategories in service",
        };
    }
};

export const getSubCategoryByIdService = async (subCategoryId) => {
    try {
        const response = await getSubCategoryByIdRepository(subCategoryId);
        return response;
    } catch (error) {
        console.log("Error in getSubCategoryByIdService:", error);
        return {
            message: "Error fetching subcategory by ID in service",
        };
    }
};

export const getSubCategoriesByCategoryIdService = async (categoryId) => {
    try {
        const response = await getSubCategoryByCategoryIdRepository(categoryId);
        return response;
    } catch (error) {
        console.log("Error in getSubCategoriesByCategoryIdService:", error);
        return {
            message: error.message || "Error fetching subcategories by category ID in service",
        };
    }
};
