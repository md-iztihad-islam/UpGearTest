import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function deleteNewArraivals(newArraivalsId) {
    try {
        const response = await axiosInstance.delete(`/new-arraivals/delete-newarraivals/${newArraivalsId}`);
        return response.data;
    } catch (error) {
        console.log('Error deleting from new arraivals:', error);
        return null;
    }
}

export default deleteNewArraivals;