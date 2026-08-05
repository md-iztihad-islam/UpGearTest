import { prisma } from "../../utils/prisma.js";

export const addCouponRepository = async (couponData) => {
    try {
        const response = await prisma.coupon.create({
            data: couponData,
        });
        return response;
    } catch (error) {
        console.log("Error in addCouponRepository:", error);
        return {
            message: "Error adding coupon in repository",
        };
    }
};

export const deleteCouponByIdRepository = async (couponId) => {
    try {
        const response = await prisma.coupon.delete({
            where: {
                couponId: couponId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteCouponByIdRepository:", error);
        return {
            message: "Error deleting coupon in repository",
        };
    }
};

export const updateCouponByIdRepository = async (couponId, updateData) => {
    try {
        const response = await prisma.coupon.update({
            where: {
                couponId: couponId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateCouponByIdRepository:", error);
        return {
            message: "Error updating coupon in repository",
        };
    }
};

export const getAllCouponsRepository = async () => {
    try {
        const response = await prisma.coupon.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllCouponsRepository:", error);
        return {
            message: "Error fetching coupons in repository",
        };
    }
};

export const getCouponByIdRepository = async (couponId) => {
    try {
        const response = await prisma.coupon.findUnique({
            where: {
                couponId: couponId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getCouponByIdRepository:", error);
        return {
            message: "Error fetching coupon by ID in repository",
        };
    }
};

export const activateCouponByIdRepository = async (couponId) => {
    try {
        const response = await prisma.coupon.update({
            where: {
                couponId: couponId,
            },
            data: {
                isActive: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in activateCouponByIdRepository:", error);
        return {
            message: "Error activating coupon in repository",
        };
    }
};

export const deactivateCouponByIdRepository = async (couponId) => {
    try {
        const response = await prisma.coupon.update({
            where: {
                couponId: couponId,
            },
            data: {
                isActive: false,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deactivateCouponByIdRepository:", error);
        return {
            message: "Error deactivating coupon in repository",
        };
    }
};

export const getActiveCouponsRepository = async () => {
    try {
        const response = await prisma.coupon.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getActiveCouponsRepository:", error);
        return {
            message: "Error fetching active coupons in repository",
        };
    }
};

export const getInactiveCouponsRepository = async () => {
    try {
        const response = await prisma.coupon.findMany({
            where: {
                isActive: false,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getInactiveCouponsRepository:", error);
        return {
            message: "Error fetching inactive coupons in repository",
        };
    }
};

export const getCouponByCodeRepository = async (couponCode) => {
    try {
        const response = await prisma.coupon.findUnique({
            where: {
                code: couponCode,
                
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getCouponByCodeRepository:", error);
        return {
            message: "Error fetching coupon by code in repository",
        };
    }
}

export const addCouponUsageRepository = async (couponId, customerId, orderId) => {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: {
                couponId: couponId,
            },
        });

        if(coupon.maxUsageLimit != 1000000000 && coupon.usedCount < coupon.maxUsageLimit) {

            const response = await prisma.couponUsage.create({
                data: {
                    couponId: couponId,
                    customerId: customerId,
                    orderId: orderId,
                },
            });

            const updatedUsedCount = coupon.usedCount + 1;

            if(updatedUsedCount >= coupon.maxUsageLimit) {
                await prisma.coupon.update({
                    where: {
                        couponId: couponId,
                    },
                    data: {
                        usedCount: updatedUsedCount,
                        isActive: false,
                    },
                });
            }


        }
        return response;
    } catch (error) {
        console.log("Error in addCouponUsageRepository:", error);
        return {
            message: "Error adding coupon usage in repository",
        };
    }
}