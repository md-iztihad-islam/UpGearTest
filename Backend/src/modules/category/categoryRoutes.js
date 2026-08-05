import express from "express";
import {
    addCategoryController,
    deleteCategoryByIdController,
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryByIdController,
} from "./categoryControllers.js";

const router = express.Router();

router.post("/add-category", addCategoryController);
router.get("/get-all-categories", getAllCategoriesController);
router.get("/get-category-by-id/:categoryId", getCategoryByIdController);
router.put("/update-category-by-id/:categoryId", updateCategoryByIdController);
router.delete("/delete-category-by-id/:categoryId", deleteCategoryByIdController);

export default router;
