import axiosInstance from "@/helpers/dashboard/axiosInstance";

const searchProductsApi = async ({ query = "", page = 1, limit = 10, sortBy = "newest" } = {}) => {
    try {
        const response = await axiosInstance.get("/product/search-products", {
            params: { query, page, limit, sortBy },
        });
        return response.data; // { success, data: { products, page, limit } }
    } catch (error) {
        console.error("Search products error:", error);
        throw error;
    }
};

export default searchProductsApi;