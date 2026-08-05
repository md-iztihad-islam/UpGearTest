import { prisma } from "../../utils/prisma.js";

export const addBannerRepository = async (bannerData) => {
    try{
        const response = await prisma.banner.create({
            data: bannerData,
        })

        return response;
    }catch(error){
        console.log("Error in addBannerRepository:", error);
        return {
            message: "Error adding banner in repository",
        }
    }
}

export const deleteBannerByIdRepository = async (bannerId) => {
    try {
        const response = await prisma.banner.delete({
            where: {
                bannerId: bannerId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteBannerByIdRepository:", error);
        return {
            message: "Error deleting banner in repository",
        }
    }
}

export const getAllBannersInOrderRepository = async () => {
    try {
        const response = await prisma.banner.findMany({
            orderBy: {
                orderIndex: 'asc',
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllBannersInOrderRepository:", error);
        return {
            message: "Error fetching banners in repository",
        }
    }
}

export const deactiveBannerByIdRepository = async (bannerId) => {
    try {
        const response = await prisma.banner.update({
            where: {
                bannerId: bannerId,
            },
            data: {
                status: "inactive",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deactiveBannerByIdRepository:", error);
        return {
            message: "Error deactivating banner in repository",
        }
    }
}

export const activeBannerByIdRepository = async (bannerId) => {
    try {
        const response = await prisma.banner.update({
            where: {
                bannerId: bannerId,
            },
            data: {
                status: "active",
            },
        });
        return response;
    } catch (error) {
        console.log("Error in activeBannerByIdRepository:", error);
        return {
            message: "Error activating banner in repository",
        }
    }
}

export const getActiveBannersInOrderRepository = async () => {
    try {
        const response = await prisma.banner.findMany({
            where: {
                status: "active",
            },
            orderBy: {
                orderIndex: 'asc',
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getActiveBannersInOrderRepository:", error);
        return {
            message: "Error fetching active banners in repository",
        }
    }
}

export  const getDeactiveBannersInOrderRepository = async () => {
    try {
        const response = await prisma.banner.findMany({
            where: {
                status: "inactive",
            },
            orderBy: {
                orderIndex: 'asc',
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getDeactiveBannersInOrderRepository:", error);
        return {
            message: "Error fetching deactive banners in repository",
        }
    }
}