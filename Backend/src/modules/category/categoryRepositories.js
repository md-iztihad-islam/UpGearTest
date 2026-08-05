import { prisma } from "../../utils/prisma.js";

export const addCategoryRepository = async (categoryData) => {
    try {
        const response = await prisma.category.create({
            data: categoryData,
        });
        return response;
    } catch (error) {
        console.log("Error in addCategoryRepository:", error);
        return {
            message: "Error adding category in repository",
        };
    }
};

export const deleteCategoryByIdRepository = async (categoryId) => {
    try {
        const response = await prisma.category.delete({
            where: {
                categoryId: categoryId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteCategoryByIdRepository:", error);
        return {
            message: "Error deleting category in repository",
        };
    }
};

export const updateCategoryByIdRepository = async (categoryId, updateData) => {
    try {
        const response = await prisma.category.update({
            where: {
                categoryId: categoryId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateCategoryByIdRepository:", error);
        return {
            message: "Error updating category in repository",
        };
    }
};

export const getAllCategoriesRepository = async () => {
    try {
        const response = await prisma.category.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllCategoriesRepository:", error);
        return {
            message: "Error fetching categories in repository",
        };
    }
};

export const getCategoryByIdRepository = async (categoryId) => {
    try {
        const response = await prisma.category.findUnique({
            where: {
                categoryId: categoryId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getCategoryByIdRepository:", error);
        return {
            message: "Error fetching category by ID in repository",
        };
    }
};
