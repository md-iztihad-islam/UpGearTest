import deleteCategoryApi from "@/services/dashboard/category/deleteCategoryApi";
import getAllCategories from "@/services/dashboard/category/getAllCategories";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, Trash2, Edit2, FolderTree } from "lucide-react";

function ManageCategory() {
    const navigate = useNavigate();

    const { data: categoryData, isLoading, refetch } = useQuery({
        queryKey: ['categoryData'],
        queryFn: () => getAllCategories(),
    });

    const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
        mutationFn: (categoryId) => {
            console.log("Deleting category:", categoryId);
            return deleteCategoryApi(categoryId);
        },
        onSuccess: () => {
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Category deleted successfully", "success");
            }
            refetch();
        },
        onError: (error) => {
            console.log("Error deleting category:", error);
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Error deleting category", "error");
            }
        }
    });

    const handleDeleteCategory = (categoryId, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
            deleteMutate(categoryId);
        }
    };

    const handleEditCategory = (categoryId, e) => {
        e.stopPropagation();
        navigate(`edit-category/${categoryId}`);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                        Manage Categories
                    </h1>
                    <p className="text-gray-400 text-lg">
                        View and manage all product categories
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && (!categoryData?.data || categoryData.data.length === 0) && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
                        <FolderTree className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-300 mb-2">No Categories</h3>
                        <p className="text-gray-500">Add a category to get started.</p>
                    </div>
                )}

                {/* Categories List */}
                {!isLoading && categoryData?.data && categoryData.data.length > 0 && (
                    <div className="space-y-4">
                        {categoryData.data.map((cat, idx) => (
                            <div
                                key={cat.categoryId}
                                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-4 sm:p-6 hover:border-purple-600/50 transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* Index & Title */}
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FolderTree className="w-5 h-5 text-purple-500" />
                                                <h3 className="text-xl font-bold text-white truncate">
                                                    {cat.title}
                                                </h3>
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                ID: {cat.categoryId}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                        {/* Edit Button */}
                                        <button
                                            onClick={(e) => handleEditCategory(cat.categoryId, e)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium flex-1 sm:flex-initial justify-center"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => handleDeleteCategory(cat.categoryId, e)}
                                            disabled={isDeletePending}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:scale-100 text-sm font-medium flex-1 sm:flex-initial justify-center"
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
                {!isLoading && categoryData?.data && categoryData.data.length > 0 && (
                    <div className="mt-6 text-center text-gray-400 text-sm">
                        Total: {categoryData.data.length} categor{categoryData.data.length !== 1 ? 'ies' : 'y'}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageCategory;