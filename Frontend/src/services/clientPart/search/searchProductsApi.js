import { searchProductsApi as searchListingApi } from "@/services/clientPart/products/productListingApi";

// Kept for existing callers (navbar search, dashboard POS search).
// Response: { success, data: { products, totalCount, ... } }
const searchProductsApi = async ({ query = "", page = 1, limit = 10, sortBy = "relevance", includeDrafts = false } = {}) => {
    try {
        return await searchListingApi({ query, page, limit, sortBy, includeDrafts });
    } catch (error) {
        console.error("Search products error:", error);
        throw error;
    }
};

export default searchProductsApi;
