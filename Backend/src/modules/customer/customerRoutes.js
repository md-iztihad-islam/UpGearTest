import express from "express";
import {
    addCustomerController,
    deleteCustomerByIdController,
    getAllCustomersController,
    getCustomerByIdController,
    updateCustomerByIdController,
} from "./customerControllers.js";

const router = express.Router();

router.post("/add-customer", addCustomerController);
router.get("/get-all-customers", getAllCustomersController);
router.get("/get-customer-by-id/:customerId", getCustomerByIdController);
router.put("/update-customer-by-id/:customerId", updateCustomerByIdController);
router.delete("/delete-customer-by-id/:customerId", deleteCustomerByIdController);

export default router;
