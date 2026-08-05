import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteGroupByIdApi(groupId) {
    try {
        const response = await axiosInstance.delete(`/group/delete-group-by-id/${groupId}`);
        return response.data;
    } catch (error) {
        console.log('Error deleting group:', error);
        return null;
    }
}

export default deleteGroupByIdApi;