import axiosInstance from "@/helpers/dashboard/axiosInstance";

// Dashboard Sell (POS). Throws on failure so the caller can show the
// server's message. Response: { success, message, data: order }
async function addOrderFromDashboardApi(orderData) {
    const response = await axiosInstance.post("/order/dashboard/add", orderData);
    return response.data;
}

export default addOrderFromDashboardApi;
