import { prisma } from "../../utils/prisma.js";

export const addFilterItemRepository = async (filterItemData) => {
    try {
        console.log("Adding filter item with data:", filterItemData);
        const response = await prisma.filterItem.create({
            data: filterItemData,
        });
        return response;
    } catch (error) {
        console.log("Error in addFilterItemRepository:", error);
        return {
            message: "Error adding filter item in repository",
        };
    }
};

export const deleteFilterItemByIdRepository = async (filterItemId) => {
    try {
        const response = await prisma.filterItem.delete({
            where: {
                filterItemId: filterItemId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteFilterItemByIdRepository:", error);
        return {
            message: "Error deleting filter item in repository",
        };
    }
};

export const updateFilterItemByIdRepository = async (filterItemId, updateData) => {
    try {
        const response = await prisma.filterItem.update({
            where: {
                filterItemId: filterItemId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateFilterItemByIdRepository:", error);
        return {
            message: "Error updating filter item in repository",
        };
    }
};

export const getAllFilterItemsRepository = async () => {
    try {
        const response = await prisma.filterItem.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllFilterItemsRepository:", error);
        return {
            message: "Error fetching filter items in repository",
        };
    }
};

export const getFilterItemByIdRepository = async (filterItemId) => {
    try {
        const response = await prisma.filterItem.findUnique({
            where: {
                filterItemId: filterItemId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getFilterItemByIdRepository:", error);
        return {
            message: "Error fetching filter item by ID in repository",
        };
    }
};

export const getFilterItemBySubCategoryIdRepository = async (subCategoryId) => {
    try {
        const response = await prisma.filterItem.findMany({
            where: {
                subCategoryId: subCategoryId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getFilterItemBySubCategoryIdRepository:", error);
        return {
            message: "Error fetching filter items by sub-category ID in repository",
        };
    }
};
