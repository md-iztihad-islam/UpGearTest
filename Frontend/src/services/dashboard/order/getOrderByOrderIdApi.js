import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function getOrderByOrderIdApi(orderId) {
    try {
        const response = await axiosInstance.get(`/order/get-order/${orderId}`);
        const data = await response.data;
        
        return data;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
}