import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addBrandApi(brandData) {
    try {
        const response = await axiosInstance.post('/brand/add-brand', brandData);
        return response.data;
    } catch (error) {
        console.log('Error adding brand:', error);
        return null;
    }
}

export default addBrandApi;