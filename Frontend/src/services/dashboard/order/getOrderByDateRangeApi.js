import axiosInstance from "@/helpers/dashboard/axiosInstance";

const getOrdersByDateRangeApi = async (startDate, endDate) => {
    try {
        const response = await axiosInstance.get('/orders/report/date-range', {
            params: {
                startDate,
                endDate
            }
        });
        return response;
    } catch (error) {
        console.error("Error fetching orders by date range:", error);
        throw error;
    }
};

export default getOrdersByDateRangeApi;