import {
    addExpenseRepository,
    deleteExpenseByIdRepository,
    updateExpenseByIdRepository,
    getAllExpensesRepository,
    getExpenseByIdRepository,
    getExpensesByDateRangeRepository,
    getExpensesByEmployeeIdRepository,
} from "./expenseRepositories.js";

export const addExpenseService = async (expenseData) => {
    try {
        const response = await addExpenseRepository(expenseData);
        return response;
    } catch (error) {
        console.log("Error in addExpenseService:", error);
        return {
            message: "Error adding expense in service",
        };
    }
};

export const deleteExpenseByIdService = async (expenseId) => {
    try {
        const response = await deleteExpenseByIdRepository(expenseId);
        return response;
    } catch (error) {
        console.log("Error in deleteExpenseByIdService:", error);
        return {
            message: "Error deleting expense in service",
        };
    }
};

export const updateExpenseByIdService = async (expenseId, updateData) => {
    try {
        const response = await updateExpenseByIdRepository(expenseId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateExpenseByIdService:", error);
        return {
            message: "Error updating expense in service",
        };
    }
};

export const getAllExpensesService = async () => {
    try {
        const response = await getAllExpensesRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllExpensesService:", error);
        return {
            message: "Error fetching expenses in service",
        };
    }
};

export const getExpenseByIdService = async (expenseId) => {
    try {
        const response = await getExpenseByIdRepository(expenseId);
        return response;
    } catch (error) {
        console.log("Error in getExpenseByIdService:", error);
        return {
            message: "Error fetching expense by ID in service",
        };
    }
};

export const getExpensesByEmployeeIdService = async (employeeId) => {
    try {
        const response = await getExpensesByEmployeeIdRepository(employeeId);
        return response;
    } catch (error) {
        console.log("Error in getExpensesByEmployeeIdService:", error);
        return {
            message: "Error fetching expenses by employee ID in service",
        };
    }   
};

export const getExpensesByDateRangeService = async (startDate, endDate) => {
    try {
        const response = await getExpensesByDateRangeRepository(startDate, endDate);
        return response;
    } catch (error) {
        console.log("Error in getExpensesByDateRangeService:", error);
        return {
            message: "Error fetching expenses by date range in service",
        };
    }
};