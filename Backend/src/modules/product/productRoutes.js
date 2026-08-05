import express from "express";
import {
	addProductController,
	deleteProductByIdController,
	getAllProductsController,
	getProductByIdController,
	getProductBySlugController,
	updateProductByIdController,
} from "./productControllers.js";
import { s3Uploader } from "../../config/multerConfig.js";

const router = express.Router();

router.post(
	"/add-product",
	s3Uploader.fields([
		{ name: "bannerImage", maxCount: 1 },
		{ name: "productImages", maxCount: 10 },
	]),
	addProductController
);
router.get("/get-all-products", getAllProductsController);
router.get("/get-product-by-id/:productId", getProductByIdController);
router.put(
	"/update-product-by-id/:productId",
	s3Uploader.fields([
		{ name: "bannerImage", maxCount: 1 },
		{ name: "productImages", maxCount: 10 },
	]),
	updateProductByIdController
);
router.delete("/delete-product-by-id/:productId", deleteProductByIdController);
router.get("/get-product-by-slug/:slug", getProductBySlugController);

export default router;
