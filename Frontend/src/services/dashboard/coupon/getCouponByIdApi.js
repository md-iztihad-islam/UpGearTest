import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getCouponByIdApi(couponId) {
    try {
        const response = await axiosInstance.get(`/coupon/get-coupon/${couponId}`);
        return response.data;
    } catch (error) {
        console.log('Error fetching coupon by ID:', error);
        return null;
    }
}

export default getCouponByIdApi;