import {
    addCouponUsageRepository,
    deleteCouponUsageByIdRepository,
    updateCouponUsageByIdRepository,
    getAllCouponUsagesRepository,
    getCouponUsageByIdRepository,
} from "./couponUsageRepositories.js";

export const addCouponUsageService = async (couponUsageData) => {
    try {
        const response = await addCouponUsageRepository(couponUsageData);
        return response;
    } catch (error) {
        console.log("Error in addCouponUsageService:", error);
        return {
            message: "Error adding coupon usage in service",
        };
    }
};

export const deleteCouponUsageByIdService = async (couponUsageId) => {
    try {
        const response = await deleteCouponUsageByIdRepository(couponUsageId);
        return response;
    } catch (error) {
        console.log("Error in deleteCouponUsageByIdService:", error);
        return {
            message: "Error deleting coupon usage in service",
        };
    }
};

export const updateCouponUsageByIdService = async (couponUsageId, updateData) => {
    try {
        const response = await updateCouponUsageByIdRepository(couponUsageId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateCouponUsageByIdService:", error);
        return {
            message: "Error updating coupon usage in service",
        };
    }
};

export const getAllCouponUsagesService = async () => {
    try {
        const response = await getAllCouponUsagesRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllCouponUsagesService:", error);
        return {
            message: "Error fetching coupon usages in service",
        };
    }
};

export const getCouponUsageByIdService = async (couponUsageId) => {
    try {
        const response = await getCouponUsageByIdRepository(couponUsageId);
        return response;
    } catch (error) {
        console.log("Error in getCouponUsageByIdService:", error);
        return {
            message: "Error fetching coupon usage by ID in service",
        };
    }
};
