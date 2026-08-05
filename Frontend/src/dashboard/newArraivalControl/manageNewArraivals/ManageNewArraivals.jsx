import deleteNewArraivals from "@/services/dashboard/newArraivals/deleteNewArraivals";
import getAllNewArraivals from "@/services/dashboard/newArraivals/getAllNewArraivals";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Package, Loader2, AlertCircle } from "lucide-react";

function ManageNewArrivals() {
    const navigate = useNavigate();

    const { data: newArrivalsData, isLoading, error, refetch } = useQuery({
        queryKey: ['newArrivalsData'],
        queryFn: () => getAllNewArraivals(),
    });

    const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
        mutationFn: (newArrivalId) => {
            return deleteNewArraivals(newArrivalId);
        },
        onSuccess: () => {
            window.showToast("New arrival removed successfully", "success");
            refetch();
        },
        onError: (error) => {
            console.error("Error deleting new arrival:", error);
            window.showToast("Error removing new arrival", "error");
        }
    });

    const handleDeleteNewArrivals = (newArrivalId, groupName) => {
        if (window.confirm(`Are you sure you want to remove "${groupName}" from new arrivals?`)) {
            deleteMutate(newArrivalId);
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
                    
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        Manage New Arrivals
                    </h1>
                    <p className="text-gray-400">View and manage products in the new arrivals section</p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
                        <p className="text-gray-400">Loading new arrivals...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 flex items-center gap-3">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div>
                            <p className="text-red-400 font-semibold">Error loading new arrivals</p>
                            <p className="text-gray-400 text-sm mt-1">{error.message}</p>
                        </div>
                    </div>
                )}

                {/* New Arrivals List */}
                {!isLoading && !error && newArrivalsData?.data && (
                    <>
                        {newArrivalsData.data.length === 0 ? (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
                                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-10 h-10 text-gray-400" />
                                </div>
                                <p className="text-gray-400 text-lg mb-2">No new arrivals yet</p>
                                <p className="text-gray-500 text-sm mb-6">Start adding products to showcase them as new arrivals</p>
                                <button
                                    onClick={() => navigate('../add-to-new-arraivals')}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg font-semibold transition-all duration-200"
                                >
                                    Add First Arrival
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Stats */}
                                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 mb-6">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="w-4 h-4 text-emerald-400" />
                                        <span className="text-gray-400">Total Groups:</span>
                                        <span className="font-semibold text-white">{newArrivalsData.data.length}</span>
                                        <span className="text-gray-400 ml-4">Total Products:</span>
                                        <span className="font-semibold text-white">
                                            {newArrivalsData.data.reduce((sum, na) => sum + (na.products?.length || 0), 0)}
                                        </span>
                                    </div>
                                </div>

                                {/* Desktop View */}
                                <div className="hidden lg:block bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-700/50 border-b border-gray-600">
                                            <tr>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-300 w-16">#</th>
                                                <th className="p-4 text-left text-sm font-semibold text-gray-300">Products</th>
                                                <th className="p-4 text-center text-sm font-semibold text-gray-300 w-32">Count</th>
                                                <th className="p-4 text-center text-sm font-semibold text-gray-300 w-40">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {newArrivalsData.data.map((na, idx) => (
                                                <tr key={na._id} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
                                                    <td className="p-4 text-gray-400">{idx + 1}</td>
                                                    <td className="p-4">
                                                        <div className="space-y-2">
                                                            {na.products && na.products.length > 0 ? (
                                                                na.products.slice(0, 3).map((product, pIdx) => (
                                                                    <div key={product._id} className="flex items-start gap-3">
                                                                        <span className="text-emerald-400 text-xs mt-1">{pIdx + 1}.</span>
                                                                        <div>
                                                                            <p className="font-semibold text-white">{product.title}</p>
                                                                            {product.subTitle && (
                                                                                <p className="text-xs text-gray-400">{product.subTitle}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-gray-500 text-sm italic">No products found</p>
                                                            )}
                                                            {na.products && na.products.length > 3 && (
                                                                <p className="text-xs text-gray-500 pl-5">
                                                                    +{na.products.length - 3} more products
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-semibold">
                                                            {na.products?.length || 0}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button
                                                            onClick={() => handleDeleteNewArrivals(
                                                                na._id, 
                                                                na.products?.[0]?.title || 'this group'
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
                                    {newArrivalsData.data.map((na, idx) => (
                                        <div
                                            key={na._id}
                                            className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs font-semibold">
                                                        {na.products?.length || 0} products
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                {na.products && na.products.length > 0 ? (
                                                    na.products.slice(0, 3).map((product, pIdx) => (
                                                        <div key={product._id} className="flex items-start gap-2">
                                                            <span className="text-emerald-400 text-xs mt-1">{pIdx + 1}.</span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold text-white truncate">{product.title}</p>
                                                                {product.subTitle && (
                                                                    <p className="text-xs text-gray-400 truncate">{product.subTitle}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 text-sm italic">No products found</p>
                                                )}
                                                {na.products && na.products.length > 3 && (
                                                    <p className="text-xs text-gray-500 pl-5">
                                                        +{na.products.length - 3} more
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleDeleteNewArrivals(
                                                    na._id,
                                                    na.products?.[0]?.title || 'this group'
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
                                                        Remove from New Arrivals
                                                    </>
                                                )}
                                            </button>
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

export default ManageNewArrivals;