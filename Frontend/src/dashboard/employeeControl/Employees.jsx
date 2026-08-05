import { useNavigate } from "react-router-dom";
import { Flame, Settings, ArrowLeft } from "lucide-react";

function Employees() {
    const navigate = useNavigate();

    const cards = [
        {
            path: "add-employee",
            title: "Add Employee",
            icon: Flame,
            description: "Add new employees to the system",
            color: "from-orange-600 to-red-700"
        },
        {
            path: "manage-employees",
            title: "Manage Employees",
            icon: Settings,
            description: "View and manage existing employees",
            color: "from-red-600 to-pink-700"
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
                    <div className="flex items-center gap-3 mb-4">
                        <Flame className="w-12 h-12 text-orange-500 animate-pulse" />
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                            Employee Management
                        </h1>
                    </div>
                    <p className="text-gray-400 text-lg">
                        Manage your employee records and information
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
                                
                                {/* Animated fire effect on hover */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent"></div>
                                </div>
                                
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

export default Employees;