import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addGroupApi(groupData) {
    try {
        const response = await axiosInstance.post('/group/add-group', groupData);
        return response.data;
    } catch (error) {
        console.log('Error adding group:', error);
        return null;
    }
}

export default addGroupApi;