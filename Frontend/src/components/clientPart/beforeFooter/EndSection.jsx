import { ArrowRight, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function EndSection() {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black border-t border-gray-800">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">

                {/* Main CTA Content */}
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6 sm:mb-8">
                        <Zap className="h-4 w-4 text-blue-400" />
                        <span className="text-sm sm:text-base font-semibold text-blue-400">
                            Limited Time Offers Available
                        </span>
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                        Ready to{" "}
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Upgrade
                        </span>{" "}
                        Your Tech?
                    </h2>

                    {/* Description */}
                    <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
                        Join thousands of satisfied customers worldwide and discover the latest cutting-edge technology at unbeatable prices.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                        {/* Primary Button */}
                        <button
                            onClick={() => navigate("/all-products")}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="group relative w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
                        >
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            {/* Content */}
                            <span className="relative flex items-center justify-center gap-2 text-base sm:text-lg">
                                Browse All Products
                                <ArrowRight className={`h-5 w-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                            </span>
                        </button>
                    </div>

                
                </div>
            </div>

        </section>
    );
}

export default EndSection;