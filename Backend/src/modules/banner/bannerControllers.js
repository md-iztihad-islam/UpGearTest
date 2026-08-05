import { activeBannerByIdService, addBannerService, deactiveBannerByIdService, deleteBannerByIdService, getActiveBannersInOrderService, getAllBannersInOrderService, getDeactiveBannersInOrderService } from "./bannerServices.js";

export const addBannerController = async (req, res) => {
    try {
        const bannerData = { ...req.body };
        const bannerImage = req.file;
        const imageURL = bannerImage?.location || bannerImage?.Location || bannerImage?.path;

        if (!imageURL) {
            return res.status(400).json({
                success: false,
                message: "Banner image is required",
            });
        }

        if (!bannerData.title) {
            return res.status(400).json({
                success: false,
                message: "Banner title is required",
            });
        }

        if (!bannerData.status) {
            return res.status(400).json({
                success: false,
                message: "Banner status is required",
            });
        }

        const parsedOrderIndex = Number.parseInt(bannerData.orderIndex, 10);
        if (Number.isNaN(parsedOrderIndex)) {
            return res.status(400).json({
                success: false,
                message: "Banner orderIndex must be a valid number",
            });
        }

        bannerData.imageURL = imageURL;
        bannerData.orderIndex = parsedOrderIndex;

        const response = await addBannerService(bannerData);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error adding banner",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Banner added successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in addBannerController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error adding banner in controller",
        });
    }
};

export const deleteBannerByIdController = async (req, res) => {
    try {
        const bannerId = req.params.bannerId;
        
        if (!bannerId) {
            return res.status(400).json({
                success: false,
                message: "Banner ID is required",
            });
        }

        const response = await deleteBannerByIdService(bannerId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deleting banner",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deleteBannerByIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error deleting banner in controller",
        });
    }
}

export const getAllBannersInOrderController = async (req, res) => {
    try {
        const response = await getAllBannersInOrderService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching banners",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banners fetched successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in getAllBannersInOrderController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching banners in controller",
        });
    }
}

export const deactiveBannerByIdController = async (req, res) => {
    try {
        const bannerId = req.params.bannerId;

        if (!bannerId) {
            return res.status(400).json({
                success: false,
                message: "Banner ID is required",
            });
        }

        const response = await deactiveBannerByIdService(bannerId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error deactivating banner",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banner deactivated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in deactiveBannerByIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error deactivating banner in controller",
        });
    }
}

export const activeBannerByIdController = async (req, res) => {
    try {
        const bannerId = req.params.bannerId;

        if (!bannerId) {
            return res.status(400).json({
                success: false,
                message: "Banner ID is required",
            });
        }

        const response = await activeBannerByIdService(bannerId);

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error activating banner",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Banner activated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in activeBannerByIdController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error activating banner in controller",
        });
    }
}

export const getActiveBannersInOrderController = async (req, res) => {
    try {
        const response = await getActiveBannersInOrderService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching active banners",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Active banners fetched successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in getActiveBannersInOrderController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching active banners in controller",
        });
    }
}

export const getDeactiveBannersInOrderController = async (req, res) => {
    try {
        const response = await getDeactiveBannersInOrderService();

        if (!response || response.message) {
            return res.status(500).json({
                success: false,
                message: response?.message || "Error fetching deactive banners",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Deactive banners fetched successfully",
            data: response,
        });
    } catch (error) {
        console.log("Error in getDeactiveBannersInOrderController:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Error fetching deactive banners in controller",
        });
    }
}
