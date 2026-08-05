import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllGroupApi() {
    try {
        const response = await axiosInstance.get('/group/get-all-groups');
        return response.data;
    } catch (error) {
        console.log('Error fetching groups:', error);
        return null;
    }
}

export default getAllGroupApi;