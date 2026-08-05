import deleteHotdealsApi from "@/services/dashboard/hotDeals/deleteHotDealsApi";
import getAllHotDealsApi from "@/services/dashboard/hotDeals/getAllHotDealsApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Flame, Loader2, AlertCircle, TrendingUp } from "lucide-react";

function ManageHotDeals() {
    const navigate = useNavigate();

    const { data: hotDealsData, isLoading, error, refetch } = useQuery({
        queryKey: ['hotDealsData'],
        queryFn: () => getAllHotDealsApi(),
    });

    const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
        mutationFn: (hotDealsId) => {
            return deleteHotdealsApi(hotDealsId);
        },
        onSuccess: () => {
            window.showToast("Hot deal removed successfully", "success");
            refetch();
        },
        onError: (error) => {
            console.error("Error deleting hot deal:", error);
            window.showToast("Error removing hot deal", "error");
        }
    });

    const handleDeleteHotDeals = (hotDealsId, groupName) => {
        if (window.confirm(`Are you sure you want to remove "${groupName}" from hot deals?`)) {
            deleteMutate(hotDealsId);
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
                    
                    <div className="flex items-center gap-3 mb-2">
                        <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                            Manage Hot Deals
                        </h1>
                    </div>
                    <p className="text-gray-400">View and manage your featured hot deal products</p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                        <p className="text-gray-400">Loading hot deals...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div>
                            <p className="text-red-400 font-semibold">Error loading hot deals</p>
                            <p className="text-gray-400 text-sm mt-1">{error.message}</p>
                        </div>
                    </div>
                )}

                {/* Hot Deals List */}
                {!isLoading && !error && hotDealsData?.data && (
                    <>
                        {hotDealsData.data.length === 0 ? (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Flame className="w-10 h-10 text-white" />
                                </div>
                                <p className="text-gray-400 text-lg mb-2">No hot deals yet</p>
                                <p className="text-gray-500 text-sm mb-6">Start adding products to create urgency and boost sales</p>
                                <button
                                    onClick={() => navigate('../add-hot-deals')}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg font-semibold transition-all duration-200 inline-flex items-center gap-2"
                                >
                                    <Flame className="w-5 h-5" />
                                    Add First Hot Deal
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Stats */}
                                <div className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 backdrop-blur-sm rounded-lg border border-orange-500/30 p-4 mb-6">
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Flame className="w-4 h-4 text-orange-400" />
                                            <span className="text-gray-400">Active Hot Deals:</span>
                                            <span className="font-semibold text-white">{hotDealsData.data.length}</span>
                                        </div>
                                        <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-orange-400" />
                                            <span className="text-gray-400">Total Products:</span>
                                            <span className="font-semibold text-white">
                                                {hotDealsData.data.reduce((sum, hd) => sum + (hd.products?.length || 0), 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop View */}
                                <div className="hidden lg:block bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-orange-900/20 via-red-900/20 to-pink-900/20 border-b border-gray-600">
                                            <tr>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-300 w-16">#</th>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-300">Products</th>
                                                <th className="p-4 text-center text-sm font-semibold text-gray-300 w-32">Count</th>
                                                <th className="p-4 text-center text-sm font-semibold text-gray-300 w-40">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hotDealsData.data.map((hd, idx) => (
                                                <tr key={hd._id} className="border-b border-gray-700 hover:bg-gradient-to-r hover:from-orange-500/5 hover:via-red-500/5 hover:to-pink-500/5 transition">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400">{idx + 1}</span>
                                                            <Flame className="w-4 h-4 text-orange-500" />
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="space-y-2">
                                                            {hd.products && hd.products.length > 0 ? (
                                                                hd.products.slice(0, 3).map((product, pIdx) => (
                                                                    <div key={product._id} className="flex items-start gap-3">
                                                                        <span className="text-orange-400 text-xs mt-1 font-semibold">{pIdx + 1}.</span>
                                                                        <div>
                                                                            <p className="font-semibold text-white">{product.title}</p>
                                                                            {product.subTitle && (
                                                                                <p className="text-xs text-gray-400">{product.subTitle}</p>
                                                                            )}
                                                                            {product.finalPrice && (
                                                                                <p className="text-xs text-orange-400 font-semibold mt-1">
                                                                                    ${product.finalPrice}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 text-sm italic">No products found</p>
                                                            )}
                                                            {hd.products && hd.products.length > 3 && (
                                                                <p className="text-xs text-gray-500 pl-5 flex items-center gap-1">
                                                                    <Flame className="w-3 h-3 text-orange-500" />
                                                                    +{hd.products.length - 3} more hot products
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="px-3 py-1 bg-gradient-to-r from-orange-600/20 to-red-600/20 text-orange-400 rounded-full text-sm font-semibold border border-orange-500/30">
                                                            {hd.products?.length || 0}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => handleDeleteHotDeals(
                                                                hd._id,
                                                                hd.products?.[0]?.title || 'this group'
                                                            )}
                                                            disabled={isDeletePending}
                                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 mx-auto"
                                                        >
                                                            {isDeletePending ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View */}
                                <div className="lg:hidden space-y-4">
                                    {hotDealsData.data.map((hd, idx) => (
                                        <div
                                            key={hd._id}
                                            className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 relative overflow-hidden"
                                        >
                                            {/* Hot deal indicator */}
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-red-500/20 blur-2xl"></div>
                                            
                                            <div className="relative">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                                            {idx + 1}
                                                        </div>
                                                        <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                                                        <span className="px-3 py-1 bg-gradient-to-r from-orange-600/20 to-red-600/20 text-orange-400 rounded-full text-xs font-semibold border border-orange-500/30">
                                                            {hd.products?.length || 0} products
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    {hd.products && hd.products.length > 0 ? (
                                                        hd.products.slice(0, 3).map((product, pIdx) => (
                                                            <div key={product._id} className="flex items-start gap-2 bg-gray-700/30 rounded p-2">
                                                                <span className="text-orange-400 text-xs mt-1 font-semibold">{pIdx + 1}.</span>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-white truncate">{product.title}</p>
                                                                    {product.subTitle && (
                                                                        <p className="text-xs text-gray-400 truncate">{product.subTitle}</p>
                                                                    )}
                                                                    {product.finalPrice && (
                                                                        <p className="text-xs text-orange-400 font-semibold mt-1">
                                                                            ${product.finalPrice}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-gray-500 text-sm italic">No products found</p>
                                                    )}
                                                    {hd.products && hd.products.length > 3 && (
                                                        <p className="text-xs text-gray-500 pl-5 flex items-center gap-1">
                                                            <Flame className="w-3 h-3 text-orange-500" />
                                                            +{hd.products.length - 3} more
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteHotDeals(
                                                        hd._id,
                                                        hd.products?.[0]?.title || 'this group'
                                                    )}
                                                    disabled={isDeletePending}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {isDeletePending ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Removing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-4 h-4" />
                                                            Remove from Hot Deals
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ManageHotDeals;