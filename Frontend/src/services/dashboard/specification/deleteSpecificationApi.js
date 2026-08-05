import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteSpecificationApi(specificationId){ 
    try {
        const response = await axiosInstance.delete(`/specification/delete-specification-by-id/${specificationId}`);
        return response.data;
    } catch (error) {
        console.log("Error in deleteSpecificationApi:", error);
        return null;
    }
}

export default deleteSpecificationApi;