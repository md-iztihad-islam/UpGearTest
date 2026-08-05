import {
    addCustomerRepository,
    deleteCustomerByIdRepository,
    updateCustomerByIdRepository,
    getAllCustomersRepository,
    getCustomerByIdRepository,
} from "./customerRepositories.js";

export const addCustomerService = async (customerData) => {
    try {
        const response = await addCustomerRepository(customerData);
        return response;
    } catch (error) {
        console.log("Error in addCustomerService:", error);
        return {
            message: "Error adding customer in service",
        };
    }
};

export const deleteCustomerByIdService = async (customerId) => {
    try {
        const response = await deleteCustomerByIdRepository(customerId);
        return response;
    } catch (error) {
        console.log("Error in deleteCustomerByIdService:", error);
        return {
            message: "Error deleting customer in service",
        };
    }
};

export const updateCustomerByIdService = async (customerId, updateData) => {
    try {
        const response = await updateCustomerByIdRepository(customerId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateCustomerByIdService:", error);
        return {
            message: "Error updating customer in service",
        };
    }
};

export const getAllCustomersService = async () => {
    try {
        const response = await getAllCustomersRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllCustomersService:", error);
        return {
            message: "Error fetching customers in service",
        };
    }
};

export const getCustomerByIdService = async (customerId) => {
    try {
        const response = await getCustomerByIdRepository(customerId);
        return response;
    } catch (error) {
        console.log("Error in getCustomerByIdService:", error);
        return {
            message: "Error fetching customer by ID in service",
        };
    }
};
