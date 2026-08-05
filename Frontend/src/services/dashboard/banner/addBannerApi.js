import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addBannerApi(bannerData) {
    try {
        const response = await axiosInstance.post("/banner/add-banner", bannerData);
        return response.data;
    } catch (error) {
        console.log("Error in addBannerApi:", error);
        return null;
    }
}

export default addBannerApi;