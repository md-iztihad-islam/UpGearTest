import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function cancelMultipleAcceptedOrdersApi(orderIds) {
    try {
        const response = await axiosInstance.patch(`/order/cancel-multiple-accepted-orders`, { orderIds });

        return response.data;   
    } catch (error) {
        console.error('Error accepting order:', error);
        throw error;
    }
}