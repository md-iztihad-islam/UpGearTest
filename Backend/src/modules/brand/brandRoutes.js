import express from "express";
import { addBrandController, deleteBrandByIdController, getAllBrandsController, getBrandByIdController, getBrandsBySubCategoryIdController, updateBrandByIdController } from "./brandControllers.js";

const router = express.Router();

router.post('/add-brand', addBrandController);
router.get('/get-all-brands', getAllBrandsController);
router.get('/get-brand-by-id/:brandId', getBrandByIdController);
router.put('/update-brand-by-id/:brandId', updateBrandByIdController);
router.delete('/delete-brand-by-id/:brandId', deleteBrandByIdController);
router.get('/get-brands-by-sub-category-id/:subCategoryId', getBrandsBySubCategoryIdController);

export default router;