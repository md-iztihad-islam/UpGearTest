import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, X, Save, ImagePlus } from "lucide-react";

import addProductApi from "@/services/dashboard/product/addProductApi";
import getAllGroupApi from "@/services/dashboard/group/getAllGroupApi";
import getActiveCouponApi from "@/services/dashboard/coupon/getActiveCouponApi";
import getAllFilterItemsApi from "@/services/dashboard/category/getAllFilterItemsApi";
import getAllFiltersApi from "@/services/dashboard/category/getAllFiltersApi";

const MAX_PRODUCT_IMAGES = 10;

const slugify = (text) =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

const buildSlug = (title, subTitle) => slugify(`${title} ${subTitle}`.trim());

function AddProduct() {
    const navigate = useNavigate();

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
    const [slugTouched, setSlugTouched] = useState(false);
    const [bannerImage, setBannerImage] = useState(null);
    const [productImages, setProductImages] = useState([]);
    const [filterSelections, setFilterSelections] = useState({}); // { [filterId]: filterItemId }

    const { data: groupRes, isLoading: isLoadingGroups } = useQuery({
        queryKey: ["all-groups"],
        queryFn: () => getAllGroupApi(),
    });
    const { data: couponRes, isLoading: isLoadingCoupons } = useQuery({
        queryKey: ["active-coupons"],
        queryFn: () => getActiveCouponApi(),
    });
    const { data: filterRes, isLoading: isLoadingFilters } = useQuery({
        queryKey: ["all-filters"],
        queryFn: () => getAllFiltersApi(),
    });
    const { data: filterItemRes, isLoading: isLoadingFilterItems } = useQuery({
        queryKey: ["all-filter-items"],
        queryFn: () => getAllFilterItemsApi(),
    });

    const groups = groupRes?.data || [];
    const coupons = couponRes?.data || [];
    const allFilters = filterRes?.data || [];
    const allFilterItems = filterItemRes?.data || [];

    const selectedGroup = useMemo(
        () => groups.find((g) => g.groupId === formData.groupId),
        [groups, formData.groupId]
    );

    const filtersForSelectedSubCategory = useMemo(() => {
        if (!selectedGroup?.subCategoryId) return [];
        return allFilters.filter((f) => f.subCategoryId === selectedGroup.subCategoryId);
    }, [allFilters, selectedGroup]);

    const filterItemsByFilterId = useMemo(() => {
        const map = {};
        allFilterItems.forEach((item) => {
            if (!map[item.filterId]) map[item.filterId] = [];
            map[item.filterId].push(item);
        });
        return map;
    }, [allFilterItems]);

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGroupChange = (groupId) => {
        setFormData((prev) => ({ ...prev, groupId }));
        setFilterSelections({});
    };

    const handleTitleChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug: slugTouched ? prev.slug : buildSlug(value, prev.subTitle),
        }));
    };

    const handleSubTitleChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            subTitle: value,
            slug: slugTouched ? prev.slug : buildSlug(prev.title, value),
        }));
    };

    const handleSlugChange = (value) => {
        setSlugTouched(true);
        handleFieldChange("slug", value);
    };

    const handleToggle = (field) => {
        setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const handleFilterSelectionChange = (filterId, filterItemId) => {
        setFilterSelections((prev) => {
            const next = { ...prev };
            if (filterItemId) {
                next[filterId] = filterItemId;
            } else {
                delete next[filterId];
            }
            return next;
        });
    };

    const handleBannerChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        if (bannerImage?.previewUrl) URL.revokeObjectURL(bannerImage.previewUrl);
        setBannerImage({ file, previewUrl: URL.createObjectURL(file) });
    };

    const handleRemoveBanner = () => {
        if (bannerImage?.previewUrl) URL.revokeObjectURL(bannerImage.previewUrl);
        setBannerImage(null);
    };

    const handleAddProductImages = (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        if (files.length === 0) return;

        if (productImages.length + files.length > MAX_PRODUCT_IMAGES) {
            window.showToast(`You can add up to ${MAX_PRODUCT_IMAGES} product images.`, "error");
            return;
        }

        setProductImages((prev) => [
            ...prev,
            ...files.map((file) => ({
                key: `${Date.now()}-${file.name}-${Math.random()}`,
                file,
                previewUrl: URL.createObjectURL(file),
            })),
        ]);
    };

    const handleRemoveProductImage = (key) => {
        setProductImages((prev) => {
            const target = prev.find((img) => img.key === key);
            if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((img) => img.key !== key);
        });
    };

    const { mutate: addProduct, isPending: isSaving } = useMutation({
        mutationFn: (formPayload) => addProductApi(formPayload),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Product added successfully.", "success");
                navigate(-1);
            } else {
                window.showToast("Failed to add the product.", "error");
            }
        },
        onError: (error) => {
            console.error("Error adding product:", error);
            window.showToast("An error occurred while adding the product.", "error");
        },
    });

    const handleSubmit = () => {
        if (!formData.groupId) {
            window.showToast("Please select a group.", "error");
            return;
        }
        if (!formData.title.trim()) {
            window.showToast("Title is required.", "error");
            return;
        }
        if (!formData.mainPrice || !formData.price) {
            window.showToast("Main price and price are required.", "error");
            return;
        }
        if (!formData.slug.trim()) {
            window.showToast("Slug is required.", "error");
            return;
        }

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
        if (formData.couponId) form.append("couponId", formData.couponId);
        form.append("isNewArrival", formData.isNewArrival);
        form.append("isHotDeal", formData.isHotDeal);
        form.append("isDiscounted", formData.isDiscounted);

        const productFiltersPayload = Object.entries(filterSelections)
            .filter(([, filterItemId]) => !!filterItemId)
            .map(([filterId, filterItemId], index) => ({
                filterId,
                filterItemId,
                orderIndex: index,
            }));
        form.append("productFilters", JSON.stringify(productFiltersPayload));

        if (bannerImage?.file) {
            form.append("bannerImage", bannerImage.file);
        }
        productImages.forEach((img) => form.append("productImages", img.file));

        addProduct(form);
    };

    const isLoadingDropdowns =
        isLoadingGroups || isLoadingCoupons || isLoadingFilters || isLoadingFilterItems;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Add Product
                    </h1>
                    <p className="text-gray-400">Create a new product under an existing group</p>
                </div>

                {isLoadingDropdowns ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400">Loading...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Core Details */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-lg font-semibold mb-6">Core Details</h2>

                            <div className="mb-5">
                                <label className="block text-sm text-gray-400 mb-2">Group</label>
                                <select
                                    value={formData.groupId}
                                    onChange={(e) => handleGroupChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                >
                                    <option value="">Select group</option>
                                    {groups.map((group) => (
                                        <option key={group.groupId} value={group.groupId}>
                                            {group.groupId} — {group.category?.title} / {group.subCategory?.title} ({group.brand?.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                        placeholder="e.g. Aula F75 Mechanical Keyboard"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Subtitle</label>
                                    <input
                                        type="text"
                                        value={formData.subTitle}
                                        onChange={(e) => handleSubTitleChange(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="block text-sm text-gray-400 mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    placeholder="auto-generated-from-title"
                                />
                            </div>

                            <div className="mt-5">
                                <label className="block text-sm text-gray-400 mb-2">Status</label>
                                <div className="inline-flex rounded-lg border border-gray-600 overflow-hidden">
                                    {["draft", "published"].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => handleFieldChange("status", s)}
                                            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
                                                formData.status === s
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Filters */}
                        {selectedGroup && (
                            <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                                <h2 className="text-lg font-semibold mb-6">Filters</h2>

                                {filtersForSelectedSubCategory.length === 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        No filters configured for this subcategory.
                                    </p>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        {filtersForSelectedSubCategory.map((filter) => (
                                            <div key={filter.filterId}>
                                                <label className="block text-sm text-gray-400 mb-2">
                                                    {filter.title}
                                                </label>
                                                <select
                                                    value={filterSelections[filter.filterId] || ""}
                                                    onChange={(e) =>
                                                        handleFilterSelectionChange(filter.filterId, e.target.value)
                                                    }
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                                >
                                                    <option value="">None</option>
                                                    {(filterItemsByFilterId[filter.filterId] || []).map((item) => (
                                                        <option key={item.filterItemId} value={item.filterItemId}>
                                                            {item.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Pricing */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-lg font-semibold mb-6">Pricing</h2>

                            <div className="grid sm:grid-cols-3 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Main Price (৳)</label>
                                    <input
                                        type="number"
                                        value={formData.mainPrice}
                                        onChange={(e) => handleFieldChange("mainPrice", e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Selling Price (৳)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => handleFieldChange("price", e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Discount (৳)</label>
                                    <input
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => handleFieldChange("discount", e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Coupon (optional)</label>
                                <select
                                    value={formData.couponId}
                                    onChange={(e) => handleFieldChange("couponId", e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                >
                                    <option value="">None</option>
                                    {coupons.map((coupon) => (
                                        <option key={coupon.couponId} value={coupon.couponId}>
                                            {coupon.code} ({coupon.discountPCT ? `${coupon.discountPCT}%` : `৳${coupon.discountAMT}`})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-6">
                                {[
                                    { field: "isNewArrival", label: "New Arrival" },
                                    { field: "isHotDeal", label: "Hot Deal" },
                                    { field: "isDiscounted", label: "Discounted" },
                                ].map(({ field, label }) => (
                                    <button
                                        key={field}
                                        type="button"
                                        onClick={() => handleToggle(field)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                                            formData[field]
                                                ? "bg-blue-600/20 border-blue-500 text-blue-400"
                                                : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"
                                        }`}
                                    >
                                        <span
                                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                                                formData[field] ? "bg-blue-500 border-blue-500" : "border-gray-500"
                                            }`}
                                        />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* SEO */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-lg font-semibold mb-6">SEO (optional)</h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Meta Title</label>
                                    <input
                                        type="text"
                                        value={formData.metaTitle}
                                        onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Meta Description</label>
                                    <textarea
                                        value={formData.metaDescription}
                                        onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition resize-y"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Banner Image */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-lg font-semibold mb-6">Banner Image</h2>
                            {bannerImage ? (
                                <div className="relative w-40 aspect-square rounded-lg overflow-hidden border border-gray-600">
                                    <img src={bannerImage.previewUrl} alt="Banner preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveBanner}
                                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-40 aspect-square rounded-lg border border-dashed border-gray-600 cursor-pointer hover:border-blue-500 transition-colors">
                                    <ImagePlus className="w-6 h-6 text-gray-500 mb-2" />
                                    <span className="text-xs text-gray-500">Upload banner</span>
                                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                                </label>
                            )}
                        </section>

                        {/* Product Images */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">Product Images</h2>
                                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm cursor-pointer transition-colors">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Images</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleAddProductImages}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {productImages.length === 0 && (
                                <p className="text-gray-500 text-sm">No product images added yet.</p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {productImages.map((img) => (
                                    <div
                                        key={img.key}
                                        className="relative bg-gray-700/50 border border-gray-600 rounded-lg overflow-hidden aspect-square"
                                    >
                                        <img src={img.previewUrl} alt="Product" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProductImage(img.key)}
                                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Submit */}
                        <div className="flex justify-end gap-3 pb-10">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Create Product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddProduct;