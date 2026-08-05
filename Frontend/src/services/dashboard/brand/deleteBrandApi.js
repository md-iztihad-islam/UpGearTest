import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteBrandApi(brandId) {
    try {
        const response = await axiosInstance.delete(`/brand/delete-brand-by-id/${brandId}`);
        return response.data;
    } catch (error) {
        console.log('Error deleting brand:', error);
        return null;
    }
}

export default deleteBrandApi;