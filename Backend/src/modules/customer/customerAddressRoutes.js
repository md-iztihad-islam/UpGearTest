import express from "express";
import {
    addCustomerAddressController,
    deleteCustomerAddressByIdController,
    getAllCustomerAddressesController,
    getCustomerAddressByIdController,
    updateCustomerAddressByIdController,
} from "./customerAddressControllers.js";

const router = express.Router();

router.post("/add-customer-address", addCustomerAddressController);
router.get("/get-all-customer-addresses", getAllCustomerAddressesController);
router.get("/get-customer-address-by-id/:addressId", getCustomerAddressByIdController);
router.put("/update-customer-address-by-id/:addressId", updateCustomerAddressByIdController);
router.delete("/delete-customer-address-by-id/:addressId", deleteCustomerAddressByIdController);

export default router;
