import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Plus, X, ChevronLeft, ChevronRight, Save } from "lucide-react";

import RichTextEditor from "@/components/textEditor/TextEditor";
import getGroupByIdApi from "@/services/dashboard/group/getGroupByIdApi";
import updateGroupByIdApi from "@/services/dashboard/group/updateGroupByIdApi";
import getAllBrandsApi from "@/services/dashboard/brand/getAllBrandsApi";
import getAllCategories from "@/services/dashboard/category/getAllCategories";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";
import getAllWarrantiesApi from "@/services/dashboard/warrenty/getAllWarrantiesApi";
import getSpecificationBySubCategoryApi from "@/services/dashboard/category/getSpecificationBySubCategoryApi";
import addSpecificationApi from "@/services/dashboard/category/addSpecificationApi";

const MAX_NEW_IMAGES = 3;

const inputCls =
    "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition";

const moveItem = (list, from, to) => {
    if (from === to || to < 0 || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
};

function EditGroup() {
    const navigate = useNavigate();
    const { groupId } = useParams();

    const [formData, setFormData] = useState({
        brandId: "",
        categoryId: "",
        subCategoryId: "",
        warrantyId: "",
        description: "",
        insideDhakaCharge: "",
        outsideDhakaCharge: "",
        keyFeaturesText: "",
        tagsText: "",
    });

    const [descriptionImages, setDescriptionImages] = useState([]);
    // { [specificationId]: value } — specs of the selected subcategory
    const [specValues, setSpecValues] = useState({});
    const [newSpecTitle, setNewSpecTitle] = useState("");
    const [hasHydrated, setHasHydrated] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);

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
    const {
        data: specificationRes,
        isLoading: isLoadingSpecifications,
        refetch: refetchSpecifications,
    } = useQuery({
        queryKey: ["specifications", formData.subCategoryId],
        queryFn: () => getSpecificationBySubCategoryApi(formData.subCategoryId),
        enabled: !!formData.subCategoryId,
    });

    const brands = brandRes?.data || [];
    const categories = categoryRes?.data || [];
    const allSubCategories = subCategoryRes?.data || [];
    const warranties = warrantyRes?.data || [];
    const specifications = specificationRes?.data || [];

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
            insideDhakaCharge: group.insideDhakaCharge?.toString() || "",
            outsideDhakaCharge: group.outsideDhakaCharge?.toString() || "",
            keyFeaturesText: (group.keyFeatures || []).map((kf) => kf.feature).join(", "),
            tagsText: (group.tags || []).map((t) => t.tag).join(", "),
        });

        // The API already returns images in display order.
        setDescriptionImages(
            (group.descriptionImages || []).map((img) => ({
                key: img.descriptionImageId,
                type: "existing",
                id: img.descriptionImageId,
                url: img.imageURL,
            }))
        );

        setSpecValues(
            Object.fromEntries(
                (group.productSpecifications || []).map((spec) => [spec.specificationId, spec.value])
            )
        );

        setHasHydrated(true);
    }, [groupRes, hasHydrated]);

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCategoryChange = (categoryId) => {
        setFormData((prev) => ({ ...prev, categoryId, subCategoryId: "" }));
    };

    const handleSpecChange = (specificationId, value) => {
        setSpecValues((prev) => ({ ...prev, [specificationId]: value }));
    };

    const { mutate: createSpecification, isPending: isCreatingSpec } = useMutation({
        mutationFn: (title) => addSpecificationApi({ title, subCategoryId: formData.subCategoryId }),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Specification added.", "success");
                setNewSpecTitle("");
                refetchSpecifications();
            } else {
                window.showToast(data?.message || "Failed to add the specification.", "error");
            }
        },
        onError: () => window.showToast("An error occurred while adding the specification.", "error"),
    });

    const handleAddSpecification = () => {
        const title = newSpecTitle.trim();
        if (!title) return;
        if (specifications.some((spec) => spec.title.toLowerCase() === title.toLowerCase())) {
            window.showToast("That specification already exists for this subcategory.", "error");
            return;
        }
        createSpecification(title);
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
        setDescriptionImages((prev) => moveItem(prev, index, index + direction));
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        if (dragIndex !== null) {
            setDescriptionImages((prev) => moveItem(prev, dragIndex, index));
        }
        setDragIndex(null);
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
        if (formData.insideDhakaCharge === "" || formData.outsideDhakaCharge === "") {
            window.showToast("Both delivery charges are required.", "error");
            return;
        }

        const existingPayload = [];
        const newImagePositions = [];
        const newFiles = [];

        descriptionImages.forEach((img, index) => {
            if (img.type === "existing") {
                existingPayload.push({
                    descriptionImageId: img.id,
                    imageURL: img.url,
                    position: index,
                });
            } else {
                newImagePositions.push(index);
                newFiles.push(img.file);
            }
        });

        const form = new FormData();
        form.append("brandId", formData.brandId);
        form.append("categoryId", formData.categoryId);
        form.append("subCategoryId", formData.subCategoryId);
        form.append("warrantyId", formData.warrantyId || "");
        form.append("description", formData.description);
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
        // Full replacement: only specs of the current subcategory with a value are kept.
        form.append(
            "productSpecifications",
            JSON.stringify(
                specifications
                    .map((spec) => ({
                        specificationId: spec.specificationId,
                        value: (specValues[spec.specificationId] || "").trim(),
                    }))
                    .filter((spec) => spec.value)
            )
        );
        form.append("existingDescriptionImages", JSON.stringify(existingPayload));
        form.append("newImagePositions", JSON.stringify(newImagePositions));
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
                                        className={inputCls}
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
                                        className={inputCls}
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
                                        className={inputCls}
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
                                        className={inputCls + " disabled:opacity-50"}
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

                            <div className="grid sm:grid-cols-2 gap-5 mt-5">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Inside Dhaka Charge (৳)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.insideDhakaCharge}
                                        onChange={(e) => handleFieldChange("insideDhakaCharge", e.target.value)}
                                        className={inputCls}
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
                                        className={inputCls}
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
                                        className={inputCls + " resize-y"}
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
                                        className={inputCls + " resize-y"}
                                        placeholder="e.g. gaming, wireless, mechanical"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Specifications */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-lg font-semibold mb-2">Specifications</h2>
                            <p className="text-xs text-gray-500 mb-6">
                                Specifications come from the selected subcategory. Leave a value empty to remove it from this group.
                            </p>

                            {!formData.subCategoryId ? (
                                <p className="text-sm text-gray-500 italic">Select a subcategory to edit specifications.</p>
                            ) : isLoadingSpecifications ? (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Loading specifications...
                                </div>
                            ) : (
                                <>
                                    {specifications.length === 0 ? (
                                        <p className="text-sm text-gray-500 mb-5">No specifications defined for this subcategory yet.</p>
                                    ) : (
                                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                            {specifications.map((spec) => (
                                                <div key={spec.specificationId}>
                                                    <label className="block text-sm text-gray-400 mb-2">{spec.title}</label>
                                                    <input
                                                        type="text"
                                                        value={specValues[spec.specificationId] || ""}
                                                        onChange={(e) => handleSpecChange(spec.specificationId, e.target.value)}
                                                        placeholder={`Enter ${spec.title}`}
                                                        className={inputCls}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-gray-700">
                                        <input
                                            type="text"
                                            value={newSpecTitle}
                                            onChange={(e) => setNewSpecTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleAddSpecification()}
                                            placeholder="New specification for this subcategory, e.g. Battery Life"
                                            className={inputCls}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSpecification}
                                            disabled={!newSpecTitle.trim() || isCreatingSpec}
                                            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm whitespace-nowrap transition-colors disabled:opacity-50"
                                        >
                                            {isCreatingSpec ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                            Add Specification
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>

                        {/* Description */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-lg font-semibold mb-6">Description</h2>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(value) => handleFieldChange("description", value)}
                            />
                        </section>

                        {/* Description Images */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Description Images</h2>
                                    <p className="text-xs text-gray-500 mt-1">Drag or use the arrows to reorder.</p>
                                </div>
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
                                        draggable
                                        onDragStart={(e) => {
                                            setDragIndex(index);
                                            e.dataTransfer.effectAllowed = "move";
                                            e.dataTransfer.setData("text/plain", String(index));
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragEnd={() => setDragIndex(null)}
                                        className={`relative bg-gray-700/50 border border-gray-600 rounded-lg overflow-hidden aspect-square cursor-grab active:cursor-grabbing ${
                                            dragIndex === index ? "opacity-40" : ""
                                        }`}
                                    >
                                        <img
                                            src={img.type === "existing" ? img.url : img.previewUrl}
                                            alt={`Description ${index + 1}`}
                                            draggable={false}
                                            className="w-full h-full object-cover pointer-events-none"
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
                                                aria-label="Move image left"
                                                className="p-1.5 bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors disabled:opacity-30"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleMoveImage(index, 1)}
                                                disabled={index === descriptionImages.length - 1}
                                                aria-label="Move image right"
                                                className="p-1.5 bg-gray-900/80 hover:bg-gray-900 rounded-full transition-colors disabled:opacity-30"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" />
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
