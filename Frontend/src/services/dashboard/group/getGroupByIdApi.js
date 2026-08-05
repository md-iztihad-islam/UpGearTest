import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getGroupByIdApi(groupId) {
    try {
        const response = await axiosInstance.get(`/group/get-group-by-id/${groupId}`);
        return response.data;
    } catch (error) {
        console.log('Error fetching group by ID:', error);
        return null;
    }
}

export default getGroupByIdApi;