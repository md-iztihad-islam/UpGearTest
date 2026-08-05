import deleteSubCategoryApi from "@/services/dashboard/category/deleteSubCategoryApi";
import getAllCategories from "@/services/dashboard/category/getAllCategories";
import getSubCategoryByCategoryApi from "@/services/dashboard/category/getSubCategoryByCategoryApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, FolderTree, Loader2 } from "lucide-react";

function ManageSubCategory() {
    const navigate = useNavigate();
    const [categoryId, setCategoryId] = useState(null);

    // console.log("Selected categoryId:", categoryId);

    const { data: categoryData } = useQuery({
        queryKey: ['categoryData'],
        queryFn: () => getAllCategories(),
    });

    const { data: subcategories, isLoading: isLoadingSubcategories } = useQuery({
        queryKey: ['subcategoryData', categoryId],
        queryFn: () => getSubCategoryByCategoryApi(categoryId),
        enabled: !!categoryId,
    });

    console.log("Fetched subcategories:", subcategories);

    const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
        mutationFn: (subcategoryId) => {
            return deleteSubCategoryApi(subcategoryId);
        },
        onSuccess: () => {
            window.showToast("Sub-Category deleted successfully", "success");
        },
        onError: () => {
            window.showToast("Error deleting sub-category", "error");
        }
    });

    const handleDeleteSubCategory = (subcategoryId) => {
        if (window.confirm("Are you sure you want to delete this sub-category?")) {
            deleteMutate(subcategoryId);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Manage Sub-categories
                    </h1>
                    <p className="text-gray-400 text-lg">
                        View, edit, and organize your sub-categories
                    </p>
                </div>

                {/* Category Filter */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 mb-8">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-lg font-semibold text-white">
                            <FolderTree className="w-5 h-5 text-purple-400" />
                            Filter by Category
                        </label>
                        <select
                            value={categoryId || ""}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                        >
                            <option value="">Pick a category</option>
                            {categoryData?.data.map((cat, idx) => (
                                <option key={idx} value={cat.categoryId} className="bg-gray-800 text-white">
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sub-categories List */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    {/* List Header */}
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                            All Sub-categories
                        </h2>
                    </div>

                    {/* List Content */}
                    <div className="divide-y divide-gray-700">
                        {!categoryId ? (
                            <div className="px-6 py-12 text-center">
                                <FolderTree className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-400">
                                    Please select a category to view sub-categories
                                </p>
                            </div>
                        ) : isLoadingSubcategories ? (
                            <div className="px-6 py-12 text-center">
                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                                <p className="text-gray-400">Loading sub-categories...</p>
                            </div>
                        ) : subcategories?.data?.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-gray-400">
                                    No sub-categories found for this category
                                </p>
                            </div>
                        ) : (
                            subcategories?.data?.map((cat, idx) => (
                                <div
                                    key={cat.categoryId}
                                    className="px-6 py-4 hover:bg-gray-800/50 transition-colors duration-200"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Sub-category Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-semibold">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    {cat.title}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 sm:flex-shrink-0">
                                            <button
                                                onClick={() => navigate(`edit-sub-category/${cat.subCategoryId}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSubCategory(cat.subCategoryId)}
                                                disabled={isDeletePending}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 font-medium"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">
                                                    {isDeletePending ? "Deleting..." : "Delete"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManageSubCategory;