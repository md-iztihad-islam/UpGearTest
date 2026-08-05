import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addOrderApi(orderData) {
    try {
        const response = await axiosInstance.post("/order/add-order", orderData);
        return response.data;
    } catch (error) {
        console.log("Error in addOrderApi:", error);
        return null;
    }
}

export default addOrderApi;