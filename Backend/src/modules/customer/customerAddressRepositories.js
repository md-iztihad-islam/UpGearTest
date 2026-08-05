import { prisma } from "../../utils/prisma.js";

export const addCustomerAddressRepository = async (customerAddressData) => {
    try {
        const response = await prisma.customerAddress.create({
            data: customerAddressData,
        });
        return response;
    } catch (error) {
        console.log("Error in addCustomerAddressRepository:", error);
        return {
            message: "Error adding customer address in repository",
        };
    }
};

export const deleteCustomerAddressByIdRepository = async (addressId) => {
    try {
        const response = await prisma.customerAddress.delete({
            where: {
                addressId: addressId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteCustomerAddressByIdRepository:", error);
        return {
            message: "Error deleting customer address in repository",
        };
    }
};

export const updateCustomerAddressByIdRepository = async (addressId, updateData) => {
    try {
        const response = await prisma.customerAddress.update({
            where: {
                addressId: addressId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateCustomerAddressByIdRepository:", error);
        return {
            message: "Error updating customer address in repository",
        };
    }
};

export const getAllCustomerAddressesRepository = async () => {
    try {
        const response = await prisma.customerAddress.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllCustomerAddressesRepository:", error);
        return {
            message: "Error fetching customer addresses in repository",
        };
    }
};

export const getCustomerAddressByIdRepository = async (addressId) => {
    try {
        const response = await prisma.customerAddress.findUnique({
            where: {
                addressId: addressId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getCustomerAddressByIdRepository:", error);
        return {
            message: "Error fetching customer address by ID in repository",
        };
    }
};
