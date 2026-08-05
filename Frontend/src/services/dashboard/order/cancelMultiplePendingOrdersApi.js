import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function cancelMultiplePendingOrdersApi(orderIds) {
    try {
        const response = await axiosInstance.patch(`/order/cancel-multiple-pending-orders`, { orderIds });

        return response.data;   
    } catch (error) {
        console.error('Error accepting order:', error);
        throw error;
    }
}