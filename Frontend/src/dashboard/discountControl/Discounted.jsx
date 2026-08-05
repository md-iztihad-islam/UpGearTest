import { useNavigate } from "react-router-dom";
import { Plus, Percent, ArrowLeft } from "lucide-react";

function Discounted() {
    const navigate = useNavigate();

    const cards = [
        {
            path: "add-discounted",
            title: "Add Discounted",
            icon: Plus,
            description: "Add product group to discounted section",
            color: "from-orange-600 to-orange-700"
        },
        {
            path: "discounted",
            title: "Manage Discounted",
            icon: Percent,
            description: "View and manage discounted products",
            color: "from-red-600 to-red-700"
        }
    ];

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
                        Discounted Control
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Manage your discounted product groups
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.path}
                                onClick={() => navigate(card.path)}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-gray-600 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
                            >
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                
                                {/* Content */}
                                <div className="relative p-8 flex flex-col items-center text-center space-y-4">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    
                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors duration-300">
                                        {card.title}
                                    </h3>
                                    
                                    {/* Description */}
                                    <p className="text-gray-400 text-sm">
                                        {card.description}
                                    </p>

                                    {/* Arrow indicator */}
                                    <div className="absolute bottom-4 right-4 text-gray-600 group-hover:text-orange-400 transition-all duration-300 group-hover:translate-x-1">
                                        →
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Discounted;