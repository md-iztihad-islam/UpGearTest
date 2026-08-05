import {
    addCategoryRepository,
    deleteCategoryByIdRepository,
    updateCategoryByIdRepository,
    getAllCategoriesRepository,
    getCategoryByIdRepository,
} from "./categoryRepositories.js";

export const addCategoryService = async (categoryData) => {
    try {
        const response = await addCategoryRepository(categoryData);
        return response;
    } catch (error) {
        console.log("Error in addCategoryService:", error);
        return {
            message: "Error adding category in service",
        };
    }
};

export const deleteCategoryByIdService = async (categoryId) => {
    try {
        const response = await deleteCategoryByIdRepository(categoryId);
        return response;
    } catch (error) {
        console.log("Error in deleteCategoryByIdService:", error);
        return {
            message: "Error deleting category in service",
        };
    }
};

export const updateCategoryByIdService = async (categoryId, updateData) => {
    try {
        const response = await updateCategoryByIdRepository(categoryId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateCategoryByIdService:", error);
        return {
            message: "Error updating category in service",
        };
    }
};

export const getAllCategoriesService = async () => {
    try {
        const response = await getAllCategoriesRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllCategoriesService:", error);
        return {
            message: "Error fetching categories in service",
        };
    }
};

export const getCategoryByIdService = async (categoryId) => {
    try {
        const response = await getCategoryByIdRepository(categoryId);
        return response;
    } catch (error) {
        console.log("Error in getCategoryByIdService:", error);
        return {
            message: "Error fetching category by ID in service",
        };
    }
};
