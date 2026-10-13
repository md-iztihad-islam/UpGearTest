import axiosInstance from "@/helpers/dashboard/axiosInstance";

// Deletes several shipped order records. Stock is not touched by the backend.
export default async function deleteMultipleShippedOrdersApi(orderIds) {
    try {
        const response = await axiosInstance.post(`/order/delete-multiple-shipped-orders`, { orderIds });

        return response.data;
    } catch (error) {
        console.error('Error deleting shipped orders:', error);
        throw error;
    }
}
