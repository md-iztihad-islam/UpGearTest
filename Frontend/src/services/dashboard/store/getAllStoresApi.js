import axiosInstance from "../../../helpers/dashboard/axiosInstance";

async function getAllStoresApi() {
    try {
        const response = await axiosInstance.get('/store/get-all-stores');
        return response.data;
    } catch (error) {
        console.log("Get all stores error:", error);
        throw error;
    }
}

export default getAllStoresApi;