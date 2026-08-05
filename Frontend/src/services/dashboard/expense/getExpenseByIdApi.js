import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getExpenseByIdApi(expenseId) {
    try {
        const response = await axiosInstance.get(`/expense/get-expense-by-id/${expenseId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching expense by ID:", error);
        throw error;
    }
};

export default getExpenseByIdApi;