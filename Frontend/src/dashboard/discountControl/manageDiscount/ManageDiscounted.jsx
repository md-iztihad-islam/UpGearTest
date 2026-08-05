import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Percent, Package, Trash2, AlertCircle } from "lucide-react";
import deleteDiscountedApi from "@/services/dashboard/discounted/deleteDiscountedApi";
import getAllDiscountedApi from "@/services/dashboard/discounted/getAllDiscountedApi";

function ManageDiscounted() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: discountedData, isLoading } = useQuery({
        queryKey: ['discountedData'],
        queryFn: () => getAllDiscountedApi(),
    });

    const { mutate: deleteMutate, isPending: isDeletePending, variables: deletingId } = useMutation({
        mutationFn: (discountedId) => {
            return deleteDiscountedApi(discountedId);
        },
        onSuccess: () => {
            window.showToast("Discounted group deleted successfully", "success");
            queryClient.invalidateQueries(['discountedData']);
        },
        onError: (error) => {
            console.log("Error deleting discounted:", error);
            window.showToast("Error deleting discounted group", "error");
        }
    });

    const handleDeleteDiscounted = (discountedId) => {
        if (window.confirm("Are you sure you want to delete this discounted group? This action cannot be undone.")) {
            deleteMutate(discountedId);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading discounted groups...</p>
                </div>
            </div>
        );
    }

    const discountedGroups = discountedData?.data || [];

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Manage Discounted
                    </h1>
                    <p className="text-gray-400 text-lg">
                        View and manage all discounted product groups
                    </p>
                </div>

                {/* Content */}
                {discountedGroups.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
                        <Percent className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No discounted groups found</h3>
                        <p className="text-gray-500 mb-6">Add your first discounted product group to get started</p>
                        <button
                            onClick={() => navigate('../add-discounted')}
                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50"
                        >
                            Add Discounted Group
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {discountedGroups.map((group, idx) => (
                            <div
                                key={group._id}
                                className="group bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-gray-600 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
                            >
                                {/* Group Header */}
                                <div className="p-6 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center flex-shrink-0">
                                            <span className="text-white font-bold">{idx + 1}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">
                                                Discounted Group #{idx + 1}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Package className="w-4 h-4" />
                                                <span>{group.products?.length || 0} Products</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => handleDeleteDiscounted(group._id)}
                                        disabled={isDeletePending && deletingId === group._id}
                                        className="w-full sm:w-auto px-6 h-11 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/50"
                                    >
                                        {isDeletePending && deletingId === group._id ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete Group</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Products List */}
                                <div className="p-6">
                                    {group.products && group.products.length > 0 ? (
                                        <div className="space-y-3">
                                            {group.products.map((product, pIdx) => (
                                                <div
                                                    key={product._id}
                                                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all duration-200"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white text-sm font-bold">{pIdx + 1}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-white font-semibold mb-1 truncate">
                                                                {product.title}
                                                            </h4>
                                                            {product.subTitle && (
                                                                <p className="text-gray-400 text-sm truncate">
                                                                    {product.subTitle}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-yellow-300 font-semibold mb-1">No Products</h4>
                                                <p className="text-yellow-200/70 text-sm">
                                                    This group doesn't contain any products yet
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageDiscounted;