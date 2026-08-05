import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function getCouponByCodeApi(couponCode) {
    try {
        const response = await axiosInstance.get(`/coupon/get-coupon-by-code/${couponCode}`);
        return response.data;
    } catch (error) {
        console.log('Error fetching coupon by code:', error);
        return null;
    }
}

export default getCouponByCodeApi;