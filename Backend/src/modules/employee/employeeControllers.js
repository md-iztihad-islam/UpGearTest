import { generateJwtToken } from "../../utils/jwtToken.js";
import {
    addEmployeeService,
    deleteEmployeeByIdService,
    updateEmployeeByIdService,
    getAllEmployeesService,
    getEmployeeByIdService,
    getEmployeeByStoreIdService,
    getEmployeeByRoleService,
    getEmployeeByEmailService,
    employeeSignInService,
} from "./employeeServices.js";

export const addEmployeeController = async (req, res) => {
    try {
        const employeeData = { ...req.body };

        if (!employeeData.name) {
            return res.status(400).json({
                success: false,
                message: "Employee name is required",
            });
        }

        if (!employeeData.phone) {
            return res.status(400).json({
                success: false,
                message: "Employee phone is required",
            });
        }

        if(!employeeData.email) {
            return res.status(400).json({
                success: false,
                message: "Employee email is required",
            });
        }

        if (!employeeData.password) {
            return res.status(400).json({
                success: false,
                message: "Employee password is required",
            });
        }

        if (!employeeData.hireDate) {
            return res.status(400).json({
                success: false,
                message: "Employee hireDate is required",
            });
        }

        if (!employeeData.storeId) {
            return res.status(400).json({
                success: false,
                message: "Employee storeId is required",
            });
        }

        if (!employeeData.status) {
            return res.status(400).json({
                success: false,
                message: "Employee status is required",
            });
        }

        if (!employeeData.role) {
            return res.status(400).json({
                success: false,
                message: "Employee role is required",
            });
        }

        employeeData.hireDate = new Date(employeeData.hireDate);
        employeeData.endDate = employeeData.endDate ? new Date(employeeData.endDate) : null;

        const imageFile = req.file;

        if(imageFile) {
            employeeData.imageURL = imageFile.location;
        }

        const response = await addEmployeeService(employeeData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding employee",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Employee added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addEmployeeController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding employee in controller",
        });
    }
};

export const getAllEmployeesController = async (req, res) => {
    try {
        const response = await getAllEmployeesService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching employees",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllEmployeesController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching employees in controller",
        });
    }
};

export const getEmployeeByIdController = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee id is required",
            });
        }

        const response = await getEmployeeByIdService(employeeId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Employee not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getEmployeeByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching employee in controller",
        });
    }
};

export const updateEmployeeByIdController = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;
        const updateData = { ...req.body };

        // console.log("Update Data:", updateData);
        // console.log("File Upload:", req.file);

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee id is required",
            });
        }

        if (updateData.hireDate) {
            updateData.hireDate = new Date(updateData.hireDate);
        }

        if(updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
        }

        // console.log("File: ", req.file);

        const imageFile = req.file;
        // console.log("Image:", imageFile);
        if(imageFile) {
            updateData.imageURL = imageFile.location;
        }

        // console.log("Final Update Data:", updateData);

        const response = await updateEmployeeByIdService(employeeId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating employee",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateEmployeeByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating employee in controller",
        });
    }
};

export const deleteEmployeeByIdController = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee id is required",
            });
        }

        const response = await deleteEmployeeByIdService(employeeId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting employee",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteEmployeeByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting employee in controller",
        });
    }
};

export const getEmployeeByStoreIdController = async (req, res) => { 
    try {
        const { storeId } = req.params.storeId;

        const response = await getEmployeeByStoreIdService(storeId);

        return res.status(200).json({
            success: true,
            message: "Employees fetched successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in getEmployeeByStoreIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching employees by store ID in controller",
        });
    }
};

export const getEmployeeByRoleController = async (req, res) => {
    try {
        const { role } = req.params.role;

        const response = await getEmployeeByRoleService(role);

        return res.status(200).json({
            success: true,
            message: "Employees fetched successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in getEmployeeByRoleController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching employees by role in controller",
        });
    }
};

export const getEmployeeByEmailController = async (req, res) => {
    try {
        const { email } = req.params.email;

        const response = await getEmployeeByEmailService(email);

        return res.status(200).json({
            success: true,
            message: "Employee fetched successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in getEmployeeByEmailController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching employee by email in controller",
        });
    }
};

export const employeeSignInController = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("Sign In Request Body:", req.body);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const employee = await employeeSignInService(email, password);

        if (!employee || employee.message) {
            return res.status(401).json({
                success: false,
                message: employee?.message || "Invalid email or password",
            });
        }

        const signinToken = await generateJwtToken(employee.employeeId);

        return res.status(200).cookie("signinToken", signinToken, {httpOnly: true, sameSite: "strict", maxAge: 24 * 60 * 60 * 1000 }).json({
            success: true,
            message: "Employee signed in successfully",
            data: employee,
            token: signinToken,
        });
    } catch (error) {
        console.log("Error in employeeSignInController:", error);
        return res.status(500).json({
            success: false,
            message: "Error signing in employee in controller",
        });
    }
};

export const employeeSignOutController = async (req, res) => {
    try {
        return res.status(200).clearCookie("signinToken").json({
            success: true,
            message: "Employee signed out successfully",
        });
    } catch (error) {
        console.log("Error in employeeSignOutController:", error);
        return res.status(500).json({
            success: false,
            message: "Error signing out employee in controller",
        });
    }
}