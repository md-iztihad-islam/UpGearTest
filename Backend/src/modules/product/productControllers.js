import { R2_PUBLIC_URL } from "../../config/serverConfig.js";
import {
	addProductService,
	deleteProductByIdService,
	getAllProductsService,
	getProductByIdService,
	getProductbySlugService,
	getProductsBySubCategoryService,
	listProductsService,
	updateProductByIdService,
} from "./productServices.js";

const parseDecimal = (value) => {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}

	const parsed = Number.parseFloat(value);
	return Number.isNaN(parsed) ? Number.NaN : parsed;
};

const parseBoolean = (value) => {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}

	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if (normalized === "true") return true;
		if (normalized === "false") return false;
	}

	return undefined;
};

// Discount is always derived from the two prices, never entered by hand.
const calculateDiscount = (mainPrice, price) =>
	Math.max(0, Math.round((mainPrice - price) * 100) / 100);

const getS3URL = (file) => (file?.key ? `${R2_PUBLIC_URL}/${file.key}` : undefined);

export const addProductController = async (req, res) => {
	try {
		const productData = { ...req.body };

		if (!productData.groupId) {
			return res.status(400).json({
				success: false,
				message: "Product groupId is required",
			});
		}

		if (!productData.title) {
			return res.status(400).json({
				success: false,
				message: "Product title is required",
			});
		}

		if (!productData.mainPrice) {
			return res.status(400).json({
				success: false,
				message: "Product mainPrice is required",
			});
		}

		if (!productData.price) {
			return res.status(400).json({
				success: false,
				message: "Product price is required",
			});
		}

		if (!productData.status) {
			return res.status(400).json({
				success: false,
				message: "Product status is required",
			});
		}

		if (!productData.slug) {
			return res.status(400).json({
				success: false,
				message: "Product slug is required",
			});
		}

		const parsedMainPrice = parseDecimal(productData.mainPrice);
		const parsedPrice = parseDecimal(productData.price);

		if (Number.isNaN(parsedMainPrice)) {
			return res.status(400).json({
				success: false,
				message: "Product mainPrice must be a valid number",
			});
		}

		if (Number.isNaN(parsedPrice)) {
			return res.status(400).json({
				success: false,
				message: "Product price must be a valid number",
			});
		}

		const parsedIsNewArrival = parseBoolean(productData.isNewArrival);
		const parsedIsHotDeal = parseBoolean(productData.isHotDeal);
		const parsedIsDiscounted = parseBoolean(productData.isDiscounted);

		let productFilters = [];
		if (productData.productFilters !== undefined) {
			try {
				productFilters = JSON.parse(productData.productFilters);
			} catch (parseError) {
				return res.status(400).json({
					success: false,
					message: "productFilters contained invalid JSON",
				});
			}
			delete productData.productFilters;
		}

		const bannerImageFile = req.files?.bannerImage?.[0];
		const productImageFiles = req.files?.productImages ?? [];

		const bannerImageURL = getS3URL(bannerImageFile);
		const productImageURLs = productImageFiles
			.map(getS3URL)
			.filter(Boolean);

		productData.mainPrice = parsedMainPrice;
		productData.price = parsedPrice;
		productData.discount = calculateDiscount(parsedMainPrice, parsedPrice);

		if (parsedIsNewArrival !== undefined) {
			productData.isNewArrival = parsedIsNewArrival;
		}

		if (parsedIsHotDeal !== undefined) {
			productData.isHotDeal = parsedIsHotDeal;
		}

		if (parsedIsDiscounted !== undefined) {
			productData.isDiscounted = parsedIsDiscounted;
		}

		if (bannerImageURL) {
			productData.bannerImageURL = bannerImageURL;
		}

		if (productData.couponId === "") {
			delete productData.couponId;
		}

		const response = await addProductService(productData, productImageURLs, productFilters);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error adding product",
			});
		}

		return res.status(201).json({
			success: true,
			message: "Product added successfully",
			data: response,
		});
	} catch (error) {
		console.log("Error in addProductController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error adding product in controller",
		});
	}
};

export const getAllProductsController = async (req, res) => {
	try {
		const response = await getAllProductsService();

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error fetching products",
			});
		}

		return res.status(200).json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.log("Error in getAllProductsController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error fetching products in controller",
		});
	}
};

export const getProductByIdController = async (req, res) => {
	try {
		const productId = req.params.productId;

		if (!productId) {
			return res.status(400).json({
				success: false,
				message: "Product id is required",
			});
		}

		const response = await getProductByIdService(productId);

		if (!response || response.message) {
			return res.status(404).json({
				success: false,
				message: response?.message || "Product not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.log("Error in getProductByIdController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error fetching product in controller",
		});
	}
};

export const updateProductByIdController = async (req, res) => {
	try {
		const productId = req.params.productId;
		const updateData = { ...req.body };

		if (!productId) {
			return res.status(400).json({
				success: false,
				message: "Product id is required",
			});
		}

		if (updateData.mainPrice !== undefined) {
			const parsedMainPrice = parseDecimal(updateData.mainPrice);
			if (Number.isNaN(parsedMainPrice)) {
				return res.status(400).json({
					success: false,
					message: "Product mainPrice must be a valid number",
				});
			}
			updateData.mainPrice = parsedMainPrice;
		}

		if (updateData.price !== undefined) {
			const parsedPrice = parseDecimal(updateData.price);
			if (Number.isNaN(parsedPrice)) {
				return res.status(400).json({
					success: false,
					message: "Product price must be a valid number",
				});
			}
			updateData.price = parsedPrice;
		}

		// Recalculate the discount whenever both prices are supplied; a
		// client-sent discount is ignored.
		delete updateData.discount;
		if (updateData.mainPrice !== undefined && updateData.price !== undefined) {
			updateData.discount = calculateDiscount(updateData.mainPrice, updateData.price);
		}

		if (updateData.isNewArrival !== undefined) {
			updateData.isNewArrival = parseBoolean(updateData.isNewArrival);
		}
		if (updateData.isHotDeal !== undefined) {
			updateData.isHotDeal = parseBoolean(updateData.isHotDeal);
		}
		if (updateData.isDiscounted !== undefined) {
			updateData.isDiscounted = parseBoolean(updateData.isDiscounted);
		}

		if (updateData.couponId === "") {
			updateData.couponId = null;
		}

		try {
			if (updateData.existingProductImages !== undefined) {
				updateData.existingProductImages = JSON.parse(updateData.existingProductImages);
			}
			if (updateData.newImagePositions !== undefined) {
				updateData.newImagePositions = JSON.parse(updateData.newImagePositions);
			}
		} catch (parseError) {
			return res.status(400).json({
				success: false,
				message: "Image ordering data contained invalid JSON",
			});
		}

		try {
			if (updateData.productFilters !== undefined) {
				updateData.productFilters = JSON.parse(updateData.productFilters);
			}
		} catch {
			return res.status(400).json({
				success: false,
				message: "productFilters contained invalid JSON",
			});
		}

		const bannerImageFile = req.files?.bannerImage?.[0];
		const productImageFiles = req.files?.productImages ?? [];

		const bannerImageURL = getS3URL(bannerImageFile);
		const newProductImageURLs = productImageFiles.map(getS3URL).filter(Boolean);

		if (bannerImageURL) {
			updateData.bannerImageURL = bannerImageURL;
		}

		updateData.newProductImages = newProductImageURLs.map((imageURL, index) => ({
			imageURL,
			position: updateData.newImagePositions?.[index],
		}));
		delete updateData.newImagePositions;

		const response = await updateProductByIdService(productId, updateData);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error updating product",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Product updated successfully",
			data: response,
		});
	} catch (error) {
		console.log("Error in updateProductByIdController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error updating product in controller",
		});
	}
};

export const deleteProductByIdController = async (req, res) => {
	try {
		const productId = req.params.productId;

		if (!productId) {
			return res.status(400).json({
				success: false,
				message: "Product id is required",
			});
		}

		const response = await deleteProductByIdService(productId);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || "Error deleting product",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Product deleted successfully",
			data: response,
		});
	} catch (error) {
		console.log("Error in deleteProductByIdController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error deleting product in controller",
		});
	}
};

export const getProductBySlugController = async (req, res) => {
	try {
		const slug = req.params.slug;

		if (!slug) {
			return res.status(400).json({
				success: false,
				message: "Product slug is required",
			});
		}

		const response = await getProductbySlugService(slug);

		if (!response || response.message) {
			return res.status(404).json({
				success: false,
				message: response?.message || "Product not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: response,
		});
	} catch (error) {
		console.log("Error in getProductBySlugController:", error);
		return res.status(500).json({
			success: false,
			message: error.message || "Error fetching product by slug in controller",
		});
	}
};

// ── Storefront listing endpoints ─────────────────────────────────────────────
// All of them accept the same query string:
//   query        search text (search endpoint)
//   subCategories, brands, filterItems   comma-separated ids (facet picks)
//   minPrice, maxPrice, inStock=true
//   sortBy       relevance | newest | oldest | price-asc | price-desc |
//                name-asc | name-desc | discount-desc
//   page, limit

const DEFAULT_LISTING_LIMIT = 12;
const MAX_LISTING_LIMIT = 48;

const parseIdList = (value) =>
	(Array.isArray(value) ? value : String(value ?? "").split(","))
		.map((id) => String(id).trim())
		.filter(Boolean);

const parsePriceParam = (value) => {
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const parseListingQuery = (query) => ({
	search: String(query.query ?? query.q ?? "").slice(0, 200),
	subCategoryIds: parseIdList(query.subCategories),
	brandIds: parseIdList(query.brands),
	filterItemIds: parseIdList(query.filterItems),
	minPrice: parsePriceParam(query.minPrice),
	maxPrice: parsePriceParam(query.maxPrice),
	inStock: query.inStock === "true",
	sortBy: query.sortBy,
	page: Math.max(1, Number.parseInt(query.page, 10) || 1),
	limit: Math.min(MAX_LISTING_LIMIT, Math.max(1, Number.parseInt(query.limit, 10) || DEFAULT_LISTING_LIMIT)),
});

const sendListing = async (res, options, label) => {
	try {
		const response = await listProductsService(options);

		if (!response || response.message) {
			return res.status(500).json({
				success: false,
				message: response?.message || `Error fetching ${label}`,
			});
		}

		return res.status(200).json({ success: true, data: response });
	} catch (error) {
		console.log(`Error fetching ${label}:`, error);
		return res.status(500).json({
			success: false,
			message: error.message || `Error fetching ${label} in controller`,
		});
	}
};

export const searchProductsController = (req, res) =>
	sendListing(
		res,
		{
			...parseListingQuery(req.query),
			// The dashboard POS can sell products that aren't published yet.
			includeDrafts: req.query.includeDrafts === "true",
		},
		"search results"
	);

export const getShopProductsController = (req, res) =>
	sendListing(res, parseListingQuery(req.query), "products");

export const getNewArrivalsController = (req, res) =>
	sendListing(res, { ...parseListingQuery(req.query), scope: { isNewArrival: true } }, "new arrivals");

export const getHotDealsController = (req, res) =>
	sendListing(res, { ...parseListingQuery(req.query), scope: { isHotDeal: true } }, "hot deals");

export const getDiscountedController = (req, res) =>
	sendListing(res, { ...parseListingQuery(req.query), scope: { isDiscounted: true } }, "discounted products");

export const getProductsBySubCategoryController = async (req, res) => {
	try {
		const { subcategorySlug, brandSlug } = req.params;

		const result = await getProductsBySubCategoryService(
			subcategorySlug,
			brandSlug,
			parseListingQuery(req.query)
		);

		if (result?.message) {
			return res.status(result.notFound ? 404 : 500).json({
				success: false,
				message: result.message,
			});
		}

		return res.status(200).json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.log("Error in getProductsBySubCategoryController:", error);
		return res.status(500).json({
			success: false,
			message: "Error fetching products by sub-category",
		});
	}
};
