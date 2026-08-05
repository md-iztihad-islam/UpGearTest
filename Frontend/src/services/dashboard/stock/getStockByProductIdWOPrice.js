import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getStockByProductIdWOPriceApi(productId) {
    try {
        const response = await axiosInstance.get(`/stock/get-stock-by-product-id-without-price/${productId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getStockByProductIdWOPriceApi:", error);
        return null;
    }
}

export default getStockByProductIdWOPriceApi;