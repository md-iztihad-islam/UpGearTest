import axiosInstance from "@/helpers/dashboard/axiosInstance";

async function addCouponApi(couponData) {
    try {
        const response = await axiosInstance.post('/coupon/add-coupon', couponData);

        return response.data;
    } catch (error) {
        console.log('Error adding coupon:', error);
        return null;
    }
}

export default addCouponApi;