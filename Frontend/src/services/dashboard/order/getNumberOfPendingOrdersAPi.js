import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getNumberOfPendingOrdersApi() {
    try {
        const response = await axiosInstance.get('/order/pending/count');
        return response.data;
    } catch (error) {
        console.log('Error fetching number of pending orders:', error);
        throw error;
    }
}

export default getNumberOfPendingOrdersApi;