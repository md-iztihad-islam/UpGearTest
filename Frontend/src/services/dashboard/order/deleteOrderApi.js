import axiosInstance from "@/helpers/dashboard/axiosInstance";

export default async function deleteOrderApi(orderId) {
    try {
        const response = await axiosInstance.delete(`/order/delete-order/${orderId}`);

        const data = await response.data;   
        return data;
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
}