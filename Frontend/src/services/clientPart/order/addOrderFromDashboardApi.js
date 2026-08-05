import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addOrderFromDashboardApi(orderData) {
    try {
        const response = await axiosInstance.post("/order/dashboard/add", orderData);
        return response.data;
    } catch (error) {
        console.log("Error in addOrderApi:", error);
        return null;
    }
}

export default addOrderFromDashboardApi;