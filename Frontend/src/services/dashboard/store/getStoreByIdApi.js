import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getStoreByIdApi(storeId) {
    try {
        const response = await axiosInstance.get(`/store/get-store-by-id/${storeId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching store by ID:", error);
        throw error;
    }
}

export default getStoreByIdApi;