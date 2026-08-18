import axiosInstance from "@/helpers/dashboard/axiosInstance";

//I have to send the token with it which is in the qookie

async function addExpenseApi(expenseData) {
    try {
        const response = await axiosInstance.post("/expense/add-expense", expenseData);
        return response.data;
    } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
    }
};

export default addExpenseApi;