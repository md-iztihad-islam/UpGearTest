import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getDeactivatedBannerApi() {
    try {
        const response = await axiosInstance.get("/banner/get-deactive-banners");
        return response.data;
    } catch (error) {
        console.log("Error in getDeactivatedBannerApi:", error);
        return null;
    }
}

export default getDeactivatedBannerApi;