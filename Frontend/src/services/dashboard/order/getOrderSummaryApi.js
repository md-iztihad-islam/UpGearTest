import axiosInstance from "@/helpers/dashboard/axiosInstance";

// { success, data: { pendingCount, revenue, soldOrders } }
// revenue = accepted + shipped orders, subtotal minus discount (no delivery).
export default async function getOrderSummaryApi() {
    const response = await axiosInstance.get("/order/summary");
    return response.data;
}
