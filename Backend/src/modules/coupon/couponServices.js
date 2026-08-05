import {
    addCouponRepository,
    deleteCouponByIdRepository,
    updateCouponByIdRepository,
    getAllCouponsRepository,
    getCouponByIdRepository,
    deactivateCouponByIdRepository,
    activateCouponByIdRepository,
    getInactiveCouponsRepository,
    getActiveCouponsRepository,
    getCouponByCodeRepository,
} from "./couponRepositories.js";

export const addCouponService = async (couponData) => {
    try {
        const response = await addCouponRepository(couponData);
        return response;
    } catch (error) {
        console.log("Error in addCouponService:", error);
        return {
            message: error.message || "Error adding coupon in service",
        };
    }
};

export const deleteCouponByIdService = async (couponId) => {
    try {
        const response = await deleteCouponByIdRepository(couponId);
        return response;
    } catch (error) {
        console.log("Error in deleteCouponByIdService:", error);
        return {
            message: error.message || "Error deleting coupon in service",
        };
    }
};

export const updateCouponByIdService = async (couponId, updateData) => {
    try {
        const response = await updateCouponByIdRepository(couponId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateCouponByIdService:", error);
        return {
            message: error.message || "Error updating coupon in service",
        };
    }
};

export const getAllCouponsService = async () => {
    try {
        const response = await getAllCouponsRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllCouponsService:", error);
        return {
            message: error.message || "Error fetching coupons in service",
        };
    }
};

export const getCouponByIdService = async (couponId) => {
    try {
        const response = await getCouponByIdRepository(couponId);
        return response;
    } catch (error) {
        console.log("Error in getCouponByIdService:", error);
        return {
            message: error.message || "Error fetching coupon by ID in service",
        };
    }
};

export const activateCouponByIdService = async (couponId) => {
    try {
        const response = await activateCouponByIdRepository(couponId);
        return response;
    } catch (error) {
        console.log("Error in activateCouponByIdService:", error);
        return {
            message: error.message || "Error activating coupon in service",
        };
    }
};

export const deactivateCouponByIdService = async (couponId) => {
    try {
        const response = await deactivateCouponByIdRepository(couponId);
        return response;
    } catch (error) {
        console.log("Error in deactivateCouponByIdService:", error);
        return {
            message: error.message || "Error deactivating coupon in service",
        };
    }
};

export const getActiveCouponsService = async () => {
    try {
        const response = await getActiveCouponsRepository();
        return response;
    } catch (error) {
        console.log("Error in getActiveCouponsService:", error);
        return {
            message: error.message || "Error fetching active coupons in service",
        };
    }
};

export const getInactiveCouponsService = async () => {
    try {
        const response = await getInactiveCouponsRepository();
        return response;
    } catch (error) {
        console.log("Error in getInactiveCouponsService:", error);
        return {
            message: error.message || "Error fetching inactive coupons in service",
        };
    }
};

export const getCouponByCodeService = async (couponCode) => {
    try {
        const response = await getCouponByCodeRepository(couponCode);
        return response;
    } catch (error) {
        console.log("Error in getCouponByCodeService:", error);
        return {
            message: error.message || "Error fetching coupon by code in service",
        };
    }
}