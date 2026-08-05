import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addStoreApi(storeData) {
    try {
        const response = await axiosInstance.post('/store/add-store', storeData);
        return response.data;
    } catch (error) {
        console.log("Add store error:", error);
        throw error;
    }
}

export default addStoreApi;