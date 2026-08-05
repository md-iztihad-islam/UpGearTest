import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllBrandsApi() {
    try {
        const response = await axiosInstance.get('/brand/get-all-brands');
        return response.data;
    } catch (error) {
        console.log('Error fetching brands:', error);
        return null;
    }
}

export default getAllBrandsApi;