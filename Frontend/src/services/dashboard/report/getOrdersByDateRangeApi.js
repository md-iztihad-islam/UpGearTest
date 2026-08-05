import axiosInstance from "@/helpers/dashboard/axiosInstance";

const getOrdersByDateRangeApi = async (startDate, endDate, page = 1, limit = 1000) => {
    try {
        const response = await axiosInstance.get(`/order/date-range`, {
            params: {
                startDate,
                endDate,
                page,
                limit
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        throw error;
    }
};

export default getOrdersByDateRangeApi;