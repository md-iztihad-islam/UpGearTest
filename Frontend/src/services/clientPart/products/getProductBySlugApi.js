import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getProductBySlugApi(slug) {
    if (!slug) {
        throw new Error("Slug is required");
    }

    const response = await axiosInstance.get(`/product/get-product-by-slug/${slug}`);
    return response.data;
}

export default getProductBySlugApi;