import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/clientPart/productCard/ProductCard";

// One listing page for the whole storefront (shop, search, new arrivals, hot
// deals, discounted, sub-category, brand). Every filter, the sort and the page
// live in the URL, so refresh, back/forward and shared links keep them.
//
// URL params: q, sort, page, sub, brand, item (comma-separated ids),
//             min, max, stock=1

const LIMIT = 12;

const BASE_SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "discount-desc", label: "Biggest Discount" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "oldest", label: "Oldest" },
];

const readList = (params, key) => (params.get(key) || "").split(",").filter(Boolean);

function FacetSection({ title, children }) {
    return (
        <div className="border-b border-[#2a2a2a] pb-5">
            <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
            <div className="space-y-2.5">{children}</div>
        </div>
    );
}

function FacetOption({ label, count, checked, onChange }) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 rounded border-[#333333] bg-[#181818] accent-white cursor-pointer"
            />
            <span className={`flex-1 text-sm transition-colors ${checked ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}>
                {label}
            </span>
            {count !== undefined && <span className="text-xs text-gray-600">{count}</span>}
        </label>
    );
}

// Rendered with a key built from min/max, so the inputs reset whenever the
// URL changes (e.g. "Clear all").
function PriceFilter({ min, max, range, onApply }) {
    const [draftMin, setDraftMin] = useState(min ?? "");
    const [draftMax, setDraftMax] = useState(max ?? "");

    const apply = (e) => {
        e.preventDefault();
        let low = draftMin === "" ? "" : Math.max(0, Number(draftMin));
        let high = draftMax === "" ? "" : Math.max(0, Number(draftMax));
        if (low !== "" && high !== "" && low > high) [low, high] = [high, low];
        onApply(low, high);
    };

    const inputCls =
        "w-full min-w-0 bg-[#181818] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#555555]";

    return (
        <form onSubmit={apply} className="space-y-2.5">
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={draftMin}
                    onChange={(e) => setDraftMin(e.target.value)}
                    placeholder={range?.max ? `৳${range.min}` : "Min"}
                    aria-label="Minimum price"
                    className={inputCls}
                />
                <span className="text-gray-600">–</span>
                <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={draftMax}
                    onChange={(e) => setDraftMax(e.target.value)}
                    placeholder={range?.max ? `৳${range.max}` : "Max"}
                    aria-label="Maximum price"
                    className={inputCls}
                />
            </div>
            <button
                type="submit"
                className="w-full py-2 text-sm font-medium bg-[#1a1a1a] hover:bg-[#242424] border border-[#333333] rounded-lg text-white transition-colors"
            >
                Apply price
            </button>
        </form>
    );
}

function getPaginationRange(page, totalPages) {
    const range = [];
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    range.push(1);
    if (left > 2) range.push("…");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("…");
    if (totalPages > 1) range.push(totalPages);
    return range;
}

/**
 * @param title        heading (string) — or derive it from the response via getTitle
 * @param getTitle     (data) => string, optional
 * @param subtitle     optional text under the heading
 * @param queryKey     unique key for this listing (array)
 * @param fetchListing (options) => Promise<{ data }>, options as in productListingApi
 * @param defaultSort  sort used when none is chosen
 * @param isSearch     shows the "results for" heading and the relevance sort
 */
function ProductListingPage({ title, getTitle, subtitle, queryKey, fetchListing, defaultSort = "newest", isSearch = false }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const query = searchParams.get("q") || "";
    const sortBy = searchParams.get("sort") || (isSearch ? "relevance" : defaultSort);
    const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);
    const subCategories = readList(searchParams, "sub");
    const brands = readList(searchParams, "brand");
    const filterItems = readList(searchParams, "item");
    const minPrice = searchParams.get("min") ?? undefined;
    const maxPrice = searchParams.get("max") ?? undefined;
    const inStock = searchParams.get("stock") === "1";

    const options = { query, sortBy, page, limit: LIMIT, subCategories, brands, filterItems, minPrice, maxPrice, inStock };

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: [...queryKey, options],
        queryFn: () => fetchListing(options),
        enabled: !isSearch || !!query.trim(),
        placeholderData: keepPreviousData,
        staleTime: 60 * 1000,
    });

    const result = data?.data;
    const products = result?.products || [];
    const totalCount = result?.totalCount ?? 0;
    const totalPages = result?.totalPages || 1;
    // The backend clamps out-of-range pages (e.g. after filtering).
    const currentPage = result?.page ?? page;
    const facets = result?.facets || {};
    const heading = getTitle?.(result) || title;

    const sortOptions = isSearch
        ? [{ value: "relevance", label: "Best Match" }, ...BASE_SORT_OPTIONS]
        : BASE_SORT_OPTIONS;

    // ── URL helpers ──────────────────────────────────────────────────────────
    // Any filter change resets to page 1.
    const updateParams = (changes, { resetPage = true } = {}) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([key, value]) => {
            const empty = value === undefined || value === "" || value === null || (Array.isArray(value) && value.length === 0);
            if (empty) next.delete(key);
            else next.set(key, Array.isArray(value) ? value.join(",") : String(value));
        });
        if (resetPage) next.delete("page");
        setSearchParams(next);
    };

    const toggleInList = (key, list, id) =>
        updateParams({ [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] });

    const goToPage = (nextPage) => {
        updateParams({ page: nextPage > 1 ? nextPage : undefined }, { resetPage: false });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearFilters = () =>
        updateParams({ sub: [], brand: [], item: [], min: undefined, max: undefined, stock: undefined });

    // ── Active filter chips ──────────────────────────────────────────────────
    const activeChips = useMemo(() => {
        const chips = [];
        const subTitle = new Map((facets.subCategories || []).map((s) => [s.subCategoryId, s.title]));
        const brandTitle = new Map((facets.brands || []).map((b) => [b.brandId, b.title]));
        const itemTitle = new Map(
            (facets.filters || []).flatMap((f) => f.items.map((i) => [i.filterItemId, `${f.title}: ${i.title}`]))
        );
        subCategories.forEach((id) => subTitle.has(id) && chips.push({ key: `sub-${id}`, label: subTitle.get(id), remove: () => toggleInList("sub", subCategories, id) }));
        brands.forEach((id) => brandTitle.has(id) && chips.push({ key: `brand-${id}`, label: brandTitle.get(id), remove: () => toggleInList("brand", brands, id) }));
        filterItems.forEach((id) => itemTitle.has(id) && chips.push({ key: `item-${id}`, label: itemTitle.get(id), remove: () => toggleInList("item", filterItems, id) }));
        if (minPrice || maxPrice) {
            chips.push({
                key: "price",
                label: `৳${minPrice || 0} – ${maxPrice ? `৳${maxPrice}` : "any"}`,
                remove: () => updateParams({ min: undefined, max: undefined }),
            });
        }
        if (inStock) chips.push({ key: "stock", label: "In stock", remove: () => updateParams({ stock: undefined }) });
        return chips;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facets, searchParams]);

    // No sidebar on the empty search page; everywhere else it's always there.
    const hasFacets = !isSearch || !!query;

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 break-words">
                        {isSearch ? (query ? <>Results for “{query}”</> : "Search") : heading}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isSearch && !query
                            ? "Type in the search bar to find products."
                            : isLoading
                                ? "Loading…"
                                : `${totalCount} product${totalCount !== 1 ? "s" : ""} found`}
                        {subtitle && !isSearch ? ` · ${subtitle}` : ""}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar — filters */}
                    {hasFacets && (
                        <aside className="lg:w-64 shrink-0">
                            <button
                                onClick={() => setMobileFiltersOpen((v) => !v)}
                                className="lg:hidden w-full flex items-center justify-between gap-2 bg-[#181818] border border-[#2a2a2a] rounded-xl px-4 py-3 mb-4"
                            >
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                    {activeChips.length > 0 && (
                                        <span className="text-xs bg-white text-black rounded-full px-2 py-0.5">
                                            {activeChips.length}
                                        </span>
                                    )}
                                </span>
                                <ChevronRight className={`w-4 h-4 transition-transform ${mobileFiltersOpen ? "rotate-90" : ""}`} />
                            </button>

                            <div className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block space-y-5`}>
                                {(facets.subCategories?.length || 0) > 0 && (
                                    <FacetSection title="Category">
                                        {facets.subCategories.map((s) => (
                                            <FacetOption
                                                key={s.subCategoryId}
                                                label={s.title}
                                                count={s.count}
                                                checked={subCategories.includes(s.subCategoryId)}
                                                onChange={() => toggleInList("sub", subCategories, s.subCategoryId)}
                                            />
                                        ))}
                                    </FacetSection>
                                )}

                                {(facets.brands?.length || 0) > 0 && (
                                    <FacetSection title="Brand">
                                        {facets.brands.map((b) => (
                                            <FacetOption
                                                key={b.brandId}
                                                label={b.title}
                                                count={b.count}
                                                checked={brands.includes(b.brandId)}
                                                onChange={() => toggleInList("brand", brands, b.brandId)}
                                            />
                                        ))}
                                    </FacetSection>
                                )}

                                {(facets.filters || []).map((f) => (
                                    <FacetSection key={f.filterId} title={f.title}>
                                        {f.items.map((item) => (
                                            <FacetOption
                                                key={item.filterItemId}
                                                label={item.title}
                                                count={item.count}
                                                checked={filterItems.includes(item.filterItemId)}
                                                onChange={() => toggleInList("item", filterItems, item.filterItemId)}
                                            />
                                        ))}
                                    </FacetSection>
                                ))}

                                <FacetSection title="Price (৳)">
                                    <PriceFilter
                                        key={`${minPrice ?? ""}-${maxPrice ?? ""}`}
                                        min={minPrice}
                                        max={maxPrice}
                                        range={facets.priceRange}
                                        onApply={(low, high) => updateParams({ min: low, max: high })}
                                    />
                                </FacetSection>

                                <FacetSection title="Availability">
                                    <FacetOption
                                        label="In stock only"
                                        checked={inStock}
                                        onChange={() => updateParams({ stock: inStock ? undefined : "1" })}
                                    />
                                </FacetSection>
                            </div>
                        </aside>
                    )}

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar: active filters + sort */}
                        <div className="flex flex-col-reverse sm:flex-row sm:items-start justify-between gap-3 mb-6">
                            <div className="flex flex-wrap items-center gap-2">
                                {activeChips.map((chip) => (
                                    <button
                                        key={chip.key}
                                        onClick={chip.remove}
                                        className="flex items-center gap-1.5 pl-3 pr-2 py-1 text-xs bg-[#181818] border border-[#333333] rounded-full text-gray-200 hover:border-[#555555] transition-colors"
                                    >
                                        {chip.label}
                                        <X className="w-3 h-3 text-gray-500" />
                                    </button>
                                ))}
                                {activeChips.length > 1 && (
                                    <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white underline-offset-2 hover:underline">
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <select
                                value={sortBy}
                                onChange={(e) => updateParams({ sort: e.target.value })}
                                aria-label="Sort products"
                                className="shrink-0 bg-[#181818] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#555555] transition-colors"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Loading */}
                        {isLoading && (
                            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 sm:gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-full h-64 sm:h-[380px] bg-[#181818] border-2 border-[#2a2a2a] rounded-none rounded-tr-2xl rounded-bl-2xl animate-pulse"
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
                        {!isLoading && !isError && (!isSearch || query) && products.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-gray-300 font-medium">No products found</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {activeChips.length > 0
                                        ? "Try removing a filter."
                                        : isSearch
                                            ? "Check the spelling or try fewer words."
                                            : "Check back soon."}
                                </p>
                                {activeChips.length > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-4 px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Grid */}
                        {!isLoading && !isError && products.length > 0 && (
                            <div
                                className={`grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 sm:gap-6 transition-opacity ${
                                    isFetching ? "opacity-60" : ""
                                }`}
                            >
                                {products.map((product) => (
                                    <ProductCard key={product.productId} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!isLoading && totalPages > 1 && (
                            <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    aria-label="Previous page"
                                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#444444] transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {getPaginationRange(currentPage, totalPages).map((p, i) =>
                                    p === "…" ? (
                                        <span key={`gap-${i}`} className="px-1 text-gray-600">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => goToPage(p)}
                                            aria-current={p === currentPage ? "page" : undefined}
                                            className={`min-w-9 h-9 px-2 rounded-lg text-sm border transition-colors ${
                                                p === currentPage
                                                    ? "bg-white text-black border-white"
                                                    : "bg-[#181818] border-[#2a2a2a] text-gray-300 hover:border-[#444444]"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                    aria-label="Next page"
                                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#181818] border border-[#2a2a2a] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#444444] transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductListingPage;
