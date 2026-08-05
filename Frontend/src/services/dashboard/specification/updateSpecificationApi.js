import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateSpecificationApi(specificationId, specificationData){ 
    try {
        const response = await axiosInstance.put(`/specification/update-specification-by-id/${specificationId}`, specificationData);
        return response.data;
    } catch (error) {
        console.log("Error in updateSpecificationApi:", error);
        return null;
    }
}

export default updateSpecificationApi;