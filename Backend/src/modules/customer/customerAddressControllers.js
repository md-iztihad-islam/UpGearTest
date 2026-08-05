import {
    addCustomerAddressService,
    deleteCustomerAddressByIdService,
    updateCustomerAddressByIdService,
    getAllCustomerAddressesService,
    getCustomerAddressByIdService,
} from "./customerAddressServices.js";

export const addCustomerAddressController = async (req, res) => {
    try {
        const customerAddressData = { ...req.body };

        if (!customerAddressData.customerId) {
            return res.status(400).json({
                success: false,
                message: "CustomerAddress customerId is required",
            });
        }

        if (!customerAddressData.recipientName) {
            return res.status(400).json({
                success: false,
                message: "CustomerAddress recipientName is required",
            });
        }

        if (!customerAddressData.phone) {
            return res.status(400).json({
                success: false,
                message: "CustomerAddress phone is required",
            });
        }

        if (!customerAddressData.addressLine) {
            return res.status(400).json({
                success: false,
                message: "CustomerAddress addressLine is required",
            });
        }

        if (!customerAddressData.city) {
            return res.status(400).json({
                success: false,
                message: "CustomerAddress city is required",
            });
        }

        const response = await addCustomerAddressService(customerAddressData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding customer address",
            });
        }

        return res.status(201).json({
            success: true,
            message: "CustomerAddress added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addCustomerAddressController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding customer address in controller",
        });
    }
};

export const getAllCustomerAddressesController = async (req, res) => {
    try {
        const response = await getAllCustomerAddressesService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching customer addresses",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllCustomerAddressesController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching customer addresses in controller",
        });
    }
};

export const getCustomerAddressByIdController = async (req, res) => {
    try {
        const addressId = req.params.addressId;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address id is required",
            });
        }

        const response = await getCustomerAddressByIdService(addressId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "CustomerAddress not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getCustomerAddressByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching customer address in controller",
        });
    }
};

export const updateCustomerAddressByIdController = async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const updateData = { ...req.body };

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address id is required",
            });
        }

        const response = await updateCustomerAddressByIdService(addressId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating customer address",
            });
        }

        return res.status(200).json({
            success: true,
            message: "CustomerAddress updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateCustomerAddressByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating customer address in controller",
        });
    }
};

export const deleteCustomerAddressByIdController = async (req, res) => {
    try {
        const addressId = req.params.addressId;

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address id is required",
            });
        }

        const response = await deleteCustomerAddressByIdService(addressId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting customer address",
            });
        }

        return res.status(200).json({
            success: true,
            message: "CustomerAddress deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteCustomerAddressByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting customer address in controller",
        });
    }
};
