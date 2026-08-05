import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, X, ArrowUp, ArrowDown, Save } from "lucide-react";

import getGroupByIdApi from "@/services/dashboard/group/getGroupByIdApi";
import updateGroupByIdApi from "@/services/dashboard/group/updateGroupByIdApi";
import getAllBrandsApi from "@/services/dashboard/brand/getAllBrandsApi";
import getAllCategories from "@/services/dashboard/category/getAllCategories";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";
import getAllWarrantiesApi from "@/services/dashboard/warrenty/getAllWarrantiesApi";

const MAX_NEW_IMAGES = 3;

function EditGroup() {
    const navigate = useNavigate();
    const { groupId } = useParams();

    const [formData, setFormData] = useState({
        brandId: "",
        categoryId: "",
        subCategoryId: "",
        warrantyId: "",
        description: "",
        productType: "instock",
        insideDhakaCharge: "",
        outsideDhakaCharge: "",
        keyFeaturesText: "",
        tagsText: "",
    });

    const [descriptionImages, setDescriptionImages] = useState([]);
    const [specifications, setSpecifications] = useState([]);
    const [hasHydrated, setHasHydrated] = useState(false);

    // Fetch the group being edited
    const { data: groupRes, isLoading: isLoadingGroup, error: groupError } = useQuery({
        queryKey: ["group", groupId],
        queryFn: () => getGroupByIdApi(groupId),
        enabled: !!groupId,
    });

    // Fetch dropdown sources
    const { data: brandRes, isLoading: isLoadingBrands } = useQuery({
        queryKey: ["all-brands"],
        queryFn: () => getAllBrandsApi(),
    });
    const { data: categoryRes, isLoading: isLoadingCategories } = useQuery({
        queryKey: ["all-categories"],
        queryFn: () => getAllCategories(),
    });
    const { data: subCategoryRes, isLoading: isLoadingSubCategories } = useQuery({
        queryKey: ["all-subcategories"],
        queryFn: () => getAllSubCategoriesApi(),
    });
    const { data: warrantyRes, isLoading: isLoadingWarranties } = useQuery({
        queryKey: ["all-warranties"],
        queryFn: () => getAllWarrantiesApi(),
    });

    const brands = brandRes?.data || [];
    const categories = categoryRes?.data || [];
    const allSubCategories = subCategoryRes?.data || [];
    const warranties = warrantyRes?.data || [];

    const subCategoriesForSelectedCategory = useMemo(() => {
        if (!formData.categoryId) return [];
        return allSubCategories.filter((sc) => sc.categoryId === formData.categoryId);
    }, [allSubCategories, formData.categoryId]);

    // Hydrate local state once the group loads
    useEffect(() => {
        const group = groupRes?.data;
        if (!group || hasHydrated) return;

        setFormData({
            brandId: group.brandId || "",
            categoryId: group.categoryId || "",
            subCategoryId: group.subCategoryId || "",
            warrantyId: group.warrantyId || "",
            description: group.description || "",
            productType: group.productType || "instock",
            insideDhakaCharge: group.insideDhakaCharge?.toString() || "",
            outsideDhakaCharge: group.outsideDhakaCharge?.toString() || "",
            keyFeaturesText: (group.keyFeatures || []).map((kf) => kf.feature).join(", "),
            tagsText: (group.tags || []).map((t) => t.tag).join(", "),
        });

        setDescriptionImages(
            (group.descriptionImages || [])
                .slice()
                .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                .map((img) => ({
                    key: img.descriptionImageId,
                    type: "existing",
                    id: img.descriptionImageId,
                    url: img.imageURL,
                }))
        );

        setSpecifications(
            (group.productSpecifications || []).map((spec) => ({
                productSpecificationId: spec.productSpecificationId,
                specificationId: spec.specificationId,
                value: spec.value,
            }))
        );

        setHasHydrated(true);
    }, [groupRes, hasHydrated]);

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCategoryChange = (categoryId) => {
        setFormData((prev) => ({ ...prev, categoryId, subCategoryId: "" }));
    };

    const handleSpecChange = (productSpecificationId, value) => {
        setSpecifications((prev) =>
            prev.map((spec) =>
                spec.productSpecificationId === productSpecificationId ? { ...spec, value } : spec
            )
        );
    };

    const handleAddImageFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        const newImageCount = descriptionImages.filter((img) => img.type === "new").length;
        if (newImageCount >= MAX_NEW_IMAGES) {
            window.showToast(`You can add up to ${MAX_NEW_IMAGES} new images per save.`, "error");
            return;
        }

        setDescriptionImages((prev) => [
            ...prev,
            {
                key: `new-${Date.now()}`,
                type: "new",
                file,
                previewUrl: URL.createObjectURL(file),
            },
        ]);
    };

    const handleRemoveImage = (key) => {
        setDescriptionImages((prev) => {
            const target = prev.find((img) => img.key === key);
            if (target?.type === "new" && target.previewUrl) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((img) => img.key !== key);
        });
    };

    const handleMoveImage = (index, direction) => {
        setDescriptionImages((prev) => {
            const next = [...prev];
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= next.length) return prev;
            [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
            return next;
        });
    };

    const { mutate: updateGroup, isPending: isSaving } = useMutation({
        mutationFn: (formPayload) => updateGroupByIdApi(groupId, formPayload),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Group updated successfully.", "success");
                navigate(-1);
            } else {
                window.showToast("Failed to update the group.", "error");
            }
        },
        onError: (error) => {
            console.error("Error updating group:", error);
            window.showToast("An error occurred while updating the group.", "error");
        },
    });

    const handleSubmit = () => {
        if (!formData.categoryId || !formData.subCategoryId || !formData.brandId) {
            window.showToast("Brand, category, and subcategory are required.", "error");
            return;
        }

        const existingPayload = [];
        const newOrderIndexes = [];
        const newFiles = [];

        descriptionImages.forEach((img, index) => {
            if (img.type === "existing") {
                existingPayload.push({
                    descriptionImageId: img.id,
                    imageURL: img.url,
                    orderIndex: index,
                });
            } else {
                newOrderIndexes.push(index);
                newFiles.push(img.file);
            }
        });

        const form = new FormData();
        form.append("brandId", formData.brandId);
        form.append("categoryId", formData.categoryId);
        form.append("subCategoryId", formData.subCategoryId);
        form.append("warrantyId", formData.warrantyId || "");
        form.append("description", formData.description);
        form.append("productType", formData.productType);
        form.append("insideDhakaCharge", formData.insideDhakaCharge);
        form.append("outsideDhakaCharge", formData.outsideDhakaCharge);
        form.append(
            "keyFeatures",
            JSON.stringify(
                formData.keyFeaturesText.split(",").map((f) => f.trim()).filter(Boolean)
            )
        );
        form.append(
            "tags",
            JSON.stringify(
                formData.tagsText.split(",").map((t) => t.trim()).filter(Boolean)
            )
        );
        form.append(
            "productSpecifications",
            JSON.stringify(
                specifications.map((spec) => ({
                    productSpecificationId: spec.productSpecificationId,
                    value: spec.value,
                }))
            )
        );
        form.append("existingDescriptionImages", JSON.stringify(existingPayload));
        form.append("newImageOrderIndexes", JSON.stringify(newOrderIndexes));
        newFiles.forEach((file) => form.append("descImages", file));

        updateGroup(form);
    };

    const isLoadingDropdowns =
        isLoadingBrands || isLoadingCategories || isLoadingSubCategories || isLoadingWarranties;

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
                        Edit Group
                    </h1>
                    <p className="text-gray-400 font-mono text-sm">{groupId}</p>
                </div>

                {/* Loading / Error */}
                {(isLoadingGroup || isLoadingDropdowns) && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400">Loading group...</p>
                    </div>
                )}

                {groupError && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
                        <p className="text-red-400">Error fetching group: {groupError.message}</p>
                    </div>
                )}

                {!isLoadingGroup && !isLoadingDropdowns && !groupError && hasHydrated && (
                    <div className="space-y-6">
                        {/* Core Details */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-lg font-semibold mb-6">Core Details</h2>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Brand</label>
                                    <select
                                        value={formData.brandId}
                                        onChange={(e) => handleFieldChange("brandId", e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    >
                                        <option value="">Select brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand.brandId} value={brand.brandId}>
                                                {brand.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Warranty</label>
                                    <select
                                        value={formData.warrantyId}
                                        onChange={(e) => handleFieldChange("warrantyId", e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    >
                                        <option value="">None</option>
                                        {warranties.map((warranty) => (
                                            <option key={warranty.warrantyId} value={warranty.warrantyId}>
                                                {warranty.title || warranty.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.categoryId} value={cat.categoryId}>
                                                {cat.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Subcategory</label>
                                    <select
                                        value={formData.subCategoryId}
                                        onChange={(e) => handleFieldChange("subCategoryId", e.target.value)}
                                        disabled={!formData.categoryId}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition disabled:opacity-50"
                                    >
                                        <option value="">Select subcategory</option>
                                        {subCategoriesForSelectedCategory.map((sc) => (
                                            <option key={sc.subCategoryId} value={sc.subCategoryId}>
                                                {sc.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="block text-sm text-gray-400 mb-2">Product Type</label>
                                <div className="inline-flex rounded-lg border border-gray-600 overflow-hidden">
                                    {["instock", "preorder"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleFieldChange("productType", type)}
                                            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                                                formData.productType === type
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            }`}
                                        >
                                            {type === "instock" ? "In Stock" : "Pre-Order"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleFieldChange("description", e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition resize-y"
                                    placeholder="Group description (HTML supported)"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5 mt-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Inside Dhaka Charge (৳)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.insideDhakaCharge}
                                        onChange={(e) => handleFieldChange("insideDhakaCharge", e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Outside Dhaka Charge (৳)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.outsideDhakaCharge}
                                        onChange={(e) => handleFieldChange("outsideDhakaCharge", e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Key Features & Tags */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-lg font-semibold mb-6">Key Features &amp; Tags</h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Key Features <span className="text-gray-500">(comma separated)</span>
                                    </label>
                                    <textarea
                                        value={formData.keyFeaturesText}
                                        onChange={(e) => handleFieldChange("keyFeaturesText", e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition resize-y"
                                        placeholder="e.g. Bluetooth 5.0, RGB backlight, Hot-swappable switches"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Tags <span className="text-gray-500">(comma separated)</span>
                                    </label>
                                    <textarea
                                        value={formData.tagsText}
                                        onChange={(e) => handleFieldChange("tagsText", e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition resize-y"
                                        placeholder="e.g. gaming, wireless, mechanical"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Specifications */}
                        {specifications.length > 0 && (
                            <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                                <h2 className="text-lg font-semibold mb-6">Specifications</h2>
                                <div className="space-y-3">
                                    {specifications.map((spec) => (
                                        <div key={spec.productSpecificationId} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                                            <span className="text-sm text-gray-500 font-mono w-full sm:w-48 truncate">
                                                {spec.specificationId}
                                            </span>
                                            <input
                                                type="text"
                                                value={spec.value}
                                                onChange={(e) => handleSpecChange(spec.productSpecificationId, e.target.value)}
                                                className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-4">
                                    Adding new specifications isn't supported yet — only existing values can be edited here.
                                </p>
                            </section>
                        )}

                        {/* Description Images */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">Description Images</h2>
                                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm cursor-pointer transition-colors">
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Add Image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAddImageFile}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {descriptionImages.length === 0 && (
                                <p className="text-gray-500 text-sm">No description images added yet.</p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {descriptionImages.map((img, index) => (
                                    <div
                                        key={img.key}
                                        className="relative bg-gray-700/50 border border-gray-600 rounded-lg overflow-hidden aspect-square"
                                    >
                                        <img
                                            src={img.type === "existing" ? img.url : img.previewUrl}
                                            alt={`Description ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(img.key)}
                                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleMoveImage(index, -1)}
                                                disabled={index === 0}
                                                className="p-1.5 bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors disabled:opacity-30"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMoveImage(index, 1)}
                                                disabled={index === descriptionImages.length - 1}
                                                className="p-1.5 bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors disabled:opacity-30"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {img.type === "new" && (
                                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-green-600/90 rounded text-[10px] font-medium">
                                                New
                                            </span>
                                        )}
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
                                        Save Changes
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

export default EditGroup;