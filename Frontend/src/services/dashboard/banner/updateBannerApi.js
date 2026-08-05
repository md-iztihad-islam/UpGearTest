import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateBannerApi(bannerId, bannerData) {
    try {
        const response = await axiosInstance.put(`/banner/update-banner/${bannerId}`, bannerData);
        return response.data;
    } catch (error) {
        console.log("Error in updateBannerApi:", error);
        return null;
    }
}

export default updateBannerApi;