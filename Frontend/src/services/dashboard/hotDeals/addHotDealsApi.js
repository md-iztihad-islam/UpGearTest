import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addHotDeals(groupId) {
    try {
        const response = await axiosInstance.post('/hot-deals/add-hotdeals', {groupId: groupId});
        return response.data;
    } catch (error) {
        console.log('Error adding to hot deals:', error);
        return null;
    }
}

export default addHotDeals;