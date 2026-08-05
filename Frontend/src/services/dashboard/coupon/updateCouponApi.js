import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function updateCouponApi(couponId, updatedData) {
    try {
        const response = await axiosInstance.put(`/coupon/update-coupon-by-id/${couponId}`, updatedData);
        return response.data;
    } catch (error) {
        console.log('Error updating coupon:', error);
        return null;
    }
}

export default updateCouponApi;