import { prisma } from "../../utils/prisma.js";
import {
	addProductRepository,
	deleteProductByIdRepository,
	getAllProductsRepository,
	getProductByIdRepository,
	getProductBySlugRepository,
	listProductsRepository,
	updateProductByIdRepository,
} from "./productRepositories.js";

export const addProductService = async (productData, productImageURLs = [], productFilters = []) => {
	try {
		const response = await addProductRepository(productData, productImageURLs, productFilters);
		return response;
	} catch (error) {
		console.log("Error in addProductService:", error);
		return {
			message: "Error adding product in service",
		};
	}
};

export const deleteProductByIdService = async (productId) => {
	try {
		const response = await deleteProductByIdRepository(productId);
		return response;
	} catch (error) {
		console.log("Error in deleteProductByIdService:", error);
		return {
			message: "Error deleting product in service",
		};
	}
};

export const updateProductByIdService = async (productId, updateData) => {
	try {
		const response = await updateProductByIdRepository(productId, updateData);
		return response;
	} catch (error) {
		console.log("Error in updateProductByIdService:", error);
		return {
			message: "Error updating product in service",
		};
	}
};

export const getAllProductsService = async () => {
	try {
		const response = await getAllProductsRepository();
		return response;
	} catch (error) {
		console.log("Error in getAllProductsService:", error);
		return {
			message: "Error fetching products in service",
		};
	}
};

export const getProductByIdService = async (productId) => {
	try {
		const response = await getProductByIdRepository(productId);
		return response;
	} catch (error) {
		console.log("Error in getProductByIdService:", error);
		return {
			message: "Error fetching product by ID in service",
		};
	}
};


export const getProductbySlugService = async (slug) => {
	try {
		const response = await getProductBySlugRepository(slug);
		return response;
	} catch (error) {
		console.log("Error in getProductbySlugService:", error);
		return {
			message: "Error fetching product by slug in service",
		};
	}
}

// Shared by every storefront list endpoint. `options` comes from
// parseListingQuery in the controller; `scope` fixes what the page is about.
export const listProductsService = async (options) => {
	try {
		return await listProductsRepository(options);
	} catch (error) {
		console.log("Error in listProductsService:", error);
		return { message: "Error fetching products in service" };
	}
};

export const getProductsBySubCategoryService = async (subCategorySlug, brandSlug, options) => {
	try {
		if (!subCategorySlug) {
			return { message: "subCategorySlug is required", notFound: true };
		}

		// Routes carry slugs, but products are scoped through their Group by id.
		const subCategory = await prisma.subCategory.findUnique({
			where: { slug: subCategorySlug },
			select: { subCategoryId: true, title: true, slug: true, imageURL: true },
		});
		if (!subCategory) {
			return { message: "Sub-category not found", notFound: true };
		}

		let brand = null;
		if (brandSlug) {
			brand = await prisma.brand.findUnique({
				where: { slug: brandSlug },
				select: { brandId: true, title: true, slug: true },
			});
			if (!brand) {
				return { message: "Brand not found", notFound: true };
			}
		}

		const result = await listProductsRepository({
			...options,
			scope: { subCategoryId: subCategory.subCategoryId, brandId: brand?.brandId },
		});

		return { subCategory, brand, ...result };
	} catch (error) {
		console.log("Error in getProductsBySubCategoryService:", error);
		return { message: "Error fetching products by sub-category in service" };
	}
};
