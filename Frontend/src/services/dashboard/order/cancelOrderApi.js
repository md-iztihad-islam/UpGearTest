import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function cancelOrderApi(orderId) {
    try {
        const response = await axiosInstance.patch(`/order/cancel-order/${orderId}`);

        const data = await response.data;   
        return data;
    } catch (error) {
        console.error('Error canceling order:', error);
        throw error;
    }
}