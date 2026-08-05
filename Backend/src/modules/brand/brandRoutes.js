import express from "express";
import { addBrandController, deleteBrandByIdController, getAllBrandsController, getBrandByIdController, updateBrandByIdController } from "./brandControllers.js";

const router = express.Router();

router.post('/add-brand', addBrandController);
router.get('/get-all-brands', getAllBrandsController);
router.get('/get-brand-by-id/:brandId', getBrandByIdController);
router.put('/update-brand-by-id/:brandId', updateBrandByIdController);
router.delete('/delete-brand-by-id/:brandId', deleteBrandByIdController);

export default router;