import addSpecificationApi from "@/services/dashboard/category/addSpecificationApi";
import getAllCategories from "@/services/dashboard/category/getAllCategories";
import getSubCategoryByCategoryApi from "@/services/dashboard/category/getSubCategoryByCategoryApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FolderTree, Layers, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";

function AddSpecification() {
    const [category, setCategory] = useState(null);
    const [subcategory, setSubCategory] = useState(null);
    const [title, setTitle] = useState("");

    const { data: categoryData } = useQuery({
        queryKey: ['categories', category],
        queryFn: () => getAllCategories(),
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    });

    const { data: subCategoriesData } = useQuery({
        queryKey: ['sub-categories', category],
        queryFn: () => getSubCategoryByCategoryApi(category),
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
        enabled: !!category,
    });

    const { mutate, isPending, isSuccess, isError } = useMutation({
        mutationFn: (newSpecificationData) => {
            console.log("Adding Specification:", newSpecificationData);
            return addSpecificationApi(newSpecificationData);
        },
        onSuccess: () => {
            console.log("Specification added successfully");
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Specification added successfully", "success");
            }
            setTitle("");
            setCategory(null);
            setSubCategory(null);
        },
        onError: (error) => {
            console.log("Error adding Specification:", error);
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Error adding specification", "error");
            }
        },
    });

    const handleAddSpecification = (e) => {
        e.preventDefault();

        if (!category || !subcategory || !title.trim()) {
            alert("Please fill in all fields");
            return;
        }

        const specificationData = {
            subCategoryId: subcategory,
            title: title.trim(),
        };
        mutate(specificationData);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Add Specification
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Create a new product specification
                    </p>
                </div>

                {/* Success/Error Messages */}
                {isSuccess && (
                    <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-green-400">Specification added successfully!</p>
                    </div>
                )}

                {isError && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-400">Failed to add specification. Please try again.</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleAddSpecification} className="space-y-6">
                    {/* Category Select */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                        <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                            <FolderTree className="w-5 h-5 text-blue-500" />
                            Category
                        </label>
                        <select
                            value={category || ""}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setSubCategory(null); // Reset subcategory when category changes
                            }}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            required
                        >
                            <option value="" disabled>Pick a category</option>
                            {categoryData?.data?.map((cat) => (
                                <option key={cat.categoryId} value={cat.categoryId}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sub-category Select */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                        <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                            <Layers className="w-5 h-5 text-purple-500" />
                            Sub-category
                        </label>
                        <select
                            value={subcategory || ""}
                            onChange={(e) => setSubCategory(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                            disabled={!category}
                        >
                            <option value="" disabled>
                                {category ? "Pick a sub-category" : "Select category first"}
                            </option>
                            {subCategoriesData?.data?.map((cat) => (
                                <option key={cat.subCategoryId} value={cat.subCategoryId}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                        {!category && (
                            <p className="text-xs text-gray-500 mt-2">
                                Please select a category first
                            </p>
                        )}
                    </div>

                    {/* Title Input */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                        <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                            <FileText className="w-5 h-5 text-green-500" />
                            Specification Title
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                            placeholder="e.g., Processor, RAM, Storage"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 min-w-[200px]"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Adding...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Add Specification
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddSpecification;