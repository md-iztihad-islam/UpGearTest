import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteDiscountedApi(discountedId) {
    try {
        const response = await axiosInstance.delete(`/discounted/delete-discounted/${discountedId}`);
        return response.data;
    } catch (error) {
        console.log('Error deleting from discounted:', error);
        return null;
    }
}

export default deleteDiscountedApi;