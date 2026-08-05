import { prisma } from "../../utils/prisma.js";

export const addFilterRepository = async (filterData) => {
    try {
        const response = await prisma.filter.create({
            data: filterData,
        });
        return response;
    } catch (error) {
        console.log("Error in addFilterRepository:", error);
        return {
            message: "Error adding filter in repository",
        };
    }
};

export const deleteFilterByIdRepository = async (filterId) => {
    try {
        const response = await prisma.filter.delete({
            where: {
                filterId: filterId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteFilterByIdRepository:", error);
        return {
            message: "Error deleting filter in repository",
        };
    }
};

export const updateFilterByIdRepository = async (filterId, updateData) => {
    try {
        const response = await prisma.filter.update({
            where: {
                filterId: filterId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateFilterByIdRepository:", error);
        return {
            message: "Error updating filter in repository",
        };
    }
};

export const getAllFiltersRepository = async () => {
    try {
        const response = await prisma.filter.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllFiltersRepository:", error);
        return {
            message: "Error fetching filters in repository",
        };
    }
};

export const getFilterByIdRepository = async (filterId) => {
    try {
        const response = await prisma.filter.findUnique({
            where: {
                filterId: filterId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getFilterByIdRepository:", error);
        return {
            message: "Error fetching filter by ID in repository",
        };
    }
};

export const getFilterBySubCategoryIdRepository = async (subCategoryId) => {
    try {
        const response = await prisma.filter.findMany({
            where: {
                subCategoryId: subCategoryId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getFilterBySubCategoryIdRepository:", error);
        return {
            message: "Error fetching filters by sub-category ID in repository",
        };
    }
};