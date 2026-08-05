import {
    addStoreRepository,
    deleteStoreByIdRepository,
    updateStoreByIdRepository,
    getAllStoresRepository,
    getStoreByIdRepository,
} from "./storeRepositories.js";
import bcrypt from "bcryptjs";

export const addStoreService = async (storeData) => {
    try {
        const hashedPassword = await bcrypt.hash(storeData.password, 10);
        storeData.password = hashedPassword;
        const response = await addStoreRepository(storeData);
        return response;
    } catch (error) {
        console.log("Error in addStoreService:", error);
        return {
            message: error.message || "Error adding store in service",
        };
    }
};

export const deleteStoreByIdService = async (storeId) => {
    try {
        const response = await deleteStoreByIdRepository(storeId);
        return response;
    } catch (error) {
        console.log("Error in deleteStoreByIdService:", error);
        return {
            message: error.message || "Error deleting store in service",
        };
    }
};

export const updateStoreByIdService = async (storeId, updateData) => {
    try {
        const response = await updateStoreByIdRepository(storeId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateStoreByIdService:", error);
        return {
            message: "Error updating store in service",
        };
    }
};

export const getAllStoresService = async () => {
    try {
        const response = await getAllStoresRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllStoresService:", error);
        return {
            message: "Error fetching stores in service",
        };
    }
};

export const getStoreByIdService = async (storeId) => {
    try {
        const response = await getStoreByIdRepository(storeId);
        return response;
    } catch (error) {
        console.log("Error in getStoreByIdService:", error);
        return {
            message: "Error fetching store by ID in service",
        };
    }
};
