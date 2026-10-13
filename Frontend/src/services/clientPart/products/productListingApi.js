import axiosInstance from "@/helpers/dashboard/axiosInstance";

// All storefront product lists share one backend contract:
//   GET <endpoint>?query=&subCategories=a,b&brands=x&filterItems=i,j
//                 &minPrice=&maxPrice=&inStock=true&sortBy=&page=&limit=
// Response: { success, data: { products, page, limit, totalCount, totalPages,
//             sortBy, facets: { subCategories, brands, filters, priceRange } } }

const toQueryParams = ({
    query,
    subCategories = [],
    brands = [],
    filterItems = [],
    minPrice,
    maxPrice,
    inStock,
    sortBy,
    page,
    limit,
    includeDrafts,
} = {}) => {
    const params = {};
    if (query?.trim()) params.query = query.trim();
    if (subCategories.length) params.subCategories = subCategories.join(",");
    if (brands.length) params.brands = brands.join(",");
    if (filterItems.length) params.filterItems = filterItems.join(",");
    if (minPrice !== undefined && minPrice !== "") params.minPrice = minPrice;
    if (maxPrice !== undefined && maxPrice !== "") params.maxPrice = maxPrice;
    if (inStock) params.inStock = "true";
    if (sortBy) params.sortBy = sortBy;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (includeDrafts) params.includeDrafts = "true";
    return params;
};

const getListing = async (url, options) => {
    const response = await axiosInstance.get(url, { params: toQueryParams(options) });
    return response.data;
};

export const searchProductsApi = (options) => getListing("/product/search-products", options);
export const getShopProductsApi = (options) => getListing("/product/get-shop-products", options);
export const getNewArrivalsApi = (options) => getListing("/product/get-new-arrivals", options);
export const getHotDealsApi = (options) => getListing("/product/get-hot-deals", options);
export const getDiscountedProductsApi = (options) => getListing("/product/get-discounted-products", options);

export const getProductsBySubCategoryApi = (subCategorySlug, brandSlug, options) =>
    getListing(
        brandSlug
            ? `/product/get-products-by-subcategory/${subCategorySlug}/brand/${brandSlug}`
            : `/product/get-products-by-subcategory/${subCategorySlug}`,
        options
    );
