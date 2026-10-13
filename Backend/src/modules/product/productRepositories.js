import { prisma } from "../../utils/prisma.js";

const MIN_PRODUCT_ID = 100000;
const MAX_PRODUCT_ID = 999999;
const MAX_GENERATION_ATTEMPTS = 20;

// ProductImage has no order column; every query sorts images by createdAt, so
// display order is stored by stamping images one millisecond apart.
const imageOrderTimestamps = () => {
	const base = Date.now();
	return (position) => new Date(base + position);
};

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
				const orderedAt = imageOrderTimestamps();

				const response = await prisma.product.create({
					data: {
						...productData,
						productId: generatedProductId,
						images: {
							create: productImageURLs.map((imageURL, index) => ({
								imageURL,
								createdAt: orderedAt(index),
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
 
        // ── image handling ────────────────────────────────────────────────────
        // existingProductImages / newProductImages carry the position each
        // image should take; the order is persisted through createdAt.
        const orderedAt = imageOrderTimestamps();

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
 
            existingProductImages.forEach((img, index) => {
                operations.push(
                    prisma.productImage.update({
                        where: { productImageId: img.productImageId },
                        data: { createdAt: orderedAt(img.position ?? index) },
                    })
                );
            });
        }
 
        if (newProductImages?.length > 0) {
            operations.push(
                prisma.productImage.createMany({
                    data: newProductImages.map((img, index) => ({
                        productId,
                        imageURL: img.imageURL,
                        createdAt: orderedAt(img.position ?? (existingProductImages?.length ?? 0) + index),
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
				productFilters: {
					orderBy: { createdAt: "asc" },
					select: {
						productFilterId: true,
						filterId: true,
						filterItemId: true,
					},
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

		// Storefront page: unpublished siblings must not show up as variants.
		return {
			...response,
			groupProducts: Array.isArray(groupProducts)
				? groupProducts.filter((p) => p.status === "published")
				: [],
		};
	} catch (error) {	
		console.log("Error in getProductBySlugRepository:", error);
		return { message: "Error fetching product by slug in repository" };
	}
};

// ── Storefront listing ───────────────────────────────────────────────────────
// Every storefront product list (search, shop, new arrivals, hot deals,
// discounted, sub-category and brand pages) goes through
// listProductsRepository, so they all share one set of search, filter, sort
// and pagination rules.
//
// The database narrows the set by scope and search terms. Facet filtering,
// facet counts, sorting and pagination then run in memory over that set, and
// only the requested page is loaded with full relations. That keeps the
// rules in one readable place and is plenty fast for a shop catalogue.

const MAX_SEARCH_TOKENS = 8;
const MAX_LISTING_CANDIDATES = 5000;

// Lower-case, strip accents and turn punctuation into spaces, so
// "Logitech  G-502" and "logitech g 502" are treated the same.
export const normalizeSearchText = (text = "") =>
	String(text ?? "")
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, " ")
		.trim();

const tokenize = (text) =>
	[...new Set(normalizeSearchText(text).split(" ").filter(Boolean))].slice(0, MAX_SEARCH_TOKENS);

// A product matches when EVERY word of the query appears in at least one of
// these fields (so "logitech wireless mouse" finds a Logitech mouse whose
// title only says "Wireless", via its brand and sub-category).
const searchConditionForToken = (token) => {
	const contains = { contains: token, mode: "insensitive" };
	return {
		OR: [
			{ title: contains },
			{ subTitle: contains },
			{ slug: contains },
			{ productId: { startsWith: token } },
			{ group: { brand: { title: contains } } },
			{ group: { category: { title: contains } } },
			{ group: { subCategory: { title: contains } } },
			{ group: { tags: { some: { tag: contains } } } },
		],
	};
};

// Only what is needed to filter, count facets and rank — the full product
// is loaded for the current page only.
const LISTING_CANDIDATE_SELECT = {
	productId: true,
	title: true,
	subTitle: true,
	price: true,
	mainPrice: true,
	createdAt: true,
	group: {
		select: {
			subCategoryId: true,
			brandId: true,
			subCategory: { select: { subCategoryId: true, title: true, slug: true } },
			brand: { select: { brandId: true, title: true, slug: true } },
			category: { select: { title: true } },
			tags: { select: { tag: true } },
		},
	},
	productFilters: {
		select: {
			filterId: true,
			filterItemId: true,
			filter: { select: { title: true } },
			filterItem: { select: { title: true } },
		},
	},
	stocks: {
		where: { status: "available" },
		select: { remaining: true, reserved: true },
	},
};

const LISTING_PRODUCT_INCLUDE = {
	group: {
		select: {
			groupId: true,
			insideDhakaCharge: true,
			outsideDhakaCharge: true,
			category: { select: { categoryId: true, title: true, slug: true } },
			subCategory: { select: { subCategoryId: true, title: true, slug: true } },
			brand: { select: { brandId: true, title: true, slug: true } },
			warranty: true,
		},
	},
	coupon: { select: { code: true } },
	images: { orderBy: { createdAt: "asc" } },
	stocks: {
		where: { status: "available" },
		select: { stockId: true, remaining: true, reserved: true, status: true },
	},
};

const availableQuantity = (product) =>
	(product.stocks || []).reduce((sum, s) => sum + Math.max(0, (s.remaining || 0) - (s.reserved || 0)), 0);

const discountPercent = (product) => {
	const mainPrice = Number(product.mainPrice) || 0;
	const price = Number(product.price) || 0;
	return mainPrice > price ? (mainPrice - price) / mainPrice : 0;
};

const relevanceScore = (product, phrase, tokens) => {
	const title = normalizeSearchText(product.title);
	const subTitle = normalizeSearchText(product.subTitle);
	const brand = normalizeSearchText(product.group?.brand?.title);
	const taxonomy = normalizeSearchText(
		`${product.group?.category?.title ?? ""} ${product.group?.subCategory?.title ?? ""}`
	);
	const tags = normalizeSearchText((product.group?.tags || []).map((t) => t.tag).join(" "));
	const titleWords = title.split(" ");

	let score = 0;
	if (product.productId === phrase) score += 1000;
	if (title === phrase) score += 200;
	else if (title.startsWith(phrase)) score += 120;
	else if (title.includes(phrase)) score += 80;
	else if (`${title} ${subTitle}`.includes(phrase)) score += 40;

	for (const token of tokens) {
		if (titleWords.includes(token)) score += 15;
		else if (titleWords.some((word) => word.startsWith(token))) score += 10;
		else if (title.includes(token)) score += 6;
		if (subTitle.includes(token)) score += 4;
		if (brand.includes(token)) score += 6;
		if (taxonomy.includes(token)) score += 3;
		if (tags.includes(token)) score += 2;
	}
	return score;
};

const newestFirst = (a, b) => b.createdAt - a.createdAt;
const SORTERS = {
	newest: newestFirst,
	oldest: (a, b) => a.createdAt - b.createdAt,
	"price-asc": (a, b) => Number(a.price) - Number(b.price) || newestFirst(a, b),
	"price-desc": (a, b) => Number(b.price) - Number(a.price) || newestFirst(a, b),
	"name-asc": (a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }),
	"name-desc": (a, b) => b.title.localeCompare(a.title, undefined, { numeric: true, sensitivity: "base" }),
	"discount-desc": (a, b) => discountPercent(b) - discountPercent(a) || newestFirst(a, b),
};
export const LISTING_SORT_OPTIONS = ["relevance", ...Object.keys(SORTERS)];

const byTitle = (a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" });

export const listProductsRepository = async ({
	scope = {},            // { subCategoryId, brandId, isNewArrival, isHotDeal, isDiscounted }
	search = "",
	subCategoryIds = [],   // facet selections
	brandIds = [],
	filterItemIds = [],
	minPrice,
	maxPrice,
	inStock = false,
	sortBy,
	page = 1,
	limit = 12,
	includeDrafts = false, // dashboard (POS) search may sell unpublished products
} = {}) => {
	const tokens = tokenize(search);
	const phrase = tokens.join(" ");

	// ── 1. Database: scope + search ─────────────────────────────────────────
	const where = {
		...(includeDrafts ? {} : { status: "published" }),
		...(scope.isNewArrival ? { isNewArrival: true } : {}),
		...(scope.isHotDeal ? { isHotDeal: true } : {}),
		...(scope.isDiscounted ? { isDiscounted: true } : {}),
		...(scope.subCategoryId || scope.brandId
			? {
				group: {
					...(scope.subCategoryId ? { subCategoryId: scope.subCategoryId } : {}),
					...(scope.brandId ? { brandId: scope.brandId } : {}),
				},
			}
			: {}),
		...(tokens.length > 0 ? { AND: tokens.map(searchConditionForToken) } : {}),
	};

	const candidates = await prisma.product.findMany({
		where,
		select: LISTING_CANDIDATE_SELECT,
		take: MAX_LISTING_CANDIDATES,
	});

	// ── 2. Facet predicates ──────────────────────────────────────────────────
	// Spec filters: items of the same filter are OR'd (Red or Black), different
	// filters are AND'd (Red/Black AND Wireless). The filterId of each selected
	// item comes from the data itself, so stale ids are simply ignored.
	const filterIdByItem = new Map();
	candidates.forEach((p) => p.productFilters.forEach((pf) => filterIdByItem.set(pf.filterItemId, pf.filterId)));

	const selectedItemsByFilter = new Map();
	filterItemIds.forEach((itemId) => {
		const filterId = filterIdByItem.get(itemId);
		if (!filterId) return;
		if (!selectedItemsByFilter.has(filterId)) selectedItemsByFilter.set(filterId, new Set());
		selectedItemsByFilter.get(filterId).add(itemId);
	});

	const matchesSubCategory = (p) => subCategoryIds.length === 0 || subCategoryIds.includes(p.group?.subCategoryId);
	const matchesBrand = (p) => brandIds.length === 0 || brandIds.includes(p.group?.brandId);
	const matchesSpecs = (p) => {
		for (const items of selectedItemsByFilter.values()) {
			if (!p.productFilters.some((pf) => items.has(pf.filterItemId))) return false;
		}
		return true;
	};
	const matchesPrice = (p) => {
		const price = Number(p.price);
		if (minPrice !== undefined && price < minPrice) return false;
		if (maxPrice !== undefined && price > maxPrice) return false;
		return true;
	};
	const matchesStock = (p) => !inStock || availableQuantity(p) > 0;

	// Price range for the slider is taken before price/stock filters apply.
	const prices = candidates.map((p) => Number(p.price)).filter(Number.isFinite);
	const priceRange = prices.length
		? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
		: { min: 0, max: 0 };

	const pool = candidates.filter((p) => matchesPrice(p) && matchesStock(p));

	// ── 3. Facets ─────────────────────────────────────────────────────────────
	// Each facet's counts ignore that facet's own selection, so picking one
	// brand still shows how many products the other brands have.
	const countBy = (products, keyOf, describe) => {
		const map = new Map();
		products.forEach((p) => {
			const key = keyOf(p);
			if (!key) return;
			if (!map.has(key)) map.set(key, { ...describe(p), count: 0 });
			map.get(key).count += 1;
		});
		return [...map.values()].sort(byTitle);
	};

	const subCategoryFacet = scope.subCategoryId
		? []
		: countBy(
			pool.filter((p) => matchesBrand(p) && matchesSpecs(p)),
			(p) => p.group?.subCategoryId,
			(p) => ({ ...p.group.subCategory })
		);

	const brandFacet = scope.brandId
		? []
		: countBy(
			pool.filter((p) => matchesSubCategory(p) && matchesSpecs(p)),
			(p) => p.group?.brandId,
			(p) => ({ ...p.group.brand })
		);

	// Spec filters belong to a sub-category, so they're offered only once the
	// listing is narrowed to a single one.
	const activeSubCategoryId =
		scope.subCategoryId ||
		(subCategoryIds.length === 1 ? subCategoryIds[0] : null) ||
		(subCategoryFacet.length === 1 ? subCategoryFacet[0].subCategoryId : null);

	let filterFacet = [];
	if (activeSubCategoryId) {
		const specPool = pool.filter(
			(p) => p.group?.subCategoryId === activeSubCategoryId && matchesBrand(p)
		);
		const filters = new Map();
		specPool.forEach((p) => {
			const seen = new Set();
			p.productFilters.forEach((pf) => {
				if (!filters.has(pf.filterId)) {
					filters.set(pf.filterId, { filterId: pf.filterId, title: pf.filter?.title ?? "", items: new Map() });
				}
				const items = filters.get(pf.filterId).items;
				if (!items.has(pf.filterItemId)) {
					items.set(pf.filterItemId, { filterItemId: pf.filterItemId, title: pf.filterItem?.title ?? "", count: 0 });
				}
				// count each product once per item
				if (!seen.has(pf.filterItemId)) {
					items.get(pf.filterItemId).count += 1;
					seen.add(pf.filterItemId);
				}
			});
		});
		filterFacet = [...filters.values()]
			.map((f) => ({ filterId: f.filterId, title: f.title, items: [...f.items.values()].sort(byTitle) }))
			.sort(byTitle);
	}

	// ── 4. Filter, sort, paginate ─────────────────────────────────────────────
	const matched = pool.filter((p) => matchesSubCategory(p) && matchesBrand(p) && matchesSpecs(p));

	const effectiveSort = SORTERS[sortBy] ? sortBy : tokens.length > 0 ? "relevance" : "newest";
	if (effectiveSort === "relevance" && tokens.length > 0) {
		const scores = new Map(matched.map((p) => [p.productId, relevanceScore(p, phrase, tokens)]));
		matched.sort((a, b) => scores.get(b.productId) - scores.get(a.productId) || newestFirst(a, b));
	} else {
		matched.sort(SORTERS[effectiveSort] || newestFirst);
	}

	const totalCount = matched.length;
	const totalPages = Math.max(1, Math.ceil(totalCount / limit));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const pageIds = matched
		.slice((currentPage - 1) * limit, currentPage * limit)
		.map((p) => p.productId);

	const pageProducts = pageIds.length
		? await prisma.product.findMany({
			where: { productId: { in: pageIds } },
			include: LISTING_PRODUCT_INCLUDE,
		})
		: [];
	const productById = new Map(pageProducts.map((p) => [p.productId, p]));

	return {
		products: pageIds.map((id) => productById.get(id)).filter(Boolean),
		page: currentPage,
		limit,
		totalCount,
		totalPages,
		sortBy: effectiveSort,
		facets: {
			subCategories: subCategoryFacet,
			brands: brandFacet,
			filters: filterFacet,
			priceRange,
		},
	};
};
