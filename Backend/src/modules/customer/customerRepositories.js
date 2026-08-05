import { prisma } from "../../utils/prisma.js";

export const addCustomerRepository = async (customerData, tx = prisma) => {
    try {
        const response = await tx.customer.create({
            data: customerData,
        });
        return response;
    } catch (error) {
        console.log("Error in addCustomerRepository:", error);
        return {
            message: "Error adding customer in repository",
        };
    }
};

export const deleteCustomerByIdRepository = async (customerId) => {
    try {
        const response = await prisma.customer.delete({
            where: {
                customerId: customerId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteCustomerByIdRepository:", error);
        return {
            message: "Error deleting customer in repository",
        };
    }
};

export const updateCustomerByIdRepository = async (customerId, updateData) => {
    try {
        const response = await prisma.customer.update({
            where: {
                customerId: customerId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateCustomerByIdRepository:", error);
        return {
            message: "Error updating customer in repository",
        };
    }
};

export const getAllCustomersRepository = async () => {
    try {
        const response = await prisma.customer.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllCustomersRepository:", error);
        return {
            message: "Error fetching customers in repository",
        };
    }
};

export const getCustomerByIdRepository = async (customerId) => {
    try {
        const response = await prisma.customer.findUnique({
            where: {
                customerId: customerId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getCustomerByIdRepository:", error);
        return {
            message: "Error fetching customer by ID in repository",
        };
    }
};

export const getCustomerByPhoneRepository = async (phone, tx = prisma) => {
    try {
        const response = await tx.customer.findUnique({
            where: {
                phone: phone,
            }
        });

        return response;
    } catch (error) {
        console.log("Error in getCustomerByPhoneRepository:", error);
        return {
            message: "Error fetching customer by phone in repository",
        };
    }
}