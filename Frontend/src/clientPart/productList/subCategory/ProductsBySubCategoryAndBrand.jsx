import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from "lucide-react";
import getProductsBySubCategoryAndBrandApi from "@/services/clientPart/products/getProductsBySubCategoryAndBrandApi";
import ProductCard from "@/components/clientPart/productCard/ProductCard";

const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
];

const LIMIT = 12;

function ProductsBySubCategoryAndBrand() {
    const { subcategorySlug, brandSlug } = useParams();

    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState("newest");
    const [selectedFilters, setSelectedFilters] = useState({}); // { [filterId]: Set(filterItemId) }
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const filterArray = useMemo(() => {
        const arr = [];
        Object.entries(selectedFilters).forEach(([filterId, itemSet]) => {
            itemSet.forEach((filterItemId) => arr.push({ filterId, filterItemId }));
        });
        return arr;
    }, [selectedFilters]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["productsBySubCategoryAndBrand", subcategorySlug, brandSlug, page, sortBy, filterArray],
        queryFn: () =>
            getProductsBySubCategoryAndBrandApi(subcategorySlug, brandSlug, {
                page,
                limit: LIMIT,
                sortBy,
                filter: filterArray,
            }),
        enabled: !!subcategorySlug && !!brandSlug,
        keepPreviousData: true,
    });

    const result = data?.data;
    const products = result?.products || [];
    const totalPages = result?.totalPages || 1;
    const subCategoryTitle = result?.subCategory?.title || "Products";
    const brandTitle = result?.brand?.title || result?.brand?.name || "";

    // Repository returns `filters` as a flat array of filterItem rows, each
    // carrying its parent filter as `.filter`. Group them by filterId here
    // so the sidebar can render one heading per filter with its items nested.
    const filterGroups = useMemo(() => {
        const raw = result?.filters || [];
        const map = {};
        raw.forEach((item) => {
            const filterId = item.filter?.filterId;
            if (!filterId) return;
            if (!map[filterId]) {
                map[filterId] = {
                    filterId,
                    title: item.filter.title,
                    filterItems: [],
                };
            }
            map[filterId].filterItems.push({
                filterItemId: item.filterItemId,
                title: item.title,
            });
        });
        return Object.values(map);
    }, [result]);

    const toggleFilterItem = (filterId, filterItemId) => {
        setPage(1);
        setSelectedFilters((prev) => {
            const next = { ...prev };
            const current = new Set(next[filterId] || []);
            if (current.has(filterItemId)) {
                current.delete(filterItemId);
            } else {
                current.add(filterItemId);
            }
            if (current.size === 0) {
                delete next[filterId];
            } else {
                next[filterId] = current;
            }
            return next;
        });
    };

    const clearFilters = () => {
        setPage(1);
        setSelectedFilters({});
    };

    const activeFilterCount = filterArray.length;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                        {brandTitle ? `${brandTitle} ${subCategoryTitle}` : subCategoryTitle}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {result?.totalCount ?? products.length} products found
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar — filters */}
                    <aside className="lg:w-64 shrink-0">
                        {/* Mobile toggle */}
                        <button
                            onClick={() => setMobileFiltersOpen((v) => !v)}
                            className="lg:hidden w-full flex items-center justify-between gap-2 bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 mb-4"
                        >
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </span>
                        </button>

                        <div className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block space-y-6`}>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Clear all filters
                                </button>
                            )}

                            {filterGroups.length === 0 && (
                                <p className="text-sm text-gray-600">No filters available for this category.</p>
                            )}

                            {filterGroups.map((filterGroup) => (
                                <div key={filterGroup.filterId} className="border-b border-[#2a2a2a] pb-5">
                                    <h3 className="text-sm font-semibold text-white mb-3">
                                        {filterGroup.title}
                                    </h3>
                                    <div className="space-y-2.5">
                                        {filterGroup.filterItems.map((item) => {
                                            const checked = selectedFilters[filterGroup.filterId]?.has(item.filterItemId) || false;
                                            return (
                                                <label
                                                    key={item.filterItemId}
                                                    className="flex items-center gap-2.5 cursor-pointer group"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleFilterItem(filterGroup.filterId, item.filterItemId)}
                                                        className="w-4 h-4 rounded border-[#333333] bg-[#181818] accent-blue-600 cursor-pointer"
                                                    />
                                                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                                                        {item.title}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">

                        {/* Sort bar */}
                        <div className="flex items-center justify-end mb-6">
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setPage(1);
                                    setSortBy(e.target.value);
                                }}
                                className="bg-[#181818] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Loading */}
                        {isLoading && (
                            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 sm:gap-6">
                                {Array.from({ length: LIMIT }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="max-w-[160px] sm:max-w-[300px] max-h-[300px] sm:max-h-[400px] w-full h-64 sm:h-[380px] bg-[#181818] border-2 border-[#2a2a2a] rounded-none rounded-tr-2xl rounded-bl-2xl animate-pulse"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Error */}
                        {isError && (
                            <div className="text-center py-16">
                                <p className="text-gray-400">Something went wrong loading these products.</p>
                            </div>
                        )}

                        {/* Empty */}
                        {!isLoading && !isError && products.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-gray-400">No products match your filters.</p>
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Grid */}
                        {!isLoading && !isError && products.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 sm:gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.productId} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!isLoading && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#444444] transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <span className="text-sm text-gray-400 px-3">
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#444444] transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductsBySubCategoryAndBrand;