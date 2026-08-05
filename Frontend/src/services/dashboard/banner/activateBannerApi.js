import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function activateBannerApi(bannerId) {
    try {
        const response = await axiosInstance.put(`/banner/active-banner/${bannerId}`);
        return response.data;
    } catch (error) {
        console.log("Error in activateBannerApi:", error);
        return null;
    }
}

export default activateBannerApi;