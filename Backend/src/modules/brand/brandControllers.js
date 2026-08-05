import {
    addBrandService,
    deleteBrandByIdService,
    updateBrandByIdService,
    getAllBrandsService,
    getBrandByIdService,
} from "./brandServices.js";

export const addBrandController = async (req, res) => {
    try {
        const brandData = { ...req.body };

        if (!brandData.title) {
            return res.status(400).json({ 
                success: false, 
                message: "Brand title is required" 
            });
        }

        if (!brandData.productType) {
            return res.status(400).json({ 
                success: false, 
                message: "Brand productType is required" 
            });
        }

        if (!brandData.slug) {
            return res.status(400).json({ 
                success: false, 
                message: "Brand slug is required" 
            });
        }

        const response = await addBrandService(brandData);

        if (!response || response.message) {
            return res.status(500).json({ 
                success: false, 
                message: response?.message || "Error adding brand" 
            });
        }

        return res.status(201).json({ 
            success: true, 
            message: "Brand added successfully", 
            data: response 
        });
    } catch (error) {
        console.log("Error in addBrandController:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Error adding brand in controller" 
        });
    }
};

export const getAllBrandsController = async (req, res) => {
    try {
        const response = await getAllBrandsService();

        if (!response || response.message) {
            return res.status(500).json({ 
                success: false, 
                message: response?.message || "Error fetching brands" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            data: response 
        });
    } catch (error) {
        console.log("Error in getAllBrandsController:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Error fetching brands in controller" 
        });
    }
};

export const getBrandByIdController = async (req, res) => {
    try {
        const brandId = req.params.brandId;

        if (!brandId) {
            return res.status(400).json({ 
                success: false, 
                message: "Brand id is required" 
            });
        }

        const response = await getBrandByIdService(brandId);

        if (!response || response.message) {
            return res.status(404).json({ 
                success: false, 
                message: response?.message || "Brand not found" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            data: response 
        });
    } catch (error) {
        console.log("Error in getBrandByIdController:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Error fetching brand in controller" 
        });
    }
};

export const updateBrandByIdController = async (req, res) => {
    try {
        const brandId = req.params.brandId;
        const updateData = { ...req.body };

        if (!brandId) {
            return res.status(400).json({ 
                success: false, 
                message: "Brand id is required" 
            });
        }

        const response = await updateBrandByIdService(brandId, updateData);

        if (!response || response.message) {
            return res.status(500).json({ 
                success: false, 
                message: response?.message || "Error updating brand" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Brand updated successfully", 
            data: response 
        });
    } catch (error) {
        console.log("Error in updateBrandByIdController:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Error updating brand in controller" });
    }
};

export const deleteBrandByIdController = async (req, res) => {
    try {
        const brandId = req.params.brandId;

        if (!brandId) {
            return res.status(400).json({ 
                success: false, 
                message: "Brand id is required" 
            });
        }

        const response = await deleteBrandByIdService(brandId);

        if (!response || response.message) {
            return res.status(500).json({ 
                success: false, 
                message: response?.message || "Error deleting brand" 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Brand deleted successfully", 
            data: response 
        });
    } catch (error) {
        console.log("Error in deleteBrandByIdController:", error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Error deleting brand in controller" });
    }
};
