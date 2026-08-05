import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getActiveBannerApi() {
    try {
        const response = await axiosInstance.get("/banner/get-active-banners");
        return response.data;
    } catch (error) {
        console.log("Error in getActiveBannerApi:", error);
        return null;
    }
}

export default getActiveBannerApi;