import {
    addWarrantyRepository,
    deleteWarrantyByIdRepository,
    updateWarrantyByIdRepository,
    getAllWarrantiesRepository,
    getWarrantyByIdRepository,
} from "./warrantyRepositpries.js";

export const addWarrantyService = async (warrantyData) => {
    try {
        const response = await addWarrantyRepository(warrantyData);
        return response;
    } catch (error) {
        console.log("Error in addWarrantyService:", error);
        return {
            message: "Error adding warranty in service",
        };
    }
};

export const deleteWarrantyByIdService = async (warrantyId) => {
    try {
        const response = await deleteWarrantyByIdRepository(warrantyId);
        return response;
    } catch (error) {
        console.log("Error in deleteWarrantyByIdService:", error);
        return {
            message: "Error deleting warranty in service",
        };
    }
};

export const updateWarrantyByIdService = async (warrantyId, updateData) => {
    try {
        const response = await updateWarrantyByIdRepository(warrantyId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateWarrantyByIdService:", error);
        return {
            message: "Error updating warranty in service",
        };
    }
};

export const getAllWarrantiesService = async () => {
    try {
        const response = await getAllWarrantiesRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllWarrantiesService:", error);
        return {
            message: "Error fetching warranties in service",
        };
    }
};

export const getWarrantyByIdService = async (warrantyId) => {
    try {
        const response = await getWarrantyByIdRepository(warrantyId);
        return response;
    } catch (error) {
        console.log("Error in getWarrantyByIdService:", error);
        return {
            message: "Error fetching warranty by ID in service",
        };
    }
};