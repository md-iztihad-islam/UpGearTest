import {
    addFilterItemRepository,
    deleteFilterItemByIdRepository,
    updateFilterItemByIdRepository,
    getAllFilterItemsRepository,
    getFilterItemByIdRepository,
    getFilterItemBySubCategoryIdRepository,
} from "./filterItemRepositories.js";

export const addFilterItemService = async (filterItemData) => {
    try {
        const response = await addFilterItemRepository(filterItemData);
        return response;
    } catch (error) {
        console.log("Error in addFilterItemService:", error);
        return {
            message: "Error adding filter item in service",
        };
    }
};

export const deleteFilterItemByIdService = async (filterItemId) => {
    try {
        const response = await deleteFilterItemByIdRepository(filterItemId);
        return response;
    } catch (error) {
        console.log("Error in deleteFilterItemByIdService:", error);
        return {
            message: "Error deleting filter item in service",
        };
    }
};

export const updateFilterItemByIdService = async (filterItemId, updateData) => {
    try {
        const response = await updateFilterItemByIdRepository(filterItemId, updateData);
        return response;
    } catch (error) {
        console.log("Error in updateFilterItemByIdService:", error);
        return {
            message: "Error updating filter item in service",
        };
    }
};

export const getAllFilterItemsService = async () => {
    try {
        const response = await getAllFilterItemsRepository();
        return response;
    } catch (error) {
        console.log("Error in getAllFilterItemsService:", error);
        return {
            message: "Error fetching filter items in service",
        };
    }
};

export const getFilterItemByIdService = async (filterItemId) => {
    try {
        const response = await getFilterItemByIdRepository(filterItemId);
        return response;
    } catch (error) {
        console.log("Error in getFilterItemByIdService:", error);
        return {
            message: "Error fetching filter item by ID in service",
        };
    }
};

export const getFilterItemBySubCategoryIdService = async (subCategoryId) => {
    try {
        const response = await getFilterItemBySubCategoryIdRepository(subCategoryId);
        return response;
    } catch (error) {   
        console.log("Error in getFilterItemBySubCategoryIdService:", error);
        return {
            message: "Error fetching filter items by sub-category ID in service",
        };
    }
};