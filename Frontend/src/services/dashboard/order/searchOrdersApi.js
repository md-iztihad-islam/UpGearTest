import axiosInstance from "@/helpers/dashboard/axiosInstance";

// Find orders by order id, customer phone or customer name.
// Response: { success, orders }
export default async function searchOrdersApi(query) {
    const response = await axiosInstance.get("/order/search-orders", { params: { query } });
    return response.data;
}
