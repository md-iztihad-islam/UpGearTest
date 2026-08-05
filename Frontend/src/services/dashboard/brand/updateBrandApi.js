import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateBrandApi(brandId, updatedData) {
    try {
        const response = await axiosInstance.put(`/brand/update-brand-by-id/${brandId}`, updatedData);
        return response.data;
    } catch (error) {
        console.log('Error updating brand:', error);
        return null;
    }
}

export default updateBrandApi;