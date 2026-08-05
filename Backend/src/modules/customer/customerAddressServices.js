import {
    addCustomerAddressRepository,
    deleteCustomerAddressByIdRepository,
    updateCustomerAddressByIdRepository,
    getAllCustomerAddressesRepository,
    getCustomerAddressByIdRepository,
} from "./customerAddressRepositories.js";

export const addCustomerAddressService = async (customerAddressData) => {
    try {
        const response = await addCustomerAddressRepository(customerAddressData);
        return response;
    } catch (error) {
        console.log("Error in addCustomerAddressService:", error);
        return {
            message: "Error adding customer address in service",
        };
    }
};

export const deleteCustomerAddressByIdService = async (addressId) => {
    try {
        const response = await deleteCustomerAddressByIdRepository(addressId);
        return response;
    } catch (error) {
        console.log("Error in deleteCustomerAddressByIdService:", error);
        return {
            message: "Error deleting customer address in service",
        };
    }
};

export const updateCustomerAddressByIdService = async (addressId, updateData) => {
    try {
        const response = await updateCustomerAddressByIdRepository(addressId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateCustomerAddressByIdService:", error);
        return {
            message: "Error updating customer address in service",
        };
    }
};

export const getAllCustomerAddressesService = async () => {
    try {
        const response = await getAllCustomerAddressesRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllCustomerAddressesService:", error);
        return {
            message: "Error fetching customer addresses in service",
        };
    }
};

export const getCustomerAddressByIdService = async (addressId) => {
    try {
        const response = await getCustomerAddressByIdRepository(addressId);
        return response;
    } catch (error) {
        console.log("Error in getCustomerAddressByIdService:", error);
        return {
            message: "Error fetching customer address by ID in service",
        };
    }
};
