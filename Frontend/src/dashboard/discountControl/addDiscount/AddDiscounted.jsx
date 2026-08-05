import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Percent, Hash, Check } from "lucide-react";
import addDiscountedApi from "@/services/dashboard/discounted/addDiscountedApi";

function AddDiscounted() {
    const navigate = useNavigate();
    const [groupId, setGroupId] = useState("");

    const { mutate, isPending } = useMutation({
        mutationFn: (groupId) => {
            return addDiscountedApi(groupId);
        },
        onSuccess: () => {
            window.showToast("Added new discounted group successfully!", "success");
            setTimeout(() => {
                navigate(-1);
            }, 1000);
        },
        onError: (error) => {
            console.log("Error adding new discounted:", error);
            window.showToast("Error adding discounted group", "error");
        }
    });

    const handleAddDiscounted = () => {
        if (!groupId.trim()) {
            window.showToast("Please enter a group ID", "error");
            return;
        }
        mutate(groupId);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-4xl mx-auto">
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
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center">
                            <Percent className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Add Discounted Group
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        Add a product group to the discounted section
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Group ID Field */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                        <label className="flex items-center gap-2 text-lg font-semibold text-gray-300 mb-3">
                            <Hash className="w-5 h-5" />
                            Group ID *
                        </label>
                        <input
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value)}
                            type="text"
                            className="w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                            placeholder="Enter product group ID"
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            Enter the ID of the product group you want to add to discounted section
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/50 rounded-2xl p-6">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-400 text-lg">ℹ</span>
                            </div>
                            <div>
                                <h3 className="text-blue-300 font-semibold mb-1">About Discounted Groups</h3>
                                <p className="text-blue-200/70 text-sm">
                                    Adding a group ID will display all products in that group under the discounted section. 
                                    Make sure the group ID is valid and contains active products.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={handleAddDiscounted}
                            disabled={isPending || !groupId.trim()}
                            className="flex-1 h-14 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Add Discounted Group
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            disabled={isPending}
                            className="sm:w-32 h-14 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddDiscounted;