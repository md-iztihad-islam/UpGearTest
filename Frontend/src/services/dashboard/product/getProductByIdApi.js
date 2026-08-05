import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getProductByIdApi(productId) {
    try {
        const response = await axiosInstance.get(`/product/get-product-by-id/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
    }
}

export default getProductByIdApi;