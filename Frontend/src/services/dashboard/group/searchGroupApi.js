import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function searchGroupApi(keyword, limit = 10, page = 1) {
    try {
        const response = await axiosInstance.get(
            `/group/search-groups?keyword=${encodeURIComponent(keyword)}&limit=${limit}&page=${page}`
        );
        return response.data;
    } catch (error) {
        console.error('Error searching groups:', error);
        throw error;
    }
}

export default searchGroupApi;