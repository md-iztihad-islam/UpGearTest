import addNewArraivals from "@/services/dashboard/newArraivals/addNewArraivals";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Package, Loader2 } from "lucide-react";

function AddNewArrivals() {
    const navigate = useNavigate();
    const [groupId, setGroupId] = useState("");

    const { mutate, isPending } = useMutation({
        mutationFn: (groupId) => {
            return addNewArraivals(groupId);
        },
        onSuccess: () => {
            window.showToast("Added to new arrivals successfully!", "success");
            setGroupId("");
        },
        onError: (error) => {
            console.log("Error adding to new arrivals:", error);
            window.showToast("Error adding to new arrivals", "error");
        }
    });

    const handleAddNewArrivals = () => {
        if (!groupId.trim()) {
            window.showToast("Please enter a Group ID", "error");
            return;
        }
        mutate(groupId);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isPending) {
            handleAddNewArrivals();
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
                    
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        Add to New Arrivals
                    </h1>
                    <p className="text-gray-400">Add products by Group ID to showcase as new arrivals</p>
                </div>

                {/* Form Container */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                    {/* Info Box */}
                    <div className="mb-8 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-start gap-3">
                        <Package className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-300">
                            <p className="font-semibold text-emerald-400 mb-1">How it works</p>
                            <p>Enter the Group ID of the product you want to feature as a new arrival. All products with this Group ID will be displayed in the New Arrivals section.</p>
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Product Group ID
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value)}
                                onKeyPress={handleKeyPress}
                                type="text"
                                placeholder="Enter Group ID (e.g., kbg004)"
                                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition"
                            />
                            <p className="text-xs text-gray-400">
                                Tip: You can find the Group ID in the product details
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleAddNewArrivals}
                                disabled={isPending || !groupId.trim()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Add to New Arrivals
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

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Tips:</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>Make sure the Group ID exists in your product database</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>Products will appear immediately in the New Arrivals section</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>You can remove products later from the Manage section</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddNewArrivals;