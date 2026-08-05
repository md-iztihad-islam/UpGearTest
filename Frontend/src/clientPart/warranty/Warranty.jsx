import getAllWarrentiesApi from "@/services/dashboard/warrenty/getAllWarrantiesApi";
import { useQuery } from "@tanstack/react-query";
import { Shield, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductLoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Loading warranties...</p>
        </div>
    </div>
);

function Warranty() {
    const navigate = useNavigate();

    const { data: warrantyData, isLoading } = useQuery({
        queryKey: ["warranties"],
        queryFn: () => getAllWarrentiesApi(),
    });

    const warranties = warrantyData?.data || [];

    // Strip HTML tags from description
    const stripHtml = (html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    if (isLoading) {
        return <ProductLoadingState />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-2xl mb-6">
                            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                            Product Warranty Plans
                        </h1>
                        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
                            Comprehensive protection for your purchases with transparent coverage and peace of mind
                        </p>
                    </div>
                </div>
            </div>

            {/* Warranty Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24">
                {warranties.length === 0 ? (
                    <div className="text-center py-16 sm:py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full mb-6">
                            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-gray-300 mb-2">
                            No Warranty Plans Available
                        </h3>
                        <p className="text-gray-500">
                            Check back soon for updated warranty options.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Stats Bar */}
                        <div className="mb-8 sm:mb-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                    <span className="text-sm sm:text-base text-gray-300">
                                        <span className="font-bold text-white">{warranties.length}</span> Active Warranty Plans
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                    <span className="text-sm sm:text-base text-gray-400">
                                        Extended Coverage Available
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Warranty Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {warranties.map((warranty, index) => (
                                <div
                                    key={warranty._id || index}
                                    onClick={() => navigate(`/warranty/${warranty._id}`)}
                                    className="group bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl p-6 sm:p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                                {warranty.title || "Standard Warranty"}
                                            </h3>
                                        </div>
                                        <div className="flex-shrink-0 ml-4">
                                            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                                        </div>
                                    </div>

                                    {/* Period Badge */}
                                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                                        <Clock className="w-4 h-4" />
                                        {warranty.warrentyPeriod || "N/A"}
                                    </div>

                                    {/* Description */}
                                    {warranty.description && (
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                                            {stripHtml(warranty.description).length > 120
                                                ? `${stripHtml(warranty.description).substring(0, 120)}...`
                                                : stripHtml(warranty.description)
                                            }
                                        </p>
                                    )}

                                    {/* Footer */}
                                    <div className="pt-6 border-t border-gray-700/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                                Full Coverage
                                            </span>
                                            <span className="text-xs sm:text-sm font-medium text-gray-400">
                                                Plan #{index + 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Footer Info */}
                <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
                    <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-gray-700/50 max-w-3xl mx-auto">
                        <h4 className="text-lg sm:text-xl font-semibold text-white mb-4">
                            Need More Information?
                        </h4>
                        <p className="text-sm sm:text-base text-gray-400 mb-3">
                            For detailed terms and conditions, please contact our customer support team.
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                            All warranties are subject to the terms outlined in the official documentation and may vary by product category.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Warranty;