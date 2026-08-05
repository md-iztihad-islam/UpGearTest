import axiosInstance from "@/helpers/dashboard/axiosInstance";

const searchProductsApi = async ({ query = "", page = 1, limit = 10,sortBy = 'relevance'} = {}) => {
    try {
        const response = await axiosInstance.get("/product/search", {
            params: {
                q: query,    
                page,
                limit,
                sortBy
            }
        });
        return response.data;
    } catch (error) {
        console.error("Search products error:", error);
        throw error;
    }
};

export default searchProductsApi;