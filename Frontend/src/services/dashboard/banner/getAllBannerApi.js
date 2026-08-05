import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllBannerApi() {
    try {
        const response = await axiosInstance.get("/banner/get-all-banners");
        return response.data;
    } catch (error) {
        console.log("Error in getAllBannerApi:", error);
        return null;
    }
}

export default getAllBannerApi;