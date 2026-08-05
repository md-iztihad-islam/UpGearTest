import {
    addSerialNumberService,
    deleteSerialNumberByIdService,
    updateSerialNumberByIdService,
    getAllSerialNumbersService,
    getSerialNumberByIdService,
} from "./serialNumberServices.js";

export const addSerialNumberController = async (req, res) => {
    try {
        const serialNumberData = { ...req.body };

        if (!serialNumberData.serialNumber) {
            return res.status(400).json({
                success: false,
                message: "SerialNumber serialNumber is required",
            });
        }

        if (!serialNumberData.stockId) {
            return res.status(400).json({
                success: false,
                message: "SerialNumber stockId is required",
            });
        }

        if (!serialNumberData.status) {
            return res.status(400).json({
                success: false,
                message: "SerialNumber status is required",
            });
        }

        const response = await addSerialNumberService(serialNumberData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding serial number",
            });
        }

        return res.status(201).json({
            success: true,
            message: "SerialNumber added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addSerialNumberController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding serial number in controller",
        });
    }
};

export const getAllSerialNumbersController = async (req, res) => {
    try {
        const response = await getAllSerialNumbersService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching serial numbers",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllSerialNumbersController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching serial numbers in controller",
        });
    }
};

export const getSerialNumberByIdController = async (req, res) => {
    try {
        const serialNumber = req.params.serialNumber;

        if (!serialNumber) {
            return res.status(400).json({
                success: false,
                message: "SerialNumber is required",
            });
        }

        const response = await getSerialNumberByIdService(serialNumber);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "SerialNumber not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getSerialNumberByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching serial number in controller",
        });
    }
};

export const updateSerialNumberByIdController = async (req, res) => {
    try {
        const serialNumber = req.params.serialNumber;
        const updateData = { ...req.body };

        if (!serialNumber) {
            return res.status(400).json({
                success: false,
                message: "SerialNumber is required",
            });
        }

        const response = await updateSerialNumberByIdService(serialNumber, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating serial number",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SerialNumber updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateSerialNumberByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating serial number in controller",
        });
    }
};

export const deleteSerialNumberByIdController = async (req, res) => {
    try {
        const serialNumber = req.params.serialNumber;

        if (!serialNumber) {
            return res.status(400).json({
                success: false,
                message: "SerialNumber is required",
            });
        }

        const response = await deleteSerialNumberByIdService(serialNumber);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting serial number",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SerialNumber deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteSerialNumberByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting serial number in controller",
        });
    }
};
