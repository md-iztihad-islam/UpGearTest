import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getProductByProductIdApi(productId) {
    try {
        const response = await axiosInstance.get(`/product/get-product-by-productid/${productId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getProductByProductIdApi:", error);
        return null;
    }
}

export default getProductByProductIdApi;