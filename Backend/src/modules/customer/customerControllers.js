import {
    addCustomerService,
    deleteCustomerByIdService,
    updateCustomerByIdService,
    getAllCustomersService,
    getCustomerByIdService,
} from "./customerServices.js";

export const addCustomerController = async (req, res) => {
    try {
        const customerData = { ...req.body };

        if (!customerData.name) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required",
            });
        }

        if (!customerData.phone) {
            return res.status(400).json({
                success: false,
                message: "Customer phone is required",
            });
        }

        if (!customerData.email) {
            return res.status(400).json({
                success: false,
                message: "Customer email is required",
            });
        }

        // if (!customerData.password) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Customer password is required",
        //     });
        // }

        const response = await addCustomerService(customerData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding customer",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Customer added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addCustomerController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding customer in controller",
        });
    }
};

export const getAllCustomersController = async (req, res) => {
    try {
        const response = await getAllCustomersService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching customers",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllCustomersController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching customers in controller",
        });
    }
};

export const getCustomerByIdController = async (req, res) => {
    try {
        const customerId = req.params.customerId;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Customer id is required",
            });
        }

        const response = await getCustomerByIdService(customerId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Customer not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getCustomerByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching customer in controller",
        });
    }
};

export const updateCustomerByIdController = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const updateData = { ...req.body };

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Customer id is required",
            });
        }

        const response = await updateCustomerByIdService(customerId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating customer",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateCustomerByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating customer in controller",
        });
    }
};

export const deleteCustomerByIdController = async (req, res) => {
    try {
        const customerId = req.params.customerId;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Customer id is required",
            });
        }

        const response = await deleteCustomerByIdService(customerId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting customer",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Customer deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteCustomerByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting customer in controller",
        });
    }
};
