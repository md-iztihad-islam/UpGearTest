import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function acceptOrderApi(orderId) {
    try {
        console.log("Accepting order with ID:", orderId);
        const response = await axiosInstance.patch(`/order/accept-order/${orderId}`);

        const data = await response.data;   
        return data;
    } catch (error) {
        console.error('Error accepting order:', error);
        throw error;
    }
}