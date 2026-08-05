import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeft, Loader2, Plus, X, ArrowUp, ArrowDown,
    Save, ImagePlus, SlidersHorizontal, ChevronDown,
} from "lucide-react";

import getProductByIdApi from "@/services/dashboard/product/getProductByIdApi";
import getAllGroupApi from "@/services/dashboard/group/getAllGroupApi";
import getActiveCouponApi from "@/services/dashboard/coupon/getActiveCouponApi";
import updateProductByIdApi from "@/services/dashboard/product/updateProductApi";
import getFiltersBySubCategoryApi from "@/services/dashboard/category/getFiltersBySubCategoryApi";
import getFilterItemsBySubCategoryApi from "@/services/dashboard/category/getFilterItemsBySubCategoryApi";

const MAX_NEW_PRODUCT_IMAGES = 10;

// ─── small helpers ────────────────────────────────────────────────────────────

function SectionCard({ title, children, className = "" }) {
    return (
        <section className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8 ${className}`}>
            <h2 className="text-base font-semibold text-gray-100 mb-6">{title}</h2>
            {children}
        </section>
    );
}

function FieldLabel({ children }) {
    return <label className="block text-sm text-gray-400 mb-2">{children}</label>;
}

const inputCls =
    "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition text-sm";

// ─── ProductFilters section ───────────────────────────────────────────────────

/**
 * productFilters shape: Array<{
 *   productFilterId?: string   // present for existing, absent for new
 *   filterId: string
 *   filterItemId: string
 *   orderIndex: number
 * }>
 */
function ProductFiltersSection({ subCategoryId, productFilters, onChange }) {
    const { data: filtersRes } = useQuery({
        queryKey: ["filters", subCategoryId],
        queryFn: () => getFiltersBySubCategoryApi(subCategoryId),
        enabled: !!subCategoryId,
    });
    const { data: filterItemsRes } = useQuery({
        queryKey: ["filter-items", subCategoryId],
        queryFn: () => getFilterItemsBySubCategoryApi(subCategoryId),
        enabled: !!subCategoryId,
    });

    const filters = filtersRes?.data ?? [];
    const filterItems = filterItemsRes?.data ?? [];

    const getItemsForFilter = (filterId) =>
        filterItems.filter((fi) => fi.filterId === filterId);

    const handleAdd = () => {
        if (filters.length === 0) return;
        const firstFilter = filters[0];
        const firstItem = getItemsForFilter(firstFilter.filterId)[0];
        onChange([
            ...productFilters,
            {
                filterId: firstFilter.filterId,
                filterItemId: firstItem?.filterItemId ?? "",
                orderIndex: productFilters.length,
            },
        ]);
    };

    const handleRemove = (index) => {
        const next = productFilters.filter((_, i) => i !== index)
            .map((pf, i) => ({ ...pf, orderIndex: i }));
        onChange(next);
    };

    const handleChange = (index, field, value) => {
        const next = productFilters.map((pf, i) => {
            if (i !== index) return pf;
            const updated = { ...pf, [field]: value };
            // reset filterItemId when filter changes
            if (field === "filterId") {
                const firstItem = getItemsForFilter(value)[0];
                updated.filterItemId = firstItem?.filterItemId ?? "";
            }
            return updated;
        });
        onChange(next);
    };

    const handleMove = (index, direction) => {
        const next = [...productFilters];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next.map((pf, i) => ({ ...pf, orderIndex: i })));
    };

    if (!subCategoryId) {
        return (
            <p className="text-sm text-gray-500 italic">
                Select a group first to manage filters.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {productFilters.map((pf, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-700/50 border border-gray-600/60 rounded-xl"
                >
                    {/* Order controls */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => handleMove(index, -1)}
                            disabled={index === 0}
                            className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition disabled:opacity-30"
                        >
                            <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleMove(index, 1)}
                            disabled={index === productFilters.length - 1}
                            className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition disabled:opacity-30"
                        >
                            <ArrowDown className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Filter select */}
                    <div className="flex-1 min-w-0">
                        <div className="relative">
                            <select
                                value={pf.filterId}
                                onChange={(e) => handleChange(index, "filterId", e.target.value)}
                                className="w-full px-3 py-2 pr-8 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition"
                            >
                                {filters.map((f) => (
                                    <option key={f.filterId} value={f.filterId}>{f.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Filter item select */}
                    <div className="flex-1 min-w-0">
                        <div className="relative">
                            <select
                                value={pf.filterItemId}
                                onChange={(e) => handleChange(index, "filterItemId", e.target.value)}
                                className="w-full px-3 py-2 pr-8 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition"
                            >
                                {getItemsForFilter(pf.filterId).map((fi) => (
                                    <option key={fi.filterItemId} value={fi.filterItemId}>{fi.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Remove */}
                    <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="flex-shrink-0 p-2 bg-red-600/20 hover:bg-red-600 border border-red-600/40 hover:border-red-600 text-red-400 hover:text-white rounded-lg transition"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={handleAdd}
                disabled={filters.length === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-xl text-sm text-gray-300 hover:text-white transition disabled:opacity-40"
            >
                <Plus className="w-4 h-4" />
                Add Filter
            </button>

            {filters.length === 0 && (
                <p className="text-xs text-gray-500 italic">No filters found for this subcategory.</p>
            )}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

function EditProduct() {
    const navigate = useNavigate();
    const { productId } = useParams();

    const [formData, setFormData] = useState({
        groupId: "",
        title: "",
        subTitle: "",
        mainPrice: "",
        discount: "",
        price: "",
        status: "draft",
        slug: "",
        metaTitle: "",
        metaDescription: "",
        couponId: "",
        isNewArrival: false,
        isHotDeal: false,
        isDiscounted: false,
    });
    const [bannerImage, setBannerImage] = useState({ existingUrl: null, file: null, previewUrl: null });
    const [productImages, setProductImages] = useState([]);
    const [productFilters, setProductFilters] = useState([]);
    const [hasHydrated, setHasHydrated] = useState(false);

    // ── queries ──────────────────────────────────────────────────────────────
    const { data: productRes, isLoading: isLoadingProduct, error: productError } = useQuery({
        queryKey: ["product", productId],
        queryFn: () => getProductByIdApi(productId),
        enabled: !!productId,
    });
    const { data: groupRes, isLoading: isLoadingGroups } = useQuery({
        queryKey: ["all-groups"],
        queryFn: () => getAllGroupApi(),
    });
    const { data: couponRes, isLoading: isLoadingCoupons } = useQuery({
        queryKey: ["active-coupons"],
        queryFn: () => getActiveCouponApi(),
    });

    const groups = groupRes?.data || [];
    const coupons = couponRes?.data || [];

    // Derive the subcategoryId from the selected group
    const selectedGroup = groups.find((g) => g.groupId === formData.groupId);
    const subCategoryId = selectedGroup?.subCategoryId ?? "";

    // ── hydrate ───────────────────────────────────────────────────────────────
    useEffect(() => {
        const product = productRes?.data;
        if (!product || hasHydrated) return;

        setFormData({
            groupId: product.groupId || "",
            title: product.title || "",
            subTitle: product.subTitle || "",
            mainPrice: product.mainPrice?.toString() || "",
            discount: product.discount?.toString() || "",
            price: product.price?.toString() || "",
            status: product.status || "draft",
            slug: product.slug || "",
            metaTitle: product.metaTitle || "",
            metaDescription: product.metaDescription || "",
            couponId: product.couponId || "",
            isNewArrival: !!product.isNewArrival,
            isHotDeal: !!product.isHotDeal,
            isDiscounted: !!product.isDiscounted,
        });

        setBannerImage({ existingUrl: product.bannerImageURL || null, file: null, previewUrl: null });

        setProductImages(
            (product.images || [])
                .slice()
                .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                .map((img) => ({
                    key: img.productImageId,
                    type: "existing",
                    id: img.productImageId,
                    url: img.imageURL,
                }))
        );

        setProductFilters(
            (product.productFilters || [])
                .slice()
                .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                .map((pf) => ({
                    productFilterId: pf.productFilterId,
                    filterId: pf.filterId,
                    filterItemId: pf.filterItemId,
                    orderIndex: pf.orderIndex ?? 0,
                }))
        );

        setHasHydrated(true);
    }, [productRes, hasHydrated]);

    // ── field handlers ────────────────────────────────────────────────────────
    const handleFieldChange = (field, value) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const handleToggle = (field) =>
        setFormData((prev) => ({ ...prev, [field]: !prev[field] }));

    const handleBannerChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        if (bannerImage.previewUrl) URL.revokeObjectURL(bannerImage.previewUrl);
        setBannerImage({ existingUrl: bannerImage.existingUrl, file, previewUrl: URL.createObjectURL(file) });
    };

    const handleRemoveBanner = () => {
        if (bannerImage.previewUrl) URL.revokeObjectURL(bannerImage.previewUrl);
        setBannerImage({ existingUrl: null, file: null, previewUrl: null });
    };

    const handleAddProductImages = (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        if (!files.length) return;
        const currentNewCount = productImages.filter((img) => img.type === "new").length;
        if (currentNewCount + files.length > MAX_NEW_PRODUCT_IMAGES) {
            window.showToast(`You can add up to ${MAX_NEW_PRODUCT_IMAGES} new images per save.`, "error");
            return;
        }
        setProductImages((prev) => [
            ...prev,
            ...files.map((file) => ({
                key: `new-${Date.now()}-${file.name}-${Math.random()}`,
                type: "new",
                file,
                previewUrl: URL.createObjectURL(file),
            })),
        ]);
    };

    const handleRemoveProductImage = (key) => {
        setProductImages((prev) => {
            const target = prev.find((img) => img.key === key);
            if (target?.type === "new" && target.previewUrl) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((img) => img.key !== key);
        });
    };

    const handleMoveProductImage = (index, direction) => {
        setProductImages((prev) => {
            const next = [...prev];
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= next.length) return prev;
            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });
    };

    // ── mutation ──────────────────────────────────────────────────────────────
    const { mutate: updateProduct, isPending: isSaving } = useMutation({
        mutationFn: (formPayload) => updateProductByIdApi(productId, formPayload),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Product updated successfully.", "success");
                navigate(-1);
            } else {
                window.showToast("Failed to update the product.", "error");
            }
        },
        onError: (error) => {
            console.error("Error updating product:", error);
            window.showToast("An error occurred while updating the product.", "error");
        },
    });

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!formData.groupId) return window.showToast("Please select a group.", "error");
        if (!formData.title.trim()) return window.showToast("Title is required.", "error");
        if (!formData.mainPrice || !formData.price) return window.showToast("Main price and price are required.", "error");
        if (!formData.slug.trim()) return window.showToast("Slug is required.", "error");

        const existingPayload = [];
        const newOrderIndexes = [];
        const newFiles = [];

        productImages.forEach((img, index) => {
            if (img.type === "existing") {
                existingPayload.push({ productImageId: img.id, orderIndex: index });
            } else {
                newOrderIndexes.push(index);
                newFiles.push(img.file);
            }
        });

        const form = new FormData();
        form.append("groupId", formData.groupId);
        form.append("title", formData.title);
        form.append("subTitle", formData.subTitle);
        form.append("mainPrice", formData.mainPrice);
        if (formData.discount) form.append("discount", formData.discount);
        form.append("price", formData.price);
        form.append("status", formData.status);
        form.append("slug", formData.slug);
        form.append("metaTitle", formData.metaTitle);
        form.append("metaDescription", formData.metaDescription);
        form.append("couponId", formData.couponId || "");
        form.append("isNewArrival", formData.isNewArrival);
        form.append("isHotDeal", formData.isHotDeal);
        form.append("isDiscounted", formData.isDiscounted);

        if (bannerImage.file) form.append("bannerImage", bannerImage.file);

        form.append("existingProductImages", JSON.stringify(existingPayload));
        form.append("newImageOrderIndexes", JSON.stringify(newOrderIndexes));
        newFiles.forEach((file) => form.append("productImages", file));

        // productFilters — send full array; controller/service handles diff
        form.append(
            "productFilters",
            JSON.stringify(
                productFilters.map((pf, i) => ({
                    ...(pf.productFilterId ? { productFilterId: pf.productFilterId } : {}),
                    filterId: pf.filterId,
                    filterItemId: pf.filterItemId,
                    orderIndex: i,
                }))
            )
        );

        updateProduct(form);
    };

    const isLoadingDropdowns = isLoadingGroups || isLoadingCoupons;

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Edit Product
                    </h1>
                    <p className="text-gray-500 font-mono text-xs">{productId}</p>
                </div>

                {(isLoadingProduct || isLoadingDropdowns) && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400 text-sm">Loading product…</p>
                    </div>
                )}

                {productError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                        <p className="text-red-400 text-sm">Error fetching product: {productError.message}</p>
                    </div>
                )}

                {!isLoadingProduct && !isLoadingDropdowns && !productError && hasHydrated && (
                    <div className="space-y-6">

                        {/* ── Core Details ── */}
                        <SectionCard title="Core Details">
                            <div className="mb-5">
                                <FieldLabel>Group</FieldLabel>
                                <div className="relative">
                                    <select
                                        value={formData.groupId}
                                        onChange={(e) => handleFieldChange("groupId", e.target.value)}
                                        className={inputCls + " appearance-none pr-10"}
                                    >
                                        <option value="">Select group</option>
                                        {groups.map((group) => (
                                            <option key={group.groupId} value={group.groupId}>
                                                {group.category?.title} / {group.subCategory?.title} — {group.brand?.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <FieldLabel>Title</FieldLabel>
                                    <input type="text" value={formData.title}
                                        onChange={(e) => handleFieldChange("title", e.target.value)}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <FieldLabel>Subtitle</FieldLabel>
                                    <input type="text" value={formData.subTitle}
                                        onChange={(e) => handleFieldChange("subTitle", e.target.value)}
                                        className={inputCls} />
                                </div>
                            </div>

                            <div className="mt-5">
                                <FieldLabel>Slug</FieldLabel>
                                <input type="text" value={formData.slug}
                                    onChange={(e) => handleFieldChange("slug", e.target.value)}
                                    className={inputCls + " font-mono"} />
                            </div>

                            <div className="mt-5">
                                <FieldLabel>Status</FieldLabel>
                                <div className="inline-flex rounded-lg border border-gray-600 overflow-hidden">
                                    {["draft", "published"].map((s) => (
                                        <button key={s} type="button"
                                            onClick={() => handleFieldChange("status", s)}
                                            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${formData.status === s
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── Pricing ── */}
                        <SectionCard title="Pricing">
                            <div className="grid sm:grid-cols-3 gap-5 mb-5">
                                <div>
                                    <FieldLabel>Main Price (৳)</FieldLabel>
                                    <input type="number" value={formData.mainPrice}
                                        onChange={(e) => handleFieldChange("mainPrice", e.target.value)}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <FieldLabel>Selling Price (৳)</FieldLabel>
                                    <input type="number" value={formData.price}
                                        onChange={(e) => handleFieldChange("price", e.target.value)}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <FieldLabel>Discount (৳)</FieldLabel>
                                    <input type="number" value={formData.discount}
                                        onChange={(e) => handleFieldChange("discount", e.target.value)}
                                        className={inputCls} />
                                </div>
                            </div>

                            <div className="mb-6">
                                <FieldLabel>Coupon (optional)</FieldLabel>
                                <div className="relative">
                                    <select value={formData.couponId}
                                        onChange={(e) => handleFieldChange("couponId", e.target.value)}
                                        className={inputCls + " appearance-none pr-10"}
                                    >
                                        <option value="">None</option>
                                        {coupons.map((coupon) => (
                                            <option key={coupon.couponId} value={coupon.couponId}>
                                                {coupon.code} ({coupon.discountPCT ? `${coupon.discountPCT}%` : `৳${coupon.discountAMT}`})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {[
                                    { field: "isNewArrival", label: "New Arrival" },
                                    { field: "isHotDeal", label: "Hot Deal" },
                                    { field: "isDiscounted", label: "Discounted" },
                                ].map(({ field, label }) => (
                                    <button key={field} type="button" onClick={() => handleToggle(field)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${formData[field]
                                            ? "bg-blue-600/20 border-blue-500 text-blue-400"
                                            : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"}`}
                                    >
                                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${formData[field] ? "bg-blue-500 border-blue-500" : "border-gray-500"}`} />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </SectionCard>

                        {/* ── SEO ── */}
                        <SectionCard title="SEO (optional)">
                            <div className="space-y-5">
                                <div>
                                    <FieldLabel>Meta Title</FieldLabel>
                                    <input type="text" value={formData.metaTitle}
                                        onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                                        className={inputCls} />
                                </div>
                                <div>
                                    <FieldLabel>Meta Description</FieldLabel>
                                    <textarea value={formData.metaDescription}
                                        onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
                                        rows={3}
                                        className={inputCls + " resize-y"} />
                                </div>
                            </div>
                        </SectionCard>

                        {/* ── Banner Image ── */}
                        <SectionCard title="Banner Image">
                            {(bannerImage.previewUrl || bannerImage.existingUrl) ? (
                                <div className="relative w-40 aspect-square rounded-xl overflow-hidden border border-gray-600">
                                    <img
                                        src={bannerImage.previewUrl || bannerImage.existingUrl}
                                        alt="Banner preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button type="button" onClick={handleRemoveBanner}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                    {bannerImage.previewUrl && (
                                        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-green-600/90 rounded text-[10px] font-medium">New</span>
                                    )}
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-40 aspect-square rounded-xl border border-dashed border-gray-600 cursor-pointer hover:border-blue-500 hover:bg-blue-600/5 transition">
                                    <ImagePlus className="w-6 h-6 text-gray-500 mb-2" />
                                    <span className="text-xs text-gray-500">Upload banner</span>
                                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                                </label>
                            )}
                        </SectionCard>

                        {/* ── Product Images ── */}
                        <SectionCard title="Product Images">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-xs text-gray-500">
                                    {productImages.length} image{productImages.length !== 1 ? "s" : ""} · drag order with arrows
                                </p>
                                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm cursor-pointer transition">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Images</span>
                                    <input type="file" accept="image/*" multiple onChange={handleAddProductImages} className="hidden" />
                                </label>
                            </div>

                            {productImages.length === 0 && (
                                <p className="text-gray-500 text-sm">No product images added yet.</p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {productImages.map((img, index) => (
                                    <div key={img.key}
                                        className="relative bg-gray-700/50 border border-gray-600 rounded-xl overflow-hidden aspect-square">
                                        <img
                                            src={img.type === "existing" ? img.url : img.previewUrl}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button type="button" onClick={() => handleRemoveProductImage(img.key)}
                                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                                            <button type="button" onClick={() => handleMoveProductImage(index, -1)} disabled={index === 0}
                                                className="p-1.5 bg-gray-900/80 hover:bg-gray-900 rounded-full transition disabled:opacity-30">
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button type="button" onClick={() => handleMoveProductImage(index, 1)} disabled={index === productImages.length - 1}
                                                className="p-1.5 bg-gray-900/80 hover:bg-gray-900 rounded-full transition disabled:opacity-30">
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        {img.type === "new" && (
                                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-green-600/90 rounded text-[10px] font-medium">New</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* ── Product Filters ── */}
                        <SectionCard title="Product Filters">
                            <div className="flex items-center gap-2 mb-5">
                                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                                <p className="text-xs text-gray-500">
                                    Filters are scoped to the selected group's subcategory.
                                </p>
                            </div>
                            <ProductFiltersSection
                                subCategoryId={subCategoryId}
                                productFilters={productFilters}
                                onChange={setProductFilters}
                            />
                        </SectionCard>

                        {/* ── Submit ── */}
                        <div className="flex justify-end gap-3 pb-10">
                            <button type="button" onClick={() => navigate(-1)}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors text-sm">
                                Cancel
                            </button>
                            <button type="button" onClick={handleSubmit} disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 text-sm">
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                                ) : (
                                    <><Save className="w-4 h-4" />Save Changes</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EditProduct;