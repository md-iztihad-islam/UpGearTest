import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllStockApi() {
    try {
        const response = await axiosInstance.get('/stock/get-all-stocks');
        return response.data;
    } catch (error) {
        console.log("Error in getAllStockApi:", error);
        return null;
    }
}

export default getAllStockApi;