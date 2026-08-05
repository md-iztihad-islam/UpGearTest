import {
    addExpenseService,
    deleteExpenseByIdService,
    updateExpenseByIdService,
    getAllExpensesService,
    getExpenseByIdService,
} from "./expenseServices.js";

const normalizeDecimal = (value) => {
    if (value === undefined || value === null) return undefined;
    return typeof value === "string" ? parseFloat(value) : value;
};

export const addExpenseController = async (req, res) => {
    try {
        const expenseData = { ...req.body };
        // console.log("Add Expense Request Body:", req);
        const userId = req.userId;
        // console.log("User ID from request:", userId);
        expenseData.employeeId = userId;

        if (!expenseData.date) {
            return res.status(400).json({
                success: false,
                message: "Expense date is required",
            });
        }

        if (!expenseData.description) {
            return res.status(400).json({
                success: false,
                message: "Expense description is required",
            });
        }

        if (!expenseData.amount) {
            return res.status(400).json({
                success: false,
                message: "Expense amount is required",
            });
        }

        expenseData.amount = normalizeDecimal(expenseData.amount);
        expenseData.date = new Date(expenseData.date);

        const response = await addExpenseService(expenseData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding expense",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Expense added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addExpenseController:", error);
        return res.status(500).json({
            success: false,
            message: "Error adding expense in controller",
        });
    }
};

export const getAllExpensesController = async (req, res) => {
    try {
        const response = await getAllExpensesService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching expenses",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllExpensesController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching expenses in controller",
        });
    }
};

export const getExpenseByIdController = async (req, res) => {
    try {
        const expenseId = req.params.expenseId;

        if (!expenseId) {
            return res.status(400).json({
                success: false,
                message: "Expense id is required",
            });
        }

        const response = await getExpenseByIdService(expenseId);

        if (!response || response.message) {
            return res.status(404).json({
                success: false,
                message: response?.message || "Expense not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getExpenseByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching expense in controller",
        });
    }
};

export const updateExpenseByIdController = async (req, res) => {
    try {
        const expenseId = req.params.expenseId;
        const updateData = { ...req.body };

        if (!expenseId) {
            return res.status(400).json({
                success: false,
                message: "Expense id is required",
            });
        }

        if (updateData.date) {
            updateData.date = new Date(updateData.date);
        }

        updateData.amount = normalizeDecimal(updateData.amount);

        const response = await updateExpenseByIdService(expenseId, updateData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error updating expense",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in updateExpenseByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating expense in controller",
        });
    }
};

export const deleteExpenseByIdController = async (req, res) => {
    try {
        const expenseId = req.params.expenseId;

        if (!expenseId) {
            return res.status(400).json({
                success: false,
                message: "Expense id is required",
            });
        }

        const response = await deleteExpenseByIdService(expenseId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting expense",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Expense deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteExpenseByIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error deleting expense in controller",
        });
    }
};

export const getExpensesByEmployeeIdController = async (req, res) => {
    try {
        const employeeId = req.params.employeeId;

        if (!employeeId) {
            return res.status(400).json({
                success: false,
                message: "Employee id is required",
            });
        }

        const response = await getExpensesByEmployeeIdService(employeeId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching expenses for employee",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getExpensesByEmployeeIdController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching expenses for employee in controller",
        });
    }
};

export const getExpensesByDateRangeController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Both startDate and endDate are required",
            });
        }

        const response = await getExpensesByDateRangeService(startDate, endDate);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching expenses for date range",
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });
    } catch (error) {
        console.log("Error in getExpensesByDateRangeController:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching expenses for date range in controller",
        });
    }
};

