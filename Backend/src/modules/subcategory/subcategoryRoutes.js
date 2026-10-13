import express from "express";
import {
    addSubCategoryController,
    deleteSubCategoryByIdController,
    getAllSubCategoriesController,
    getSubCategoryByIdController,
    updateSubCategoryByIdController,
    getSubCategoriesByCategoryIdController,
} from "./subcategoryControllers.js";
import { s3Uploader } from "../../config/multerConfig.js";

const router = express.Router();

// Optional square image shown on the home page slider (form field "image").
router.post("/add-subcategory", s3Uploader.single("image"), addSubCategoryController);
router.get("/get-all-subcategories", getAllSubCategoriesController);
router.get("/get-subcategory-by-id/:subCategoryId", getSubCategoryByIdController);
router.put("/update-subcategory-by-id/:subCategoryId", s3Uploader.single("image"), updateSubCategoryByIdController);
router.delete("/delete-subcategory-by-id/:subCategoryId", deleteSubCategoryByIdController);
router.get("/get-subcategories-by-category-id/:categoryId", getSubCategoriesByCategoryIdController);

export default router;
