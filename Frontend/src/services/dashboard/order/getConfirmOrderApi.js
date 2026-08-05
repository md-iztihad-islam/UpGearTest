import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function confirmOrderApi(orderId, orderData) {
    try {
        const response = await axiosInstance.patch(`/order/confirm/${orderId}`, { orderData });
        
        const data = await response.data;
        
        
        return data;
    } catch (error) {
        console.error('Error confirming order:', error);
        throw error;
    }
}