import express from "express";
import {
    addExpenseController,
    deleteExpenseByIdController,
    getAllExpensesController,
    getExpenseByIdController,
    getExpensesByDateRangeController,
    getExpensesByEmployeeIdController,
    updateExpenseByIdController,
} from "./expenseControllers.js";
import isAuthenticated from "../../utils/isAuthenticated.js";

const router = express.Router();

router.post("/add-expense", isAuthenticated, addExpenseController);
router.get("/get-all-expenses", getAllExpensesController);
router.get("/get-expense-by-id/:expenseId", getExpenseByIdController);
router.put("/update-expense-by-id/:expenseId", updateExpenseByIdController);
router.delete("/delete-expense-by-id/:expenseId", deleteExpenseByIdController);
router.get("/get-expenses-by-employee/:employeeId", getExpensesByEmployeeIdController);
router.get("/get-expenses-by-date-range", getExpensesByDateRangeController);

export default router;
