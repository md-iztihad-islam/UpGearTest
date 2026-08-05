import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateProductByIdApi(productId, formData) {
    try {
        const response = await axiosInstance.put(`/product/update-product-by-id/${productId}`, formData);
        return response.data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

export default updateProductByIdApi;