import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getBannerByIdApi(bannerId) {
    try {
        const response = await axiosInstance.get(`/banner/get-banner/${bannerId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getBannerByIdApi:", error);
        return null;
    }
}

export default getBannerByIdApi;