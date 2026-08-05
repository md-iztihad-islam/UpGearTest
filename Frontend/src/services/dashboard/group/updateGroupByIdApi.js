import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateGroupByIdApi(groupId, formData) {
    try {
        const response = await axiosInstance.put(
            `/group/update-group-by-id/${groupId}`,
            formData
        );
        return response.data;
    } catch (error) {
        console.error("Error updating group:", error);
        throw error;
    }
}

export default updateGroupByIdApi;