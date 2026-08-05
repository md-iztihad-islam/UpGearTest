import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteHotdealsApi(hotDealsId) {
    try {
        const response = await axiosInstance.delete(`/hot-deals/delete-hotdeals/${hotDealsId}`);
        return response.data;
    } catch (error) {
        console.log('Error deleting from hot deals:', error);
        return null;
    }
}

export default deleteHotdealsApi;