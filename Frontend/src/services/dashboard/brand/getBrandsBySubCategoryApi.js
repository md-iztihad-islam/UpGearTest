import axiosInstance from "@/helpers/dashboard/axiosInstance";

export const getBrandsBySubCategoryApi = async (subCategoryId) => {
  try {
    const response = await axiosInstance.get(`/brand/get-brands-by-sub-category-id/${subCategoryId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brands by subcategory:', error);
    throw error;
  }
};