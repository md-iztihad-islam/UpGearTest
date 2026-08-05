import axiosInstance from "@/helpers/dashboard/axiosInstance";

const addSpecificationApi = async (specificationData) => {
    try {
        const response = await axiosInstance.post("/specification/add-specification", specificationData);
        return response.data;
    } catch (error) {
        console.log("Error in addSpecificationApi:", error);
        return null;
    }
}

export default addSpecificationApi;