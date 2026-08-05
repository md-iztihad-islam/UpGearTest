import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteBannerApi(bannerId) {
    try {
        const response = await axiosInstance.delete(`/banner/delete-banner/${bannerId}`);
        return response.data;
    } catch (error) {
        console.log("Error in deleteBannerApi:", error);
        return null;
    }
}

export default deleteBannerApi;