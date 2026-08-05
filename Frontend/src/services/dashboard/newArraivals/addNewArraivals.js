import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addNewArraivals(groupId) {
    try {
        const response = await axiosInstance.post('/new-arraivals/add-newarraivals', {groupId: groupId});
        return response.data;
    } catch (error) {
        console.log('Error adding to new arraivals:', error);
        return null;
    }
}

export default addNewArraivals;