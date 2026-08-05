import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getStockByProductidApi(productId) {
    try {
        const response = await axiosInstance.get(`/stock/get-stock-by-product-id/${productId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getStockByProductIdApi:", error);
        return null;
    }
}

export default getStockByProductidApi;