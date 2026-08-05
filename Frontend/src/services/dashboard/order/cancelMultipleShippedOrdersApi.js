import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function cancelMultipleShippedOrdersApi(orderIds) {
    try {
        const response = await axiosInstance.patch(`/order/cancel-multiple-shipped-orders`, { orderIds });

        return response.data;   
    } catch (error) {
        console.error('Error accepting order:', error);
        throw error;
    }
}