import express from "express";
import { addWarrantyController, deleteWarrantyByIdController, getAllWarrantiesController, getWarrantyByIdController, updateWarrantyByIdController } from "./warrantyControllers.js";

const router = express.Router();

router.post('/add-warranty', addWarrantyController);
router.get('/get-all-warranties', getAllWarrantiesController);
router.get('/get-warranty-by-id/:id', getWarrantyByIdController);
router.put('/update-warranty-by-id/:id', updateWarrantyByIdController);
router.delete('/delete-warranty-by-id/:id', deleteWarrantyByIdController);

export default router;