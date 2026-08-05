import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addDiscountedApi(groupId) {
    try {
        const response = await axiosInstance.post('/discounted/add-discounted', {groupId: groupId});
        return response.data;
    } catch (error) {
        console.log('Error adding to discounted:', error);
        return null;
    }
}

export default addDiscountedApi;