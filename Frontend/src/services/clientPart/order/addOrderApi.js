import axiosInstance from "@/helpers/dashboard/axiosInstance";

// Storefront checkout. Throws on failure so the caller can show the
// server's message (out of stock, invalid coupon, …).
// Response: { success, message, data: order }
async function addOrderApi(orderData) {
    const response = await axiosInstance.post("/order/add-order", orderData);
    return response.data;
}

export default addOrderApi;
