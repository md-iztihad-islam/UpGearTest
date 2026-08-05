import getAllCategories from "@/services/dashboard/category/getAllCategories";
import getSpecificationBySubCategoryApi from "@/services/dashboard/category/getSpecificationBySubCategoryApi";
import getSubCategoryByCategoryApi from "@/services/dashboard/category/getSubCategoryByCategoryApi";
import deleteSpecificationApi from "@/services/dashboard/specification/deleteSpecificationApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Trash2, Edit2, FileText, FolderTree, Layers, X, Save } from "lucide-react";
import updateSpecificationApi from "@/services/dashboard/specification/updateSpecificationApi";

function ManageSpecification() {
    const navigate = useNavigate();

    const [categoryId, setCategoryId] = useState(null);
    const [subcategoryId, setSubcategoryId] = useState(null);

    // Modal state
    const [editingSpec, setEditingSpec] = useState(null); // { _id, title }
    const [editTitle, setEditTitle] = useState("");

    const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
        queryKey: ['categoryData'],
        queryFn: () => getAllCategories(),
    });

    const { mutate: updateMutate, isPending: isUpdatePending } = useMutation({
        mutationFn: ({ specificationId, specificationData }) => {
            return updateSpecificationApi(specificationId, specificationData);
        },
        onSuccess: () => {
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Specification updated successfully", "success");
            }
            setEditingSpec(null);
            refetch();
        },
        onError: () => {
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Error updating Specification", "error");
            }
        },
    });

    const { data: subcategories, isLoading: isSubcategoryLoading } = useQuery({
        queryKey: ['subcategoryData', categoryId],
        queryFn: () => getSubCategoryByCategoryApi(categoryId),
        enabled: !!categoryId,
    });

    const { data: specificationData, isLoading: isSpecificationLoading, refetch } = useQuery({
        queryKey: ['specificationData', subcategoryId],
        queryFn: () => getSpecificationBySubCategoryApi(subcategoryId),
        enabled: !!subcategoryId,
    });

    const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
        mutationFn: (specificationId) => {
            return deleteSpecificationApi(specificationId);
        },
        onSuccess: () => {
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Specification deleted successfully", "success");
            }
            refetch();
        },
        onError: () => {
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Error deleting Specification", "error");
            }
        }
    });

    const handleDeleteSpecification = (specificationId, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this specification? This action cannot be undone.")) {
            deleteMutate(specificationId);
        }
    };

    const handleOpenEditModal = (spec, e) => {
        e.stopPropagation();
        setEditingSpec(spec);
        setEditTitle(spec.title);
    };

    const handleCloseModal = () => {
        setEditingSpec(null);
        setEditTitle("");
    };

    const handleSaveTitle = () => {
        if (!editTitle.trim()) {
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Title cannot be empty", "error");
            }
            return;
        }
        updateMutate({
            specificationId: editingSpec.specificationId,
            specificationData: { title: editTitle.trim() },
        });
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                        Manage Specifications
                    </h1>
                    <p className="text-gray-400 text-lg">
                        View and manage product specifications
                    </p>
                </div>

                {/* Filter Section */}
                <div className="space-y-6 mb-8">
                    {/* Category Select */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                        <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                            <FolderTree className="w-5 h-5 text-blue-500" />
                            Select Category
                        </label>
                        <select
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setSubcategoryId(null);
                            }}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            disabled={isCategoryLoading}
                        >
                            <option value="">Pick a category</option>
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
                            Select Sub-category
                        </label>
                        <select
                            onChange={(e) => setSubcategoryId(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!categoryId || isSubcategoryLoading}
                        >
                            <option value="">
                                {categoryId ? "Pick a sub-category" : "Select category first"}
                            </option>
                            {subcategories?.data?.map((cat) => (
                                <option key={cat.subCategoryId} value={cat.subCategoryId}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                        {!categoryId && (
                            <p className="text-xs text-gray-500 mt-2">
                                Please select a category first
                            </p>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {isSpecificationLoading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                    </div>
                )}

                {/* Prompt State */}
                {!subcategoryId && !isSpecificationLoading && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-300 mb-2">Select Filters</h3>
                        <p className="text-gray-500">
                            Please select a category and sub-category to view specifications
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {subcategoryId && !isSpecificationLoading && (!specificationData?.data || specificationData.data.length === 0) && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-300 mb-2">No Specifications</h3>
                        <p className="text-gray-500">
                            No specifications found for this sub-category
                        </p>
                    </div>
                )}

                {/* Specifications List */}
                {!isSpecificationLoading && specificationData?.data && specificationData.data.length > 0 && (
                    <div className="space-y-4">
                        {specificationData.data.map((spc, idx) => (
                            <div
                                key={spc.specificationId}
                                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-6 hover:border-purple-600/50 transition-all duration-300"
                            >
                                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                                    {/* Index & Title */}
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="w-5 h-5 text-purple-500" />
                                                <h3 className="text-xl font-bold text-white truncate">
                                                    {spc.title}
                                                </h3>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <FolderTree className="w-3 h-3" />
                                                    <span>Category: {spc.category?.title || "N/A"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Layers className="w-3 h-3" />
                                                    <span>Sub-category: {spc.subCategory?.title || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                        {/* Edit Button */}
                                        <button
                                            onClick={(e) => handleOpenEditModal(spc, e)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium flex-1 lg:flex-initial justify-center"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDeleteSpecification(spc.specificationId, e)}
                                            disabled={isDeletePending}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 text-sm font-medium flex-1 lg:flex-initial justify-center"
                                        >
                                            {isDeletePending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results Count */}
                {specificationData?.data && specificationData.data.length > 0 && (
                    <div className="mt-6 text-center text-gray-400 text-sm">
                        Total: {specificationData.data.length} specification{specificationData.data.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingSpec && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    />

                    {/* Modal */}
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                    <Edit2 className="w-4 h-4 text-blue-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Edit Specification</h2>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Specification Title
                            </label>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                                autoFocus
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="Enter specification title..."
                            />
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTitle}
                                disabled={isUpdatePending || !editTitle.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                            >
                                {isUpdatePending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isUpdatePending ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageSpecification;