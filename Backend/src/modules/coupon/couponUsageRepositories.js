import { prisma } from "../../utils/prisma.js";

export const addCouponUsageRepository = async (couponUsageData) => {
    try {
        const response = await prisma.couponUsage.create({
            data: couponUsageData,
        });
        return response;
    } catch (error) {
        console.log("Error in addCouponUsageRepository:", error);
        return {
            message: "Error adding coupon usage in repository",
        };
    }
};

export const deleteCouponUsageByIdRepository = async (couponUsageId) => {
    try {
        const response = await prisma.couponUsage.delete({
            where: {
                couponUsageId: couponUsageId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteCouponUsageByIdRepository:", error);
        return {
            message: "Error deleting coupon usage in repository",
        };
    }
};

export const updateCouponUsageByIdRepository = async (couponUsageId, updateData) => {
    try {
        const response = await prisma.couponUsage.update({
            where: {
                couponUsageId: couponUsageId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateCouponUsageByIdRepository:", error);
        return {
            message: "Error updating coupon usage in repository",
        };
    }
};

export const getAllCouponUsagesRepository = async () => {
    try {
        const response = await prisma.couponUsage.findMany();
        return response;
    } catch (error) {
        console.log("Error in getAllCouponUsagesRepository:", error);
        return {
            message: "Error fetching coupon usages in repository",
        };
    }
};

export const getCouponUsageByIdRepository = async (couponUsageId) => {
    try {
        const response = await prisma.couponUsage.findUnique({
            where: {
                couponUsageId: couponUsageId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getCouponUsageByIdRepository:", error);
        return {
            message: "Error fetching coupon usage by ID in repository",
        };
    }
};
