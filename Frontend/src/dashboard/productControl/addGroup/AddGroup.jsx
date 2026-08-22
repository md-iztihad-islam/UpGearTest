import RichTextEditor from "@/components/textEditor/TextEditor";
import getAllCategories from "@/services/dashboard/category/getAllCategories";
import getFilterItemsBySubCategoryApi from "@/services/dashboard/category/getFilterItemsBySubCategoryApi";
import getFiltersBySubCategoryApi from "@/services/dashboard/category/getFiltersBySubCategoryApi";
import getSpecificationBySubCategoryApi from "@/services/dashboard/category/getSpecificationBySubCategoryApi";
import getSubCategoryByCategoryApi from "@/services/dashboard/category/getSubCategoryByCategoryApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import getAllWarrentiesApi from "@/services/dashboard/warrenty/getAllWarrantiesApi";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import addGroupApi from "@/services/dashboard/group/addGroupApi";
import getAllWarrantiesApi from "@/services/dashboard/warrenty/getAllWarrantiesApi";
import getAllBrandsApi from "@/services/dashboard/brand/getAllBrandsApi";

function AddGroup() {
    const navigate = useNavigate();

    const [groupId, setGroupId] = useState("");
    const [brandId, setBrandId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");

    // Shipping charges
    const [insideDhakaCharge, setInsideDhakaCharge] = useState(0);
    const [outsideDhakaCharge, setOutsideDhakaCharge] = useState(0);

    // Features & Tags
    const [keyFeaturesText, setKeyFeaturesText] = useState("");
    const [keyFeatures, setKeyFeatures] = useState([]);
    const [tagsText, setTagsText] = useState("");
    const [tags, setTags] = useState([]);

    // Filters — key: filterId, value: filterItemId
    const [selectedFilterItems, setSelectedFilterItems] = useState({}); // ✅ was missing

    // Specifications — key: specificationId, value: text
    const [specifications, setSpecifications] = useState({});

    // Description
    const [description, setDescription] = useState("");
    const [descImg01, setDescImg01] = useState(null);
    const [descImg02, setDescImg02] = useState(null);
    const [descImg03, setDescImg03] = useState(null);

    // Additional
    const [productType, setProductType] = useState("");
    const [warrantyId, setWarrantyId] = useState(null);

    // ── Derived state ──────────────────────────────────────────────────────────

    useEffect(() => {
        setKeyFeatures(
            keyFeaturesText.split(",").map((i) => i.trim()).filter((i) => i !== "")
        );
    }, [keyFeaturesText]);

    useEffect(() => {
        setTags(
            tagsText.split(",").map((i) => i.trim()).filter((i) => i !== "")
        );
    }, [tagsText]);

    // ── Queries ────────────────────────────────────────────────────────────────

    const { data: categoryData } = useQuery({
        queryKey: ["categories"],
        queryFn: getAllCategories,
    });

    const { data: brandData } = useQuery({
        queryKey: ["brands"],
        queryFn: () => getAllBrandsApi(),
    });

    const { data: subCategoriesData } = useQuery({
        queryKey: ["sub-categories", categoryId],
        queryFn: () => getSubCategoryByCategoryApi(categoryId),
        enabled: !!categoryId,
    });

    const { data: specificationData } = useQuery({
        queryKey: ["specifications", subCategoryId],
        queryFn: () => getSpecificationBySubCategoryApi(subCategoryId),
        enabled: !!subCategoryId,
    });


    const { data: warrantyData } = useQuery({
        queryKey: ["warrantyData"],
        queryFn: getAllWarrantiesApi,
    });

    // ── Mutation ───────────────────────────────────────────────────────────────

    const { mutate: addGroup, isPending } = useMutation({
        mutationFn: (formData) => addGroupApi(formData),
        onSuccess: () => {
            window.showToast("Group added successfully", "success");
            navigate(-1);
        },
        onError: () => {
            window.showToast("Error adding group", "error");
        },
    });

    const handleAddGroup = () => {
        const formData = new FormData();

        formData.append("groupId", groupId);
        formData.append("brandId", brandId);
        formData.append("categoryId", categoryId);
        formData.append("subCategoryId", subCategoryId);
        formData.append("insideDhakaCharge", insideDhakaCharge);
        formData.append("outsideDhakaCharge", outsideDhakaCharge);

        keyFeatures.forEach((f) => formData.append("keyFeatures[]", f));
        tags.forEach((t) => formData.append("tags[]", t));

        // Filter items — filterId as key, filterItemId as value
        Object.keys(selectedFilterItems).forEach((filterId) => {
            const filterItemId = selectedFilterItems[filterId];
            if (!filterItemId) return;
            formData.append(
                "filterItems[]",
                JSON.stringify({ filterId, filterItemId })
            );
        });

        if (descImg01) formData.append("descImages", descImg01);
        if (descImg02) formData.append("descImages", descImg02);
        if (descImg03) formData.append("descImages", descImg03);

        formData.append("description", description);
        // formData.append("productType", productType);
        formData.append("warrantyId", warrantyId);

        // Specifications — specificationId as key
        Object.keys(specifications).forEach((specificationId) => {
            const value = specifications[specificationId];
            if (!value) return;
            formData.append(
                "specifications[]",
                JSON.stringify({ specificationId, value })
            );
        });

        addGroup(formData);
    };

    // ── JSX ───────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10">
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
                        Add New Product
                    </h1>
                    <p className="text-gray-400">Fill in the details to create a new product</p>
                </div>

                {/* Form Container */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8 space-y-8">

                    {/* Basic Info */}
                    <Section title="Basic Information">
                        <InputRow label="Group ID" value={groupId} setValue={setGroupId} required />
                    </Section>

                    {/* Brand */}
                    <Section title="Brand">
                        <SelectRow
                            label="Brand"
                            value={brandId}
                            setValue={setBrandId}
                            options={brandData?.data}
                            idKey="brandId"
                        />
                    </Section>

                    {/* Shipping Charges */}
                    <Section title="Shipping Charges">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputRow
                                label="Inside Dhaka Charge"
                                type="number"
                                value={insideDhakaCharge}
                                setValue={setInsideDhakaCharge}
                                step="0.01"
                                placeholder="0.00"
                            />
                            <InputRow
                                label="Outside Dhaka Charge"
                                type="number"
                                value={outsideDhakaCharge}
                                setValue={setOutsideDhakaCharge}
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                    </Section>

                    {/* Features & Tags */}
                    <Section title="Features & Tags">
                        <TextareaRow
                            label="Key Features (comma separated)"
                            value={keyFeaturesText}
                            setValue={setKeyFeaturesText}
                            placeholder="Feature 1, Feature 2, Feature 3"
                        />
                        <TextareaRow
                            label="Tags (comma separated)"
                            value={tagsText}
                            setValue={setTagsText}
                            placeholder="tag1, tag2, tag3"
                        />
                    </Section>

                    {/* Category */}
                    <Section title="Category & Classification">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectRow
                                label="Category"
                                value={categoryId}
                                setValue={setCategoryId}
                                options={categoryData?.data}
                                idKey="categoryId"
                            />
                            <SelectRow
                                label="Sub-category"
                                value={subCategoryId}
                                setValue={setSubCategoryId}
                                options={subCategoriesData?.data}
                                idKey="subCategoryId"
                                disabled={!categoryId}
                            />
                        </div>
                    </Section>

                    {/* Specifications */}
                    {specificationData?.data?.length > 0 && (
                        <Section title="Specifications">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {specificationData.data.map((spec) => (
                                    <div key={spec.specificationId} className="flex flex-col gap-2">
                                        <label className="text-sm font-medium text-gray-300">
                                            {spec.title}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                            value={specifications[spec.specificationId] || ""}
                                            onChange={(e) =>
                                                setSpecifications((prev) => ({
                                                    ...prev,
                                                    [spec.specificationId]: e.target.value,
                                                }))
                                            }
                                            placeholder={`Enter ${spec.title}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Description */}
                    <Section title="Product Description">
                        <RichTextEditor value={description} onChange={setDescription} />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            <FileInputRow label="Description Image 1" setValue={setDescImg01} />
                            <FileInputRow label="Description Image 2" setValue={setDescImg02} />
                            <FileInputRow label="Description Image 3" setValue={setDescImg03} />
                        </div>
                    </Section>

                    {/* Additional Info */}
                    <Section title="Additional Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectRow
                                label="Warranty"
                                value={warrantyId}
                                setValue={setWarrantyId}
                                options={warrantyData?.data}
                                idKey="warrantyId"
                            />
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-300">Product Type</label>
                                <select
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    value={productType}
                                    onChange={(e) => setProductType(e.target.value)}
                                >
                                    <option value="">Select Product Type</option>
                                    <option value="instock">In Stock</option>
                                    <option value="preorder">Pre-Order</option>
                                </select>
                            </div>
                        </div>
                    </Section>

                    {/* Submit */}
                    <div className="flex justify-end pt-6 border-t border-gray-700">
                        <button
                            onClick={handleAddGroup}
                            disabled={isPending}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            <Save className="w-5 h-5" />
                            {isPending ? "Adding Group..." : "Add Group"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddGroup;

// ── Reusable Components ────────────────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-400 border-b border-gray-700 pb-2">
                {title}
            </h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function InputRow({ label, value, setValue, type = "text", required = false, step, placeholder }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                value={value}
                onChange={(e) =>
                    setValue(type === "number" ? Number(e.target.value) : e.target.value)
                }
                type={type}
                step={step}
                required={required}
                placeholder={placeholder}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
        </div>
    );
}

function FileInputRow({ label, setValue }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <div className="relative">
                <input
                    onChange={(e) => setValue(e.target.files[0])}
                    type="file"
                    accept="image/*"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700 transition"
                />
            </div>
        </div>
    );
}

function TextareaRow({ label, value, setValue, placeholder }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <textarea
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition min-h-[100px]"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    );
}

// idKey    — the Prisma field used as <option> value/key (e.g. "categoryId", "warrantyId")
// labelKey — the field used for display text (defaults to "title")
function SelectRow({ label, value, setValue, options, disabled = false, idKey = "id", labelKey = "title" }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <select
                className={`w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                value={value || ""}
                onChange={(e) => setValue(e.target.value)}
                disabled={disabled}
            >
                <option value="">Select {label}</option>
                {options?.map((opt) => (
                    <option key={opt[idKey]} value={opt[idKey]}>
                        {opt[labelKey]}
                    </option>
                ))}
            </select>
        </div>
    );
}