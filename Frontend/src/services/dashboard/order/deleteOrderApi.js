import axiosInstance from "@/helpers/dashboard/axiosInstance";

// Only shipped orders can be deleted; stock is not changed.
export default async function deleteOrderApi(orderId) {
    const response = await axiosInstance.delete(`/order/delete-shipped-order/${orderId}`);
    return response.data;
}
