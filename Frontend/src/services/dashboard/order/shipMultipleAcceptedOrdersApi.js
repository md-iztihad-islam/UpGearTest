import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function shipMultipleAcceptedOrdersApi(orderIds) {
    try {
        const response = await axiosInstance.patch(`/order/ship-multiple-accepted-orders`, { orderIds });

        return response.data;   
    } catch (error) {
        console.error('Error accepting order:', error);
        throw error;
    }
}