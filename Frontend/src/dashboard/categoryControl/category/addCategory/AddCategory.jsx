import addcategoryApi from "@/services/dashboard/category/addCategoryApi";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FolderTree, Loader2, CheckCircle, AlertCircle } from "lucide-react";

function AddCategory() {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");

    useEffect(() => {
        setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }, [title]);

    const { mutate, isPending, isSuccess, isError } = useMutation({
        mutationFn: (newCategory) => {
            console.log("Adding category:", newCategory);
            return addcategoryApi(newCategory);
        },
        onSuccess: () => {
            console.log("Category added successfully");
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Category added successfully", "success");
            }
            setTitle("");
            setSlug("");
            setMetaTitle("");
            setMetaDescription("");
        },
        onError: (error) => {
            console.log("Error adding category:", error);
            if (typeof window !== 'undefined' && window.showToast) {
                window.showToast("Error adding category", "error");
            }
        },
    });

    const handleAddCategory = (e) => {
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
        mutate(categoryData);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Add Category
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Create a new product category
                    </p>
                </div>

                {/* Success/Error Messages */}
                {isSuccess && (
                    <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-green-400">Category added successfully!</p>
                    </div>
                )}

                {isError && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-red-400">Failed to add category. Please try again.</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleAddCategory} className="space-y-6">
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
                                    <FolderTree className="w-5 h-5" />
                                    Add Category
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCategory;