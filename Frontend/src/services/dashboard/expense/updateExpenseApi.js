import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateExpenseApi(expenseId, expenseData) {
    try {
        const response = await axiosInstance.put(`/expense/update-expense-by-id/${expenseId}`, expenseData);
        return response.data;
    } catch (error) {
        console.error("Error updating expense:", error);
        throw error;
    }
};

export default updateExpenseApi;