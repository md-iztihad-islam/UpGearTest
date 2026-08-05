import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addReviewApi({ productId, reviewData }) {
    try {
        const response = await axiosInstance.put(`/product/add-review/${productId}`, reviewData);
        return response.data;
    } catch (error) {
        console.log("Error in addReviewApi:", error);
        return {
            success: false,
            message: "Failed to add review",
        };
    }
}

export default addReviewApi;