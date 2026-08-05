import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function shipOrderApi(orderId) {
    try {
        const response = await axiosInstance.patch(`/order/ship-order/${orderId}`);

        const data = await response.data;   
        return data;
    } catch (error) {
        console.error('Error shipping order:', error);
        throw error;
    }
}