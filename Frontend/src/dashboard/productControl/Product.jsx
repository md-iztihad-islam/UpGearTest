import { useNavigate } from "react-router-dom";
import { Plus, FolderTree, ArrowLeft } from "lucide-react";

function Product() {
    const navigate = useNavigate();

    const cards = [
        {
            path: "add-product",
            title: "Add Product",
            icon: Plus,
            description: "Create new product",
            color: "from-blue-600 to-blue-700"
        },
        {
            path: "manage-product",
            title: "Manage Products",
            icon: FolderTree,
            description: "View and edit products",
            color: "from-purple-600 to-purple-700"
        },
        {
            path: "add-group",
            title: "Add Group",
            icon: Plus,
            description: "Create new product group",
            color: "from-green-600 to-green-700"
        },
        {
            path: "manage-group",
            title: "Manage Groups",
            icon: FolderTree,
            description: "View and edit product groups",
            color: "from-yellow-600 to-yellow-700"
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
                        Product Control
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Manage your product inventory
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
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-gray-600 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
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
                                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                                        {card.title}
                                    </h3>
                                    
                                    {/* Description */}
                                    <p className="text-gray-400 text-sm">
                                        {card.description}
                                    </p>

                                    {/* Arrow indicator */}
                                    <div className="absolute bottom-4 right-4 text-gray-600 group-hover:text-blue-400 transition-all duration-300 group-hover:translate-x-1">
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

export default Product;