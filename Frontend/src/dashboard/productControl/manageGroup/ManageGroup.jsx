import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Edit, Trash2, Loader2, Layers } from "lucide-react";
import deleteGroupByIdApi from "@/services/dashboard/group/deleteGroupByIdApi";
import getAllGroupApi from "@/services/dashboard/group/getAllGroupApi";

function ManageGroup() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all groups
    const { data: groupsData, isLoading, error, refetch } = useQuery({
        queryKey: ["groups"],
        queryFn: () => getAllGroupApi(),
    });

    const allGroups = groupsData?.data || [];
    console.log("Fetched groups:", allGroups);

    // Filter groups based on search query
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return allGroups;

        const query = searchQuery.toLowerCase();
        return allGroups.filter((group) =>
            group.groupId?.toLowerCase().includes(query) ||
            group.description?.toLowerCase().includes(query) ||
            group.productType?.toLowerCase().includes(query) ||
            group.category?.title?.toLowerCase().includes(query) ||
            group.subCategory?.title?.toLowerCase().includes(query) ||
            group.brand?.title?.toLowerCase().includes(query) ||
            group.keyFeatures?.some((kf) => kf.feature?.toLowerCase().includes(query)) ||
            group.tags?.some((t) => t.tag?.toLowerCase().includes(query))
        );
    }, [allGroups, searchQuery]);

    const { mutate: deleteGroup, isPending: isDeleting } = useMutation({
        mutationFn: (groupId) => deleteGroupByIdApi(groupId),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Group deleted successfully.", "success");
                refetch();
            } else {
                window.showToast("Failed to delete the group.", "error");
            }
        },
        onError: (error) => {
            console.error("Error deleting group:", error);
            window.showToast("An error occurred while deleting the group.", "error");
        },
    });

    const handleDelete = (groupId) => {
        if (window.confirm(`Are you sure you want to delete group "${groupId}"? This action cannot be undone.`)) {
            deleteGroup(groupId);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Manage Groups
                    </h1>
                    <p className="text-gray-400">Search and manage your product groups</p>
                </div>

                {/* Search Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by group ID, category, brand, tags..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                            />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400 whitespace-nowrap">
                            <Layers className="w-5 h-5" />
                            <span>
                                {filteredGroups.length} group{filteredGroups.length !== 1 ? "s" : ""} found
                            </span>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400">Loading groups...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
                        <p className="text-red-400">Error fetching groups: {error.message}</p>
                    </div>
                )}

                {/* Groups List */}
                {!isLoading && !error && filteredGroups.length > 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden mb-6">

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/50 border-b border-gray-600">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Group ID</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Brand</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Category</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Product Type</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Shipping</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Products</th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredGroups.map((group) => (
                                        <tr
                                            key={group.groupId}
                                            className="border-b border-gray-700 hover:bg-gray-700/30 transition"
                                        >
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-mono">
                                                    {group.groupId}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-300">
                                                {group.brand?.title || "—"}
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-300">{group.category?.title}</p>
                                                <p className="text-xs text-gray-500">{group.subCategory?.title}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    group.productType === "instock"
                                                        ? "bg-green-600/20 text-green-400"
                                                        : "bg-yellow-600/20 text-yellow-400"
                                                }`}>
                                                    {group.productType === "instock" ? "In Stock" : "Pre-Order"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs text-gray-400">
                                                    Inside: ৳{group.insideDhakaCharge}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Outside: ৳{group.outsideDhakaCharge}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-medium">
                                                    {group.products?.length ?? 0} products
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`edit-group/${group.groupId}`)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors text-sm"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(group.groupId)}
                                                        disabled={isDeleting}
                                                        className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                                                    >
                                                        {isDeleting ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden">
                            {filteredGroups.map((group) => (
                                <div
                                    key={group.groupId}
                                    className="p-6 border-b border-gray-700 last:border-b-0"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-mono mb-2">
                                                {group.groupId}
                                            </span>
                                            <p className="text-sm text-gray-400">{group.brand?.title}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            group.productType === "instock"
                                                ? "bg-green-600/20 text-green-400"
                                                : "bg-yellow-600/20 text-yellow-400"
                                        }`}>
                                            {group.productType === "instock" ? "In Stock" : "Pre-Order"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 mb-1">Category</p>
                                            <p className="text-white">{group.category?.title}</p>
                                            <p className="text-gray-400 text-xs">{group.subCategory?.title}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Shipping</p>
                                            <p className="text-gray-300 text-xs">Inside: ৳{group.insideDhakaCharge}</p>
                                            <p className="text-gray-300 text-xs">Outside: ৳{group.outsideDhakaCharge}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs font-medium">
                                            {group.products?.length ?? 0} products
                                        </span>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate(`edit-group/${group.groupId}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(group.groupId)}
                                            disabled={isDeleting}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Search Results */}
                {!isLoading && !error && filteredGroups.length === 0 && searchQuery && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-lg">No groups found for "{searchQuery}"</p>
                        <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && allGroups.length === 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-300 text-lg mb-2">No groups yet</p>
                        <p className="text-gray-500 text-sm mb-4">Start by adding your first product group</p>
                        <button
                            onClick={() => navigate("../add-group")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200"
                        >
                            Add Group
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageGroup;