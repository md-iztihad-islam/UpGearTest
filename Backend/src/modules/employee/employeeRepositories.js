import { prisma } from "../../utils/prisma.js";

export const addEmployeeRepository = async (employeeData) => {
    try {
        const response = await prisma.employee.create({
            data: employeeData,
        });
        return response;
    } catch (error) {
        console.log("Error in addEmployeeRepository:", error);
        return {
            message: "Error adding employee in repository",
        };
    }
};

export const deleteEmployeeByIdRepository = async (employeeId) => {
    try {
        const response = await prisma.employee.delete({
            where: {
                employeeId: employeeId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteEmployeeByIdRepository:", error);
        return {
            message: "Error deleting employee in repository",
        };
    }
};

export const updateEmployeeByIdRepository = async (employeeId, updateData) => {
    try {
        const { storeId, ...rest } = updateData; // ✅ pull storeId out separately

        const response = await prisma.employee.update({
            where: {
                employeeId: employeeId,
            },
            data: {
                ...rest,                          // ✅ spread everything except storeId
                ...(storeId && {                  // ✅ conditionally spread the relation
                    store: {
                        connect: { storeId },
                    },
                }),
            },
        });
        return response;
    } catch (error) {
        console.log("Error in updateEmployeeByIdRepository:", error);
        return {
            message: "Error updating employee in repository",
        };
    }
};

export const getAllEmployeesRepository = async () => {
    try {
        const response = await prisma.employee.findMany({
            orderBy: {
                hireDate: "desc",
            },
            include: {
                store: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllEmployeesRepository:", error);
        return {
            message: "Error fetching employees in repository",
        };
    }
};

export const getEmployeeByIdRepository = async (employeeId) => {
    try {
        const response = await prisma.employee.findUnique({
            where: {
                employeeId: employeeId,
            },
            include: {
                store: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getEmployeeByIdRepository:", error);
        return {
            message: "Error fetching employee by ID in repository",
        };
    }
};

export const getEmployeeByStoreIdRepository = async (storeId) => {
    try {
        const response = await prisma.employee.findMany({
            where: {
                storeId: storeId,
            },
            include: {
                store: true,
            },
            orderBy: {
                hireDate: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getEmployeeByStoreIdRepository:", error);
        return {
            message: "Error fetching employees by store ID in repository",
        };
    }
};

export const getEmployeeByRoleRepository = async (role) => {
    try {
        const response = await prisma.employee.findMany({
            where: {
                role: role,
            },
            include: {
                store: true,
            },
            orderBy: {
                hireDate: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getEmployeeByRoleRepository:", error);
        return {
            message: "Error fetching employees by role in repository",
        };
    }
};

export const getEmployeeByEmailRepository = async (email) => {
    try {
        const response = await prisma.employee.findUnique({
            where: {
                email: email,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getEmployeeByEmailRepository:", error);
        return {
            message: "Error fetching employee by email in repository",
        };
    }
};