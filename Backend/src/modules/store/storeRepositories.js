import { prisma } from "../../utils/prisma.js";

export const addStoreRepository = async (storeData) => {
    try {
        const response = await prisma.store.create({
            data: storeData,
        });
        return response;
    } catch (error) {
        console.log("Error in addStoreRepository:", error);
        return {
            message: "Error adding store in repository",
        };
    }
};

export const deleteStoreByIdRepository = async (storeId) => {
    try {
        const response = await prisma.store.delete({
            where: {
                storeId: storeId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteStoreByIdRepository:", error);
        return {
            message: "Error deleting store in repository",
        };
    }
};

export const updateStoreByIdRepository = async (storeId, updateData) => {
    try {
        const response = await prisma.store.update({
            where: {
                storeId: storeId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateStoreByIdRepository:", error);
        return {
            message: "Error updating store in repository",
        };
    }
};

export const getAllStoresRepository = async () => {
    try {
        const response = await prisma.store.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllStoresRepository:", error);
        return {
            message: "Error fetching stores in repository",
        };
    }
};

export const getStoreByIdRepository = async (storeId) => {
    try {
        const response = await prisma.store.findUnique({
            where: {
                storeId: storeId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getStoreByIdRepository:", error);
        return {
            message: "Error fetching store by ID in repository",
        };
    }
};
