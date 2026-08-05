import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function acceptMultiplePendingOrdersApi(orderIds) {
    try {
        const response = await axiosInstance.patch(`/order/accept-multiple-pending-orders`, { orderIds });

        return response.data;   
    } catch (error) {
        console.error('Error accepting order:', error);
        throw error;
    }
}