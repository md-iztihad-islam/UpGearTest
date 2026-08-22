import { prisma } from "../../utils/prisma.js";
import { getWarrantyByIdController } from "../warranty/warrantyControllers.js";

const MIN_PRODUCT_ID = 100000;
const MAX_PRODUCT_ID = 999999;
const MAX_GENERATION_ATTEMPTS = 20;

const generateSixDigitProductId = () =>
	String(Math.floor(Math.random() * (MAX_PRODUCT_ID - MIN_PRODUCT_ID + 1)) + MIN_PRODUCT_ID);

const generateUniqueSixDigitProductId = async () => {
	for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
		const candidateId = generateSixDigitProductId();
		const existingProduct = await prisma.product.findUnique({
			where: { productId: candidateId },
			select: { productId: true },
		});

		if (!existingProduct) {
			return candidateId;
		}
	}

	throw new Error("Unable to generate a unique 6-digit productId");
};

export const addProductRepository = async (productData, productImageURLs = [], productFilters = []) => {
	try {
		for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
			try {
				const generatedProductId = await generateUniqueSixDigitProductId();

				const response = await prisma.product.create({
					data: {
						...productData,
						productId: generatedProductId,
						images: {
							create: productImageURLs.map((imageURL, index) => ({
								imageURL,
							})),
						},
						...(productFilters.length > 0
							? {
								productFilters: {
									create: productFilters.map((pf, index) => ({
										filterId: pf.filterId,
										filterItemId: pf.filterItemId,
									})),
								},
							}
							: {}),
					},
					include: {
						group: true,
						images: {
							orderBy: { createdAt: "asc" },
						},
						productFilters: {
							include: {
								filter: { select: { title: true } },
								filterItem: { select: { title: true } },
							},
						},
					},
				});

				return response;
			} catch (error) {
				const isDuplicateProductId =
					error?.code === "P2002" &&
					Array.isArray(error?.meta?.target) &&
					error.meta.target.includes("ProductId");

				if (!isDuplicateProductId) {
					throw error;
				}
			}
		}

		throw new Error("Unable to create product with a unique 6-digit productId");

	} catch (error) {
		console.log("Error in addProductRepository:", error);
		return {
			message: "Error adding product in repository",
		};
	}
};

export const deleteProductByIdRepository = async (productId) => {
	try {
		const response = await prisma.$transaction(async (tx) => {
			await tx.productImage.deleteMany({
				where: {
					productId,
				},
			});

			return tx.product.delete({
				where: {
					productId,
				},
			});
		});

		return response;
	} catch (error) {
		console.log("Error in deleteProductByIdRepository:", error);
		return {
			message: "Error deleting product in repository",
		};
	}
};

export const updateProductByIdRepository = async (productId, updateData) => {
    try {
        const {
            existingProductImages,
            newProductImages,
            productFilters,       // <-- new
            ...scalarData
        } = updateData;
 
        const operations = [
            prisma.product.update({
                where: { productId },
                data: scalarData,
            }),
        ];
 
        // ── image handling (unchanged) ────────────────────────────────────────
        if (existingProductImages !== undefined) {
            const keptIds = existingProductImages.map((img) => img.productImageId);
 
            operations.push(
                prisma.productImage.deleteMany({
                    where: {
                        productId,
                        productImageId: { notIn: keptIds },
                    },
                })
            );
 
            for (const img of existingProductImages) {
                operations.push(
                    prisma.productImage.update({
                        where: { productImageId: img.productImageId },
                    })
                );
            }
        }
 
        if (newProductImages?.length > 0) {
            operations.push(
                prisma.productImage.createMany({
                    data: newProductImages.map((img) => ({
                        productId,
                        imageURL: img.imageURL,
                    })),
                })
            );
        }
 
        // ── filter handling (new) ─────────────────────────────────────────────
        if (productFilters !== undefined) {
            // Delete all existing filters for this product, then re-insert.
            // Simple & safe — avoids per-row upsert complexity.
            operations.push(
                prisma.productFilter.deleteMany({ where: { productId } })
            );
 
            if (productFilters.length > 0) {
                operations.push(
                    prisma.productFilter.createMany({
                        data: productFilters.map((pf) => ({
                            productId,
                            filterId: pf.filterId,
                            filterItemId: pf.filterItemId,
                        })),
                    })
                );
            }
        }
 
        const results = await prisma.$transaction(operations);
 
        return results[0]; // updated Product
    } catch (error) {
        console.log("Error in updateProductByIdRepository:", error);
        return {
            message: "Error updating product in repository",
        };
    }
};

export const getAllProductsRepository = async () => {
	try {
		const response = await prisma.product.findMany({
			include: {
				group: {
					select: {
						groupId: true,
						description: true,
						insideDhakaCharge: true,
						outsideDhakaCharge: true,
						category: true,
						subCategory: true,
						brand: true,
						warranty: true,
						descriptionImages: {
							orderBy: { createdAt: "asc" },
						},
						keyFeatures: {
							orderBy: { createdAt: "asc" },
						},
						tags: {
							orderBy: { createdAt: "asc" },
						},
						productSpecifications: {
							orderBy: { createdAt: "asc" },
							select: {
								productSpecificationId: true,
								value: true,
								specification: {
									select: {
										title: true,
									},
								},
							},
						},
					},
				},
				coupon: {
					select: { code: true },
				},
				images: {
					orderBy: { createdAt: "asc" },
				},
				stocks: {
					where: { status: "available" },
					select: {
						stockId: true,
						remaining: true,
						status: true,
					},
				}
			},
		});

		return response;
	} catch (error) {
		console.log("Error in getAllProductsRepository:", error);
		return { message: "Error fetching products in repository" };
	}
};

export const getProductByIdRepository = async (productId) => {
	try {
		const response = await prisma.product.findUnique({
			where: { productId },
			include: {
				group: {
					select: {
						groupId: true,
						description: true,
						insideDhakaCharge: true,
						outsideDhakaCharge: true,
						category: true,
						subCategory: true,
						brand: true,
						warranty: true,
						descriptionImages: {
							orderBy: { createdAt: "asc" },
						},
						keyFeatures: {
							orderBy: { createdAt: "asc" },
						},
						tags: {
							orderBy: { createdAt: "asc" },
						},
						productSpecifications: {
							orderBy: { createdAt: "asc" },
							select: {
								productSpecificationId: true,
								value: true,
								specification: {
									select: {
										title: true,
									},
								},
							},
						},
					},
				},
				coupon: {
					select: { code: true },
				},
				images: {
					orderBy: { createdAt: "asc" },
				},
				stocks: {
					where: { status: "available" },
					select: {
						stockId: true,
						remaining: true,
						status: true,
					},
				}
			},
		});
			
		const groupProducts = await getProductByGroupIdRepository(response.groupId);

		return { ...response, groupProducts };
	} catch (error) {
		console.log("Error in getProductByIdRepository:", error);
		return { message: "Error fetching product by ID in repository" };
	}
};

export const getProductByGroupIdRepository = async (groupId) => {
	try {
		const response = await prisma.product.findMany({
			where: { groupId },
			include: {
				group: {
					select: {
						groupId: true,
						description: true,
						insideDhakaCharge: true,
						outsideDhakaCharge: true,
						category: true,
						subCategory: true,
						brand: true,
						warranty: true,
						descriptionImages: {
							orderBy: { createdAt: "asc" },
						},
						keyFeatures: {
							orderBy: { createdAt: "asc" },
						},
						tags: {
							orderBy: { createdAt: "asc" },
						},
						productSpecifications: {
							orderBy: { createdAt: "asc" },
							select: {
								productSpecificationId: true,
								value: true,
								specification: {
									select: {
										title: true,
									},
								},
							},
						},
					},
				},
				coupon: {
					select: { code: true },
				},
				images: {
					orderBy: { createdAt: "asc" },
				},
				stocks: {
					where: { status: "available" },
					select: {
						stockId: true,
						remaining: true,
						status: true,
					},
				}
			},
		});

		return response;
	} catch (error) {
		console.log("Error in getProductByGroupIdRepository:", error);
		return { message: "Error fetching products by group ID in repository" };
	}
};

export const getProductBySlugRepository = async (slug) => {
	try {
		const response = await prisma.product.findUnique({
			where: { slug },
			include: {
				group: {
					select: {
						groupId: true,
						description: true,
						insideDhakaCharge: true,
						outsideDhakaCharge: true,
						category: true,
						subCategory: true,
						brand: true,
						warranty: true,
						descriptionImages: {
							orderBy: { createdAt: "asc" },
						},
						keyFeatures: {
							orderBy: { createdAt: "asc" },
						},
						tags: {
							orderBy: { createdAt: "asc" },
						},
						productSpecifications: {
							orderBy: { createdAt: "asc" },
							select: {
								productSpecificationId: true,
								value: true,
								specification: {
									select: {
										title: true,
									},
								},
							},
						},
					},
				},
				coupon: {
					select: { code: true },
				},
				images: {
					orderBy: { createdAt: "asc" },
				},
				stocks: {
					where: { status: "available" },
					select: {
						stockId: true,
						remaining: true,
						reserved: true,
						status: true,
					},
				}
			},
		});

		const groupProducts = await getProductByGroupIdRepository(response.groupId);

		return { ...response, groupProducts };
	} catch (error) {	
		console.log("Error in getProductBySlugRepository:", error);
		return { message: "Error fetching product by slug in repository" };
	}
};

// searchProductsRepository.js
export const searchProductsRepository = async (searchTerm, page = 1, limit = 10, sortBy) => {
	const offset = (page - 1) * limit;

	const sortOptions = {
		"price-asc": { price: "asc" },
		"price-desc": { price: "desc" },
		"name-asc": { title: "asc" },   // fixed: title, not name
		"name-desc": { title: "desc" }, // fixed
		newest: { createdAt: "desc" },
		oldest: { createdAt: "asc" },
	};

	const products = await prisma.product.findMany({
		where: {
			OR: [
				{ title: { contains: searchTerm, mode: "insensitive" } },    // fixed: title, not name
				{ subTitle: { contains: searchTerm, mode: "insensitive" } }, // fixed: subTitle, not description
			],
		},
		orderBy: sortOptions[sortBy] || { createdAt: "desc" },
		skip: offset,
		take: limit,
		include: {
			group: { /* unchanged */ 
				select: {
					groupId: true, description: true, insideDhakaCharge: true, outsideDhakaCharge: true,
					category: true, subCategory: true, brand: true, warranty: true,
					descriptionImages: { orderBy: { createdAt: "asc" } },
					keyFeatures: { orderBy: { createdAt: "asc" } },
					tags: { orderBy: { createdAt: "asc" } },
					productSpecifications: {
						orderBy: { createdAt: "asc" },
						select: { productSpecificationId: true, value: true, specification: { select: { title: true } } },
					},
				},
			},
			coupon: { select: { code: true } },
			images: { orderBy: { createdAt: "asc" } },
			stocks: {
				where: { status: "available" },
				select: { stockId: true, remaining: true, reserved: true, status: true },
			},
		},
	});

	return { products, page, limit };
};

export const getNewArraivalsRepository = async (page=1, limit=10, sortBy) => {
	try {
		const offset = (page - 1) * limit;
		const sortOptions = {
			"price-asc": { price: "asc" },
			"price-desc": { price: "desc" },
		}

		const products = await prisma.product.findMany({
			where: {
				isNewArrival: true,
			},
			orderBy: sortOptions[sortBy] || { createdAt: "desc" },
			skip: offset,
			take: limit,
			include: {
				group: {
					select: {
						groupId: true,
						description: true,
						insideDhakaCharge: true,
						outsideDhakaCharge: true,
						category: true,
						subCategory: true,
						brand: true,
						warranty: true,
						descriptionImages: {
							orderBy: { createdAt: "asc"}, 
						},
						keyFeatures: {
							orderBy: { createdAt: "asc" },
						},
						tags: {
							orderBy: { createdAt: "asc" },
						},
						productSpecifications: {
							orderBy: { createdAt: "asc" },
							select: {
								productSpecificationId: true,
								value: true,
								specification: {
									select: {
										title: true,
									},
								},
							},
						},
					},
				},
				coupon: {
					select: { code: true },
				},
				images: {
					orderBy: { createdAt: "asc"},
				},
				stocks: {
					where: { status: "available" },
					select: {
						stockId: true,
						remaining: true,
						status: true,
					},
				}
			},
		});

		return { products, page, limit };
	} catch (error) {
		console.log("Error in getNewArraivalsRepository:", error);
		return { message: "Error fetching new arrivals in repository" };
	}
}

export const getHotDealsRepository = async (page=1, limit=10, sortBy) => {
	try {
		const offset = (page - 1) * limit;
		const sortOptions = {
			"price-asc": { price: "asc" },
			"price-desc": { price: "desc" },
		}

		const products = await prisma.product.findMany({
			where: {
				isHotDeal: true,
			},
			orderBy: sortOptions[sortBy] || { createdAt: "desc" },
			skip: offset,
			take: limit,
			include: {
				group: {
					select: {
						groupId: true,
						description: true,
						insideDhakaCharge: true,
						outsideDhakaCharge: true,
						category: true,
						subCategory: true,
						brand: true,
						warranty: true,
						descriptionImages: {
							orderBy: { createdAt: "asc" },
						},
						keyFeatures: {
							orderBy: { createdAt: "asc" },
						},
						tags: {
							orderBy: { createdAt: "asc" },
						},
						productSpecifications: {
							orderBy: { createdAt: "asc" },
							select: {
								productSpecificationId: true,
								value: true,
								specification: {
									select: {
										title: true,
									},
								},
							},
						},
					},
				},
				coupon: {
					select: { code: true },
				},
				images: {
					orderBy: { createdAt: "asc" },
				},
				stocks: {
					where: { status: "available" },
					select: {
						stockId: true,
						remaining: true,
						status: true,
					},
				}
			},
		});

		return { products, page, limit };
	} catch (error) {
		console.log("Error in getHotDealsRepository:", error);
		return { message: "Error fetching hot deals in repository" };
	}
}

export const getDiscountedRepository = async (page=1, limit=10, sortBy) => {
	try {
		const offset = (page - 1) * limit;
		const sortOptions = {
			"price-asc": { price: "asc" },
			"price-desc": { price: "desc" },
		}

		const products = await prisma.product.findMany({
			where: {
				isDiscounted: true,
			},
			orderBy: sortOptions[sortBy] || { createdAt: "desc" },
			skip: offset,
			take: limit,
			include: {
				group: {
					select: {
						groupId: true,
						description: true,
						insideDhakaCharge: true,
						outsideDhakaCharge: true,
						category: true,
						subCategory: true,
						brand: true,
						warranty: true,
						descriptionImages: {
							orderBy: { createdAt: "asc" },
						},
						keyFeatures: {
							orderBy: { createdAt: "asc" },
						},
						tags: {
							orderBy: { createdAt: "asc" },
						},
						productSpecifications: {
							orderBy: { createdAt: "asc" },
							select: {
								productSpecificationId: true,
								value: true,
								specification: {
									select: {
										title: true,
									},
								},
							},
						},
					},
				},
				coupon: {
					select: { code: true },
				},
				images: {
					orderBy: { createdAt: "asc" },
				},
				stocks: {
					where: { status: "available" },
					select: {
						stockId: true,
						remaining: true,
						status: true,
					},
				}
			},
		});

		return { products, page, limit };
	} catch (error) {
		console.log("Error in getDiscountedRepository:", error);
		return { message: "Error fetching discounteds in repository" };
	}
}