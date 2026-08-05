import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteProductByIdApi(productId) {
    try {
        const response = await axiosInstance.delete(`/product/delete-product-by-id/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}

export default deleteProductByIdApi;