import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllExpensesApi() {
    try {
        const response = await axiosInstance.get("/expense/get-all-expenses");
        return response.data;
    } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error;
    }
};

export default getAllExpensesApi;