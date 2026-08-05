import {
    addSerialNumberRepository,
    deleteSerialNumberByIdRepository,
    updateSerialNumberByIdRepository,
    getAllSerialNumbersRepository,
    getSerialNumberByIdRepository,
} from "./serialNumberRepositories.js";

export const addSerialNumberService = async (serialNumberData) => {
    try {
        const response = await addSerialNumberRepository(serialNumberData);
        return response;
    } catch (error) {
        console.log("Error in addSerialNumberService:", error);
        return {
            message: "Error adding serial number in service",
        };
    }
};

export const deleteSerialNumberByIdService = async (serialNumber) => {
    try {
        const response = await deleteSerialNumberByIdRepository(serialNumber);
        return response;
    } catch (error) {
        console.log("Error in deleteSerialNumberByIdService:", error);
        return {
            message: "Error deleting serial number in service",
        };
    }
};

export const updateSerialNumberByIdService = async (serialNumber, updateData) => {
    try {
        const response = await updateSerialNumberByIdRepository(serialNumber, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateSerialNumberByIdService:", error);
        return {
            message: "Error updating serial number in service",
        };
    }
};

export const getAllSerialNumbersService = async () => {
    try {
        const response = await getAllSerialNumbersRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllSerialNumbersService:", error);
        return {
            message: "Error fetching serial numbers in service",
        };
    }
};

export const getSerialNumberByIdService = async (serialNumber) => {
    try {
        const response = await getSerialNumberByIdRepository(serialNumber);
        return response;
    } catch (error) {
        console.log("Error in getSerialNumberByIdService:", error);
        return {
            message: "Error fetching serial number by ID in service",
        };
    }
};
