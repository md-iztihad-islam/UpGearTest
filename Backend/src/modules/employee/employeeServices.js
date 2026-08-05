import {
    addEmployeeRepository,
    deleteEmployeeByIdRepository,
    updateEmployeeByIdRepository,
    getAllEmployeesRepository,
    getEmployeeByIdRepository,
    getEmployeeByRoleRepository,
    getEmployeeByStoreIdRepository,
    getEmployeeByEmailRepository,
} from "./employeeRepositories.js";
import bcrypt from "bcryptjs";

export const addEmployeeService = async (employeeData) => {
    try {
        const response = await addEmployeeRepository(employeeData);
        return response;
    } catch (error) {
        console.log("Error in addEmployeeService:", error);
        return {
            message: "Error adding employee in service",
        };
    }
};

export const deleteEmployeeByIdService = async (employeeId) => {
    try {
        const response = await deleteEmployeeByIdRepository(employeeId);
        return response;
    } catch (error) {
        console.log("Error in deleteEmployeeByIdService:", error);
        return {
            message: "Error deleting employee in service",
        };
    }
};

export const updateEmployeeByIdService = async (employeeId, updateData) => {
    try {
        const response = await updateEmployeeByIdRepository(employeeId, updateData);

        if(updateData.password) {
            const hashedPassword = await bcrypt.hash(updateData.password, 10);
            updateData.password = hashedPassword;
        }
        
        return response;
    } catch (error) {
        console.log("Error in updateEmployeeByIdService:", error);
        return {
            message: "Error updating employee in service",
        };
    }
};

export const getAllEmployeesService = async () => {
    try {
        const response = await getAllEmployeesRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllEmployeesService:", error);
        return {
            message: "Error fetching employees in service",
        };
    }
};

export const getEmployeeByIdService = async (employeeId) => {
    try {
        const response = await getEmployeeByIdRepository(employeeId);
        return response;
    } catch (error) {
        console.log("Error in getEmployeeByIdService:", error);
        return {
            message: "Error fetching employee by ID in service",
        };
    }
};

export const getEmployeeByStoreIdService = async (storeId) => {
    try {
        const response = await getEmployeeByStoreIdRepository(storeId);
        return response;
    } catch (error) {
        console.log("Error in getEmployeeByStoreIdService:", error);
        return {
            message: "Error fetching employees by store ID in service",
        };
    }
};

export const getEmployeeByRoleService = async (role) => {
    try {
        const response = await getEmployeeByRoleRepository(role);
        return response;
    } catch (error) {
        console.log("Error in getEmployeeByRoleService:", error);
        return {
            message: "Error fetching employees by role in service",
        };
    }
};

export const getEmployeeByEmailService = async (email) => {
    try {
        const response = await getEmployeeByEmailRepository(email);
        return response;
    } catch (error) {
        console.log("Error in getEmployeeByEmailService:", error);
        return {
            message: "Error fetching employee by email in service",
        };
    };
}

export const employeeSignInService = async (email, password) => {
    try {
        const response = await getEmployeeByEmailRepository(email);

        const employee = response;

        if (!employee) {
            return {
                message: "Employee not found",
            };
        }

        const isPasswordValid = (password === employee.password) || await bcrypt.compare(password, employee.password);

        if (!isPasswordValid) {
            return {
                message: "Invalid password",
            };
        }

        return employee;
    } catch (error) {
        console.log("Error in employeeSignInService:", error);
        return {
            message: "Error signing in employee",
        };
    }
}