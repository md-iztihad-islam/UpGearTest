import { useNavigate } from "react-router-dom";
import { FolderTree, Layers, Filter, List } from "lucide-react";

function CategoryControl() {
    const navigate = useNavigate();

    const cards = [
        {
            path: "category",
            title: "Category",
            icon: FolderTree,
            description: "Manage main categories",
            color: "from-blue-600 to-blue-700"
        },
        {
            path: "sub-category",
            title: "Sub-category",
            icon: Layers,
            description: "Manage sub-categories",
            color: "from-purple-600 to-purple-700"
        },
        {
            path: "filter",
            title: "Filter",
            icon: Filter,
            description: "Manage product filters",
            color: "from-green-600 to-green-700"
        },
        {
            path: "filter-item",
            title: "Filter Item",
            icon: List,
            description: "Manage filter items",
            color: "from-orange-600 to-orange-700"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Category Control
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Organize your product catalog
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
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

export default CategoryControl;