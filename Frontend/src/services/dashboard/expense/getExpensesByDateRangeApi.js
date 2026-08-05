import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getExpenseByDateRangeApi(startDate, endDate) {
    try {
        const response = await axiosInstance.get(`/expense/get-expenses-by-date-range?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching expenses by date range:", error);
        throw error;
    }
};

export default getExpenseByDateRangeApi;