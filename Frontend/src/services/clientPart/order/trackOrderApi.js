import axiosInstance from "@/helpers/dashboard/axiosInstance";

// Customers look up an order with its id and the phone number used to place it.
// Response: { success, data: order } — 404 when they don't match.
async function trackOrderApi(orderId, phone) {
    const response = await axiosInstance.post("/order/track-order", { orderId, phone });
    return response.data;
}

export default trackOrderApi;
