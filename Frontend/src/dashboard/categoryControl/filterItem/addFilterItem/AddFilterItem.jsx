import addFilterItemApi from "@/services/dashboard/category/addFilterItemApi";
import getAllFiltersApi from "@/services/dashboard/category/getAllFiltersApi";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, FolderTree, Filter, CheckCircle, AlertCircle } from "lucide-react";

function AddFilterItem() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState("");
    const [subcategoryId, setSubCategoryId] = useState("");
    const [title, setTitle] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const { data: subCategoriesData, isLoading: loadingSubCategories } = useQuery({
        queryKey: ['sub-categories'],
        queryFn: getAllSubCategoriesApi,
        staleTime: 2 * 60 * 1000,
    });

    const { data: filterData, isLoading: loadingFilters } = useQuery({
        queryKey: ['filters'],
        queryFn: getAllFiltersApi,
        staleTime: 2 * 60 * 1000,
    });

    const filterList = filterData?.data?.filter(f => f.subCategoryId === subcategoryId) ?? [];

    const { mutate, isPending } = useMutation({
        mutationFn: addFilterItemApi,
        onSuccess: () => {
            setSuccessMsg("Filter item added successfully!");
            setTitle("");
            setFilter("");
            setSubCategoryId("");
            setTimeout(() => setSuccessMsg(""), 3000);
        },
        onError: (error) => {
            setErrorMsg(error?.message || "Failed to add filter item. Please try again.");
            setTimeout(() => setErrorMsg(""), 4000);
        },
    });

    const handleSubCategoryChange = (e) => {
        setSubCategoryId(e.target.value);
        setFilter("");
    };

    const handleAddFilterItem = () => {
        if (!title.trim() || !filter || !subcategoryId) return;
        mutate({ title: title.trim(), filterId: filter, subCategoryId: subcategoryId });
    };

    const isFormValid = title.trim() && filter && subcategoryId;

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-4xl mx-auto">

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
                        Add Filter Item
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Create a new filter item for your filters
                    </p>
                </div>

                {/* Toast Notifications */}
                {successMsg && (
                    <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 mb-6">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">{successMsg}</span>
                    </div>
                )}
                {errorMsg && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">{errorMsg}</span>
                    </div>
                )}

                {/* Form */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 lg:p-10 space-y-8">

                    {/* Sub-category */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-lg font-semibold text-white">
                            <FolderTree className="w-5 h-5 text-purple-400" />
                            Sub-category
                        </label>
                        <select
                            value={subcategoryId}
                            onChange={handleSubCategoryChange}
                            disabled={loadingSubCategories}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 disabled:opacity-50"
                        >
                            <option value="" disabled>
                                {loadingSubCategories ? "Loading..." : "Pick a sub-category"}
                            </option>
                            {subCategoriesData?.data?.map((cat) => (
                                <option key={cat.subCategoryId} value={cat.subCategoryId}>
                                    {cat.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-lg font-semibold text-white">
                            <Filter className="w-5 h-5 text-green-400" />
                            Filter
                        </label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            disabled={!subcategoryId || loadingFilters}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        >
                            <option value="" disabled>
                                {!subcategoryId
                                    ? "Select a sub-category first"
                                    : loadingFilters
                                    ? "Loading..."
                                    : "Pick a filter"}
                            </option>
                            {filterList.map((f) => (
                                <option key={f.filterId} value={f.filterId}>
                                    {f.title}
                                </option>
                            ))}
                        </select>
                        {subcategoryId && !loadingFilters && filterList.length === 0 && (
                            <p className="text-sm text-yellow-400">
                                No filters available for this sub-category
                            </p>
                        )}
                    </div>

                    {/* Title */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-lg font-semibold text-white">
                            <Plus className="w-5 h-5 text-blue-400" />
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter filter item title"
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={handleAddFilterItem}
                            disabled={isPending || !isFormValid}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        >
                            {isPending ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Adding...
                                </>
                            ) : (
                                "Add Filter Item"
                            )}
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="sm:w-auto px-6 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddFilterItem;