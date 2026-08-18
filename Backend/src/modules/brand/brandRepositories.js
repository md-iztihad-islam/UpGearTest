import { prisma } from "../../utils/prisma.js";

export const addBrandRepository = async (brandData) => {
    try {
        const response = await prisma.brand.create({
            data: brandData,
        });
        return response;
    } catch (error) {
        console.log("Error in addBrandRepository:", error);
        return {
            message: "Error adding brand in repository",
        }
    }
}

export const deleteBrandByIdRepository = async (brandId) => {
    try {
        const response = await prisma.brand.delete({
            where: {
                brandId: brandId,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in deleteBrandByIdRepository:", error);
        return {
            message: "Error deleting brand in repository",
        }
    }
}

export const updateBrandByIdRepository = async (brandId, updateData) => {
    try {
        const response = await prisma.brand.update({
            where: {
                brandId: brandId,
            },
            data: updateData,
        });
        return response;
    } catch (error) {
        console.log("Error in updateBrandByIdRepository:", error);
        return {
            message: "Error updating brand in repository",
        }
    }
}

export const getAllBrandsRepository = async () => {
    try {
        const response = await prisma.brand.findMany({
            orderBy: {
                title: 'asc',
            },
            include: {
                subCategory: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getAllBrandsRepository:", error);
        return {
            message: "Error fetching brands in repository",
        }
    }
}

export const getBrandByIdRepository = async (brandId) => {
    try {
        const response = await prisma.brand.findUnique({
            where: {
                brandId: brandId,
            },
            include: {
                subCategory: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getBrandByIdRepository:", error);
        return {
            message: "Error fetching brand by ID in repository",
        }
    }
}

export const getBrandsBySubCategoryIdRepository = async (subCategoryId) => {
    try {
        const response = await prisma.brand.findMany({  
            where: {
                subCategoryId: subCategoryId,
            },
            orderBy: {
                title: 'asc',
            },
            include: {
                subCategory: true,
            },
        });
        return response;
    } catch (error) {
        console.log("Error in getBrandsBySubCategoryIdRepository:", error); 
        return {
            message: "Error fetching brands by subCategoryId in repository",
        }
    }
}