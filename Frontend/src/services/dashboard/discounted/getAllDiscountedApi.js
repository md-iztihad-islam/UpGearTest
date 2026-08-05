import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllDiscountedApi(){
    try {
        const response = await axiosInstance.get('/discounted/get-discounted');
        return response.data;
    } catch (error) {
        console.log('Error fetching all discounted items:', error);
        return null;
    }
}

export default getAllDiscountedApi;