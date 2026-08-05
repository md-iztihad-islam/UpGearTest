import {
    addBrandRepository,
    deleteBrandByIdRepository,
    updateBrandByIdRepository,
    getAllBrandsRepository,
    getBrandByIdRepository,
} from "./brandRepositories.js";

export const addBrandService = async (brandData) => {
    try {
        const response = await addBrandRepository(brandData);
        return response;
    } catch (error) {
        console.log("Error in addBrandService:", error);
        return {
            message: "Error adding brand in service",
        };
    }
};

export const deleteBrandByIdService = async (brandId) => {
    try {
        const response = await deleteBrandByIdRepository(brandId);
        return response;
    } catch (error) {
        console.log("Error in deleteBrandByIdService:", error);
        return {
            message: "Error deleting brand in service",
        };
    }
};

export const updateBrandByIdService = async (brandId, updateData) => {
    try {
        const response = await updateBrandByIdRepository(brandId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateBrandByIdService:", error);
        return {
            message: "Error updating brand in service",
        };
    }
};

export const getAllBrandsService = async () => {
    try {
        const response = await getAllBrandsRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllBrandsService:", error);
        return {
            message: "Error fetching brands in service",
        };
    }
};

export const getBrandByIdService = async (brandId) => {
    try {
        const response = await getBrandByIdRepository(brandId);
        return response;
    } catch (error) {
        console.log("Error in getBrandByIdService:", error);
        return {
            message: "Error fetching brand by ID in service",
        };
    }
};
