import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Filter, Layers, List, Loader2, Trash2 } from "lucide-react";

import EditTitleModal from "@/components/dashboard/EditTitleModal";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";
import getFiltersBySubCategoryApi from "@/services/dashboard/category/getFiltersBySubCategoryApi";
import getFilterItemsBySubCategoryApi from "@/services/dashboard/category/getFilterItemsBySubCategoryApi";
import updateFilterItemApi from "@/services/dashboard/category/updateFilterItemApi";
import deleteFilterItemApi from "@/services/dashboard/category/deleteFilterItemApi";

function ManageFilterItem() {
    const navigate = useNavigate();
    const [subCategoryId, setSubCategoryId] = useState("");
    const [filterId, setFilterId] = useState("");
    const [editingItem, setEditingItem] = useState(null);

    const { data: subCategoriesData, isLoading: isLoadingSubCategories } = useQuery({
        queryKey: ["sub-categories"],
        queryFn: getAllSubCategoriesApi,
    });

    const { data: filterData, isLoading: isLoadingFilters } = useQuery({
        queryKey: ["filters", subCategoryId],
        queryFn: () => getFiltersBySubCategoryApi(subCategoryId),
        enabled: !!subCategoryId,
    });

    const { data: filterItemData, isLoading: isLoadingItems, refetch } = useQuery({
        queryKey: ["filter-items", subCategoryId],
        queryFn: () => getFilterItemsBySubCategoryApi(subCategoryId),
        enabled: !!subCategoryId,
    });

    const filters = useMemo(() => filterData?.data || [], [filterData]);

    // Items grouped under their filter; optionally narrowed to one filter.
    const groupedItems = useMemo(() => {
        const items = filterItemData?.data || [];
        return filters
            .filter((f) => !filterId || f.filterId === filterId)
            .map((f) => ({
                ...f,
                items: items
                    .filter((item) => item.filterId === f.filterId)
                    .sort((a, b) => a.title.localeCompare(b.title)),
            }));
    }, [filters, filterItemData, filterId]);

    const { mutate: updateItem, isPending: isUpdating } = useMutation({
        mutationFn: ({ filterItemId, title }) => updateFilterItemApi(filterItemId, { title }),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Filter item updated successfully", "success");
                setEditingItem(null);
                refetch();
            } else {
                window.showToast("Error updating filter item", "error");
            }
        },
    });

    const { mutate: deleteItem, isPending: isDeleting, variables: deletingItemId } = useMutation({
        mutationFn: (filterItemId) => deleteFilterItemApi(filterItemId),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Filter item deleted successfully", "success");
                refetch();
            } else {
                window.showToast("Error deleting filter item", "error");
            }
        },
    });

    const handleDelete = (item) => {
        if (window.confirm(`Delete "${item.title}"? It will be removed from every product that uses it. This cannot be undone.`)) {
            deleteItem(item.filterItemId);
        }
    };

    const isLoadingList = isLoadingFilters || isLoadingItems;

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
                        Manage Filter Items
                    </h1>
                    <p className="text-gray-400 text-lg">Rename or delete the options inside each filter</p>
                </div>

                {/* Selects */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                        <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                            <Layers className="w-5 h-5 text-purple-500" />
                            Sub-category
                        </label>
                        <select
                            value={subCategoryId}
                            onChange={(e) => {
                                setSubCategoryId(e.target.value);
                                setFilterId("");
                            }}
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

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                        <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                            <Filter className="w-5 h-5 text-green-500" />
                            Filter
                        </label>
                        <select
                            value={filterId}
                            onChange={(e) => setFilterId(e.target.value)}
                            disabled={!subCategoryId || isLoadingFilters}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">{subCategoryId ? "All filters" : "Select a sub-category first"}</option>
                            {filters.map((f) => (
                                <option key={f.filterId} value={f.filterId}>
                                    {f.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* List */}
                {!subCategoryId ? (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
                        <List className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Select a sub-category to view its filter items</p>
                    </div>
                ) : isLoadingList ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                    </div>
                ) : groupedItems.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
                        <Filter className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No filters found for this sub-category</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groupedItems.map((group) => (
                            <div
                                key={group.filterId}
                                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                                        <Filter className="w-4 h-4 text-green-400" />
                                        {group.title}
                                    </h2>
                                    <span className="text-xs text-gray-500">
                                        {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                                    </span>
                                </div>

                                {group.items.length === 0 ? (
                                    <p className="px-6 py-6 text-sm text-gray-500">No items in this filter yet.</p>
                                ) : (
                                    <div className="divide-y divide-gray-700">
                                        {group.items.map((item) => (
                                            <div
                                                key={item.filterItemId}
                                                className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-800/50 transition-colors"
                                            >
                                                <span className="text-white truncate">{item.title}</span>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => setEditingItem(item)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        disabled={isDeleting && deletingItemId === item.filterItemId}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
                                                    >
                                                        {isDeleting && deletingItemId === item.filterItemId ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingItem && (
                <EditTitleModal
                    heading="Edit Filter Item"
                    label="Filter Item Title"
                    initialTitle={editingItem.title}
                    isSaving={isUpdating}
                    onSave={(title) => updateItem({ filterItemId: editingItem.filterItemId, title })}
                    onClose={() => setEditingItem(null)}
                />
            )}
        </div>
    );
}

export default ManageFilterItem;
