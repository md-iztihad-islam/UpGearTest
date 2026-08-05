import getCategoryByIdApi from "@/services/dashboard/category/getCategoryByIdApi";
import updateCategoryApi from "@/services/dashboard/category/updateCategoryApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FolderTree, Loader2, CheckCircle, AlertCircle, ArrowLeft, Save } from "lucide-react";

function EditCategory() {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");

    const { data, isLoading: isFetchLoading } = useQuery({
        queryKey: ["category", categoryId],
        queryFn: () => getCategoryByIdApi(categoryId),
        onError: (error) => {
            console.log("Error fetching category data:", error);
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Error loading category data", "error");
            }
        }
    });

    useEffect(() => {
        if (data?.data) {
            setTitle(data.data.title);
            setSlug(data.data.slug);
            setMetaTitle(data.data.metaTitle);
            setMetaDescription(data.data.metaDescription);
        }
    }, [data]);

    const { mutate, isPending, isSuccess, isError } = useMutation({
        mutationFn: ({ categoryId, categoryData }) => {
            return updateCategoryApi(categoryId, categoryData);
        },
        onSuccess: () => {
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Category updated successfully", "success");
            }
            setTimeout(() => {
                navigate(-1);
            }, 1500);
        },
        onError: () => {
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Error updating category", "error");
            }
        },
    });

    const handleUpdateCategory = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Please enter a category title");
            return;
        }

        const categoryData = {
            title: title.trim(),
            slug: slug,
            metaTitle: metaTitle.trim(),
            metaDescription: metaDescription.trim()
        };
        mutate({ categoryId, categoryData });
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        Edit Category
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Update category information
                    </p>
                </div>

                {/* Loading State */}
                {isFetchLoading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    </div>
                )}

                {/* Success/Error Messages */}
                {isSuccess && (
                    <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-green-400">Category updated successfully! Redirecting...</p>
                    </div>
                )}

                {isError && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-400">Failed to update category. Please try again.</p>
                    </div>
                )}

                {/* Form */}
                {!isFetchLoading && data && (
                    <form onSubmit={handleUpdateCategory} className="space-y-6">
                        {/* Category Title */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                            <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                                <FolderTree className="w-5 h-5 text-blue-500" />
                                Category Title
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                type="text"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="e.g., Electronics, Clothing, Food"
                                required
                            />
                        </div>

                        
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                            <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                                <FolderTree className="w-5 h-5 text-blue-500" />
                                Slug
                            </label>
                            <input
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                type="text"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="e.g., Electronics, Clothing, Food"
                                required
                            />
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                            <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                                <FolderTree className="w-5 h-5 text-blue-500" />
                                Meta Title
                            </label>
                            <input
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                type="text"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                            <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                                <FolderTree className="w-5 h-5 text-blue-500" />
                                Meta Description
                            </label>
                            <input
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                type="text"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-8 py-4 bg-gray-700 text-white text-lg font-semibold rounded-xl hover:bg-gray-600 transition-all duration-300 hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 min-w-[200px]"
                            >
                                {isPending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Updating...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Save className="w-5 h-5" />
                                        Update Category
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default EditCategory;