import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllHotDealsApi(){
    try {
        const response = await axiosInstance.get('/hot-deals/get-hotdeals');
        return response.data;
    } catch (error) {
        console.log('Error fetching all hot deals:', error);
        return null;
    }
}

export default getAllHotDealsApi;