import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deactivateBannerApi(bannerId) {
    try {
        const response = await axiosInstance.put(`/banner/deactive-banner/${bannerId}`);
        return response.data;
    } catch (error) {
        console.log("Error in deactivateBannerApi:", error);
        return null;
    }
}

export default deactivateBannerApi;