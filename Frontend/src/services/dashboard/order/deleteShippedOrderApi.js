import axiosInstance from "@/helpers/dashboard/axiosInstance";

// Deletes a shipped order record. Stock is not touched by the backend.
export default async function deleteShippedOrderApi(orderId) {
    try {
        const response = await axiosInstance.delete(`/order/delete-shipped-order/${orderId}`);

        return response.data;
    } catch (error) {
        console.error('Error deleting shipped order:', error);
        throw error;
    }
}
