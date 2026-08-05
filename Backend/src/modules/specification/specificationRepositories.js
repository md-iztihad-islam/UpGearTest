import { prisma } from "../../utils/prisma.js";

export const addSpecificationRepository = async (specificationData) => {
    try {
        const response = await prisma.specification.create({
            data: specificationData,
        });
        return response;
    } catch (error) {
        console.log("Error in addSpecificationRepository:", error);
        return {
            message: "Error adding specification in repository",
        };
    }
};

export const deleteSpecificationByIdRepository = async (specificationId) => {
    try {
        const response = await prisma.specification.delete({
            where: {
                specificationId: specificationId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteSpecificationByIdRepository:", error);
        return {
            message: "Error deleting specification in repository",
        };
    }
};

export const updateSpecificationByIdRepository = async (specificationId, updateData) => {
    try {
        const response = await prisma.specification.update({
            where: {
                specificationId: specificationId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateSpecificationByIdRepository:", error);
        return {
            message: "Error updating specification in repository",
        };
    }
};

export const getAllSpecificationsRepository = async () => {
    try {
        const response = await prisma.specification.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllSpecificationsRepository:", error);
        return {
            message: "Error fetching specifications in repository",
        };
    }
};

export const getSpecificationByIdRepository = async (specificationId) => {
    try {
        const response = await prisma.specification.findUnique({
            where: {
                specificationId: specificationId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getSpecificationByIdRepository:", error);
        return {
            message: "Error fetching specification by ID in repository",
        };
    }
};

export const getSpecificationBySubCategoryIdRepository = async (subCategoryId) => {
    try {
        const response = await prisma.specification.findMany({
            where: {
                subCategoryId: subCategoryId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getSpecificationBySubCategoryIdRepository:", error);
        return {
            message: "Error fetching specifications by sub-category ID in repository",
        };
    }
};