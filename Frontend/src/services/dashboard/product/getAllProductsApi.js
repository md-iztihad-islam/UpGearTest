import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllProductsApi() {
    try {
        const response = await axiosInstance.get(`/product/get-all-products`);
        return response.data;
    } catch (error) {
        console.log("Error in getAllProductsApi:", error);
        return null;
    }
}

export default getAllProductsApi;