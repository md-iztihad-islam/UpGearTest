import { prisma } from "../../utils/prisma.js";

export const addSerialNumberRepository = async (serialNumberData) => {
    try {
        const response = await prisma.serialNumber.create({
            data: serialNumberData,
        });
        return response;
    } catch (error) {
        console.log("Error in addSerialNumberRepository:", error);
        return {
            message: "Error adding serial number in repository",
        };
    }
};

export const deleteSerialNumberByIdRepository = async (serialNumber) => {
    try {
        const response = await prisma.serialNumber.delete({
            where: {
                serialNumber: serialNumber,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteSerialNumberByIdRepository:", error);
        return {
            message: "Error deleting serial number in repository",
        };
    }
};

export const updateSerialNumberByIdRepository = async (serialNumber, updateData) => {
    try {
        const response = await prisma.serialNumber.update({
            where: {
                serialNumber: serialNumber,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateSerialNumberByIdRepository:", error);
        return {
            message: "Error updating serial number in repository",
        };
    }
};

export const getAllSerialNumbersRepository = async () => {
    try {
        const response = await prisma.serialNumber.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllSerialNumbersRepository:", error);
        return {
            message: "Error fetching serial numbers in repository",
        };
    }
};

export const getSerialNumberByIdRepository = async (serialNumber) => {
    try {
        const response = await prisma.serialNumber.findUnique({
            where: {
                serialNumber: serialNumber,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getSerialNumberByIdRepository:", error);
        return {
            message: "Error fetching serial number by ID in repository",
        };
    }
};
