import { activeBannerByIdRepository, addBannerRepository, deactiveBannerByIdRepository, deleteBannerByIdRepository, getActiveBannersInOrderRepository, getAllBannersInOrderRepository, getDeactiveBannersInOrderRepository } from "./bannerRepositories.js";

export const addBannerService = async (bannerData) => {
    try {
        const response = await addBannerRepository(bannerData);
        return response;
    } catch (error) {
        console.log("Error in addBannerService:", error);
        return {
            message: "Error adding banner in service",
        }
    }
}

export const deleteBannerByIdService = async (bannerId) => {
    try {
        const response = await deleteBannerByIdRepository(bannerId);
        return response;
    } catch (error) {
        console.log("Error in deleteBannerByIdService:", error);
        return {
            message: "Error deleting banner in service",
        }
    }
}

export const getAllBannersInOrderService = async () => {
    try {
        const response = await getAllBannersInOrderRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllBannersInOrderService:", error);
        return {
            message: "Error fetching banners in service",
        }
    }
}

export const deactiveBannerByIdService = async (bannerId) => {
    try {
        const response = await deactiveBannerByIdRepository(bannerId);
        return response;
    } catch (error) {
        console.log("Error in deactiveBannerByIdService:", error);
        return {
            message: "Error deactivating banner in service",
        }
    }
}

export const activeBannerByIdService = async (bannerId) => {
    try {
        const response = await activeBannerByIdRepository(bannerId);
        return response;
    } catch (error) {
        console.log("Error in activeBannerByIdService:", error);
        return {
            message: "Error activating banner in service",
        }
    }
}

export const getActiveBannersInOrderService = async () => {
    try {
        const response = await getActiveBannersInOrderRepository();
        return response;
    } catch (error) {
        console.log("Error in getActiveBannersInOrderService:", error);
        return {
            message: "Error fetching active banners in service",
        }
    }
}

export const getDeactiveBannersInOrderService = async () => {
    try {
        const response = await getDeactiveBannersInOrderRepository();
        return response;
    } catch (error) {
        console.log("Error in getDeactiveBannersInOrderService:", error);
        return {
            message: "Error fetching deactive banners in service",
        }
    }
}