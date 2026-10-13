import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Filter, Layers, Loader2, Trash2 } from "lucide-react";

import EditTitleModal from "@/components/dashboard/EditTitleModal";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";
import getFiltersBySubCategoryApi from "@/services/dashboard/category/getFiltersBySubCategoryApi";
import updateFilterApi from "@/services/dashboard/category/updateFilterApi";
import deleteFilterApi from "@/services/dashboard/category/deleteFilterApi";

function ManageFilter() {
    const navigate = useNavigate();
    const [subCategoryId, setSubCategoryId] = useState("");
    const [editingFilter, setEditingFilter] = useState(null);

    const { data: subCategoriesData, isLoading: isLoadingSubCategories } = useQuery({
        queryKey: ["sub-categories"],
        queryFn: getAllSubCategoriesApi,
    });

    const { data: filterData, isLoading: isLoadingFilters, refetch } = useQuery({
        queryKey: ["filters", subCategoryId],
        queryFn: () => getFiltersBySubCategoryApi(subCategoryId),
        enabled: !!subCategoryId,
    });

    const filters = filterData?.data || [];

    const { mutate: updateFilter, isPending: isUpdating } = useMutation({
        mutationFn: ({ filterId, title }) => updateFilterApi(filterId, { title }),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Filter updated successfully", "success");
                setEditingFilter(null);
                refetch();
            } else {
                window.showToast("Error updating filter", "error");
            }
        },
    });

    const { mutate: deleteFilter, isPending: isDeleting, variables: deletingFilterId } = useMutation({
        mutationFn: (filterId) => deleteFilterApi(filterId),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Filter deleted successfully", "success");
                refetch();
            } else {
                window.showToast("Error deleting filter", "error");
            }
        },
    });

    const handleDelete = (filter) => {
        if (window.confirm(`Delete the "${filter.title}" filter? All of its filter items will be deleted and removed from products. This cannot be undone.`)) {
            deleteFilter(filter.filterId);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Manage Filters
                    </h1>
                    <p className="text-gray-400 text-lg">Rename or delete the filters of a sub-category</p>
                </div>

                {/* Sub-category select */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
                    <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                        <Layers className="w-5 h-5 text-purple-500" />
                        Select Sub-category
                    </label>
                    <select
                        value={subCategoryId}
                        onChange={(e) => setSubCategoryId(e.target.value)}
                        disabled={isLoadingSubCategories}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50"
                    >
                        <option value="">{isLoadingSubCategories ? "Loading..." : "Pick a sub-category"}</option>
                        {subCategoriesData?.data?.map((sc) => (
                            <option key={sc.subCategoryId} value={sc.subCategoryId}>
                                {sc.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* List */}
                {!subCategoryId ? (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
                        <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Select a sub-category to view its filters</p>
                    </div>
                ) : isLoadingFilters ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                    </div>
                ) : filters.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
                        <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No filters found for this sub-category</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filters.map((filter, idx) => (
                            <div
                                key={filter.filterId}
                                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-6 hover:border-purple-600/50 transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <h3 className="text-xl font-bold text-white truncate">{filter.title}</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingFilter(filter)}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(filter)}
                                            disabled={isDeleting && deletingFilterId === filter.filterId}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 text-sm font-medium"
                                        >
                                            {isDeleting && deletingFilterId === filter.filterId ? (
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
                        <p className="mt-6 text-center text-gray-400 text-sm">
                            Total: {filters.length} filter{filters.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                )}
            </div>

            {editingFilter && (
                <EditTitleModal
                    heading="Edit Filter"
                    label="Filter Title"
                    initialTitle={editingFilter.title}
                    isSaving={isUpdating}
                    onSave={(title) => updateFilter({ filterId: editingFilter.filterId, title })}
                    onClose={() => setEditingFilter(null)}
                />
            )}
        </div>
    );
}

export default ManageFilter;
