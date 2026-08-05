import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function incrementCouponUsageApi(couponId) {
    try {
        const response = await axiosInstance.post(`/coupon/increment-usage/${couponId}`);
        return response.data;
    } catch (error) {
        console.log('Error incrementing coupon usage:', error);
        return null;
    }
}

export default incrementCouponUsageApi;