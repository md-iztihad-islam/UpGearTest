import { prisma } from "../../utils/prisma.js";

export const addSubCategoryRepository = async (subCategoryData) => {
    try {
        const response = await prisma.subCategory.create({
            data: subCategoryData,
        });
        return response;
    } catch (error) {
        console.log("Error in addSubCategoryRepository:", error);
        return {
            message: "Error adding subcategory in repository",
        };
    }
};

export const deleteSubCategoryByIdRepository = async (subCategoryId) => {
    try {
        const response = await prisma.subCategory.delete({
            where: {
                subCategoryId: subCategoryId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteSubCategoryByIdRepository:", error);
        return {
            message: "Error deleting subcategory in repository",
        };
    }
};

export const updateSubCategoryByIdRepository = async (subCategoryId, updateData) => {
    try {
        const response = await prisma.subCategory.update({
            where: {
                subCategoryId: subCategoryId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateSubCategoryByIdRepository:", error);
        return {
            message: "Error updating subcategory in repository",
        };
    }
};

export const getAllSubCategoriesRepository = async () => {
    try {
        const response = await prisma.subCategory.findMany({
            orderBy: {
                createdAt: "asc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllSubCategoriesRepository:", error);
        return {
            message: "Error fetching subcategories in repository",
        };
    }
};

export const getSubCategoryByIdRepository = async (subCategoryId) => {
    try {
        const response = await prisma.subCategory.findUnique({
            where: {
                subCategoryId: subCategoryId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getSubCategoryByIdRepository:", error);
        return {
            message: "Error fetching subcategory by ID in repository",
        };
    }
};

export const getSubCategoryByCategoryIdRepository = async (categoryId) => {
    try {
        console.log("Fetching subcategories for categoryId:", categoryId);
        const response = await prisma.subCategory.findMany({
            where: {
                categoryId: categoryId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        console.log("Fetched subcategories:", response);
        return response;
    } catch (error) {
        console.log("Error in getSubCategoryByCategoryIdRepository:", error);
        return {
            message: "Error fetching subcategories by category ID in repository",
        };
    }
};