import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function calculateRevenueForAcceptedOrdersApi() {
    try {
        const response = await axiosInstance.get('/order/revenue/accepted');
        return response.data;
    } catch (error) {
        console.log('Error fetching revenue for accepted orders:', error);
        throw error;
    }
}

export default calculateRevenueForAcceptedOrdersApi;    