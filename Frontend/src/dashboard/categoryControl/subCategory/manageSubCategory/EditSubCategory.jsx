import getSubcategioryByIdApi from "@/services/dashboard/category/getSubcategoryByIdApi";
import updateSubCategoryApi from "@/services/dashboard/category/updateSubCategoryApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Plus } from "lucide-react";

function EditSubCategory() {
    const { subcategoryId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["sub-category", subcategoryId],
        queryFn: () => getSubcategioryByIdApi(subcategoryId),
    });

    useEffect(() => {
        if (data) {
            setTitle(data.data.title);
            setSlug(data.data.slug);
            setMetaTitle(data.data.metaTitle);
            setMetaDescription(data.data.metaDescription);
        }
    }, [data]);

    const { mutate, isPending } = useMutation({
        mutationFn: ({ subcategoryId, subcategoryData }) => {
            return updateSubCategoryApi(subcategoryId, subcategoryData);
        },
        onSuccess: () => {
            window.showToast("Sub-category updated successfully", "success");
            setTitle("");
            navigate(-1);
        },
        onError: () => {
            window.showToast("Error updating sub-category", "error");
        }
    });

    const handleUpdateSubCategory = () => {
        if (!title) {
            return;
        }
        const subcategoryData = {
            title,
            slug,
            metaTitle,
            metaDescription
        };
        mutate({ subcategoryId, subcategoryData });
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-4xl mx-auto">
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
                        Update Sub-category
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Edit sub-category details
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 lg:p-10 space-y-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Title Input */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <Save className="w-5 h-5 text-blue-400" />
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter sub-category title"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <Plus className="w-5 h-5 text-blue-400" />
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="Enter sub-category slug"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <Plus className="w-5 h-5 text-blue-400" />
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    placeholder="Enter sub-category meta title"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-lg font-semibold text-white">
                                    <Plus className="w-5 h-5 text-blue-400" />
                                    Meta Description
                                </label>
                                <input
                                    type="text"
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    placeholder="Enter sub-category meta description"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button
                                    onClick={handleUpdateSubCategory}
                                    disabled={isPending || !title}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                                >
                                    {isPending ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : (
                                        "Update Sub-category"
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate(-1)}
                                    className="sm:w-auto px-6 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditSubCategory;