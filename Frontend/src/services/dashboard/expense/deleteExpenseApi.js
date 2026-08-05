import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteExpenseApi(expenseId) {
    try {
        const response = await axiosInstance.delete(`/expense/delete-expense-by-id/${expenseId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
};

export default deleteExpenseApi;