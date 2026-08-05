import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getAllNewArraivals() {
    try {
        const response = await axiosInstance.get('/new-arraivals/get-newarraivals');
        return response.data;
    } catch (error) {
        console.log('Error fetching all new arraivals:', error);
        return null;
    }
}

export default getAllNewArraivals;