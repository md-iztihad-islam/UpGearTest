import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addStockApi(stockData) {
    try {
        const response = await axiosInstance.post("/stock/add-stock", stockData);
        return response.data;
    } catch (error) {
        console.log("Error in addStockApi:", error);
        return null;
    }
}

export default addStockApi;