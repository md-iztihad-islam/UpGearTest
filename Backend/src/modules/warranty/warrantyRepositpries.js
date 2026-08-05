import { prisma } from "../../utils/prisma.js";

export const addWarrantyRepository = async (warrantyData) => {
    try {
        const response = await prisma.warranty.create({
            data: warrantyData,
        });
        return response;
    } catch (error) {
        console.log("Error in addWarrantyRepository:", error);
        return {
            message: "Error adding warranty in repository",
        }
    }
};

export const deleteWarrantyByIdRepository = async (warrantyId) => {
    try {
        const response = await prisma.warranty.delete({
            where: {
                warrantyId: warrantyId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteWarrantyByIdRepository:", error);
        return {
            message: "Error deleting warranty in repository",
        }
    }
};

export const updateWarrantyByIdRepository = async (warrantyId, updateData) => {
    try {
        const response = await prisma.warranty.update({
            where: {
                warrantyId: warrantyId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateWarrantyByIdRepository:", error);
        return {
            message: "Error updating warranty in repository",
        }
    }
};

export const getAllWarrantiesRepository = async () => {
    try {
        const response = await prisma.warranty.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllWarrantiesRepository:", error);
        return {
            message: "Error fetching warranties in repository",
        }
    }
};

export const getWarrantyByIdRepository = async (warrantyId) => {
    try {
        const response = await prisma.warranty.findUnique({
            where: {
                warrantyId: warrantyId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getWarrantyByIdRepository:", error);
        return {
            message: "Error fetching warranty by ID in repository",
        }
    }
};