import addHotDeals from "@/services/dashboard/hotDeals/addHotDealsApi";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, Tag, Loader2, TrendingUp } from "lucide-react";

function AddHotDeals() {
    const navigate = useNavigate();
    const [groupId, setGroupId] = useState("");

    const { mutate, isPending } = useMutation({
        mutationFn: (groupId) => {
            return addHotDeals(groupId);
        },
        onSuccess: () => {
            window.showToast("Added to hot deals successfully!", "success");
            setGroupId("");
        },
        onError: (error) => {
            console.log("Error adding hot deals:", error);
            window.showToast("Error adding to hot deals", "error");
        }
    });

    const handleAddHotDeals = () => {
        if (!groupId.trim()) {
            window.showToast("Please enter a Group ID", "error");
            return;
        }
        mutate(groupId);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isPending) {
            handleAddHotDeals();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10">
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
                            Add to Hot Deals
                        </h1>
                    </div>
                    <p className="text-gray-400">Feature products with special discounts and limited-time offers</p>
                </div>

                {/* Form Container */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                    {/* Info Box */}
                    <div className="mb-8 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/30 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-300">
                                <p className="font-semibold text-orange-400 mb-1 flex items-center gap-2">
                                    <Flame className="w-4 h-4" />
                                    Hot Deals Strategy
                                </p>
                                <p>Hot Deals are perfect for limited-time promotions, flash sales, and special discounts. Add products by Group ID to create urgency and drive sales.</p>
                            </div>
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Product Group ID
                                <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    value={groupId}
                                    onChange={(e) => setGroupId(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    type="text"
                                    placeholder="Enter Group ID (e.g., kbg004)"
                                    className="w-full p-4 pl-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition"
                                />
                                <Flame className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
                            </div>
                            <p className="text-xs text-gray-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                                Products will be featured with a "Hot Deal" badge
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleAddHotDeals}
                                disabled={isPending || !groupId.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none relative overflow-hidden group"
                            >
                                {/* Animated background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                                        <span className="relative z-10">Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <Flame className="w-5 h-5 relative z-10" />
                                        <span className="relative z-10">Add to Hot Deals</span>
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={() => setGroupId("")}
                                disabled={isPending || !groupId}
                                className="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <h3 className="text-sm font-semibold text-orange-400 mb-3 flex items-center gap-2">
                            <Flame className="w-4 h-4" />
                            Why Use Hot Deals?
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-400 text-lg">🔥</span>
                                    <div>
                                        <p className="font-semibold text-white text-sm">Increased Visibility</p>
                                        <p className="text-xs text-gray-400">Featured placement on homepage</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-400 text-lg">⚡</span>
                                    <div>
                                        <p className="font-semibold text-white text-sm">Create Urgency</p>
                                        <p className="text-xs text-gray-400">Limited-time offer appeal</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-400 text-lg">💰</span>
                                    <div>
                                        <p className="font-semibold text-white text-sm">Boost Sales</p>
                                        <p className="text-xs text-gray-400">Higher conversion rates</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                                <div className="flex items-start gap-2">
                                    <span className="text-orange-400 text-lg">🎯</span>
                                    <div>
                                        <p className="font-semibold text-white text-sm">Customer Focus</p>
                                        <p className="text-xs text-gray-400">Draw attention to best deals</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Pro Tips:</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-0.5">•</span>
                                <span>Choose products with significant discounts for maximum impact</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-0.5">•</span>
                                <span>Rotate hot deals regularly to maintain customer interest</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-400 mt-0.5">•</span>
                                <span>Combine with other promotions for better results</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddHotDeals;