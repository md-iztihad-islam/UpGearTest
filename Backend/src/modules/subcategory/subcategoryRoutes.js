import express from "express";
import {
    addSubCategoryController,
    deleteSubCategoryByIdController,
    getAllSubCategoriesController,
    getSubCategoryByIdController,
    updateSubCategoryByIdController,
    getSubCategoriesByCategoryIdController,
} from "./subcategoryControllers.js";

const router = express.Router();

router.post("/add-subcategory", addSubCategoryController);
router.get("/get-all-subcategories", getAllSubCategoriesController);
router.get("/get-subcategory-by-id/:subCategoryId", getSubCategoryByIdController);
router.put("/update-subcategory-by-id/:subCategoryId", updateSubCategoryByIdController);
router.delete("/delete-subcategory-by-id/:subCategoryId", deleteSubCategoryByIdController);
router.get("/get-subcategories-by-category-id/:categoryId", getSubCategoriesByCategoryIdController);

export default router;
