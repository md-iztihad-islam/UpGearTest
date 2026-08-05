import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getSpecificationByIdApi(specificationId){ 
    try {
        const response = await axiosInstance.get(`/specification/get-specification/${specificationId}`);
        return response.data;
    } catch (error) {
        console.log("Error in getSpecificationByIdApi:", error);
        return null;
    }
}

export default getSpecificationByIdApi;