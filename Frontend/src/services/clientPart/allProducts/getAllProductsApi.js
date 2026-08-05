// services/clientPart/products/getAllProductsApi.js
import axiosInstance from "@/helpers/dashboard/axiosInstance";

const getAllProductsApi = async ({ page = 1, limit = 16, sortBy = 'featured' } = {}) => {
    try {
        const response = await axiosInstance.get('/product/get-all-products', {
            params: {
                page,
                limit,
                sortBy
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export default getAllProductsApi;