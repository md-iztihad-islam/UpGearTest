import {
    addSpecificationRepository,
    deleteSpecificationByIdRepository,
    updateSpecificationByIdRepository,
    getAllSpecificationsRepository,
    getSpecificationByIdRepository,
    getSpecificationBySubCategoryIdRepository,
} from "./specificationRepositories.js";

export const addSpecificationService = async (specificationData) => {
    try {
        const response = await addSpecificationRepository(specificationData);
        return response;
    } catch (error) {
        console.log("Error in addSpecificationService:", error);
        return {
            message: "Error adding specification in service",
        };
    }
};

export const deleteSpecificationByIdService = async (specificationId) => {
    try {
        const response = await deleteSpecificationByIdRepository(specificationId);
        return response;
    } catch (error) {
        console.log("Error in deleteSpecificationByIdService:", error);
        return {
            message: "Error deleting specification in service",
        };
    }
};

export const updateSpecificationByIdService = async (specificationId, updateData) => {
    try {
        const response = await updateSpecificationByIdRepository(specificationId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateSpecificationByIdService:", error);
        return {
            message: "Error updating specification in service",
        };
    }
};

export const getAllSpecificationsService = async () => {
    try {
        const response = await getAllSpecificationsRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllSpecificationsService:", error);
        return {
            message: "Error fetching specifications in service",
        };
    }
};

export const getSpecificationByIdService = async (specificationId) => {
    try {
        const response = await getSpecificationByIdRepository(specificationId);
        return response;
    } catch (error) {
        console.log("Error in getSpecificationByIdService:", error);
        return {
            message: "Error fetching specification by ID in service",
        };
    }
};

export const getSpecificationBySubCategoryIdService = async (subCategoryId) => {
    try {
        const response = await getSpecificationBySubCategoryIdRepository(subCategoryId);
        return response;
    } catch (error) {
        console.log("Error in getSpecificationBySubCategoryIdService:", error);
        return {
            message: error.message || "Error fetching specifications by sub-category ID in service",
        };
    }
};