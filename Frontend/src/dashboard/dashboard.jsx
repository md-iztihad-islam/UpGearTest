import { useNavigate } from "react-router-dom";
import {
    Package,
    ShoppingCart,
    DollarSign,
    Tag,
    BarChart3,
    AlertCircle,
    Gift,
    Shield,
    Percent,
    Grid3X3,
    Filter,
    ListChecks,
    ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getAllProductsApi from "@/services/clientPart/allProducts/getAllProductsApi";
import getNumberOfPendingOrdersApi from "@/services/dashboard/order/getNumberOfPendingOrdersAPi";
import getActiveCouponApi from "@/services/dashboard/coupon/getActiveCouponApi";
import calculateRevenueForAcceptedOrdersApi from "@/services/dashboard/order/calculateRevenueForAcceptedOrdersApi";

function Dashboard() {
    const navigate = useNavigate();

    const dashboardSections = [
        {
            id: 1,
            title: "Product Management",
            description: "Manage products, inventory, and stock",
            icon: Package,
            color: "from-blue-600 to-blue-700",
            path: "/dashboard/productcontrol",           // ✅ fixed
            items: ["Add Products", "Manage Products", "Stock Management"]
        },
        {
            id: 2,
            title: "Order Management",
            description: "View and process customer orders",
            icon: ShoppingCart,
            color: "from-green-600 to-green-700",
            path: "/dashboard/ordercontrol",             // ✅ fixed
            items: ["Pending Orders", "Accepted Orders", "Cancelled Orders"]
        },
        {
            id: 3,
            title: "Categories",
            description: "Organize products with categories",
            icon: Grid3X3,
            color: "from-purple-600 to-purple-700",
            path: "/dashboard/categorycontrol",          // ✅ fixed
            items: ["Add Category", "Manage Categories", "Sub-Categories"]
        },
        {
            id: 4,
            title: "Filters",
            description: "Create product filtering options",
            icon: Filter,
            color: "from-pink-600 to-pink-700",
            path: "/dashboard/categorycontrol/filter",   // ✅ fixed
            items: ["Add Filter", "Manage Filters", "Filter Items"]
        },
        {
            id: 5,
            title: "Specifications",
            description: "Define product specifications",
            icon: ListChecks,
            color: "from-indigo-600 to-indigo-700",
            path: "/dashboard/specificationcontrol",     // ✅ fixed
            items: ["Add Specification", "Manage Specifications"]
        },
        {
            id: 6,
            title: "Coupons",
            description: "Create and manage discount coupons",
            icon: Tag,
            color: "from-yellow-600 to-yellow-700",
            path: "/dashboard/couponcontrol",            // ✅ fixed
            items: ["Add Coupon", "Active Coupons", "Deactivated", "Expired"]
        },
        {
            id: 7,
            title: "Hot Deals",
            description: "Feature special deals and offers",
            icon: Gift,
            color: "from-red-600 to-red-700",
            path: "/dashboard/hotdealscontrol",          // ✅ fixed
            items: ["Add Hot Deal", "Manage Hot Deals"]
        },
        {
            id: 8,
            title: "Discounted",
            description: "Manage discounted product groups",
            icon: Percent,
            color: "from-orange-600 to-orange-700",
            path: "/dashboard/discountcontrol",          // ✅ fixed
            items: ["Add Discounted Group", "Manage Discounted"]
        },
        {
            id: 9,
            title: "Warranty",
            description: "Set up warranty policies",
            icon: Shield,
            color: "from-green-600 to-green-700",
            path: "/dashboard/warrentycontrol",          // ✅ fixed
            items: ["Add Warranty", "Manage Warranties"]
        },
        {
            id: 10,
            title: "Reports & Analytics",
            description: "View sales reports and insights",
            icon: BarChart3,
            color: "from-blue-600 to-blue-700",
            path: "/dashboard/reportcontrol",            // ✅ fixed
            items: ["Sales Reports", "Profit Analysis", "Export Data"]
        }
    ];

    const { data: productData } = useQuery({
        queryKey: ["dashboard", "product-stats"],
        queryFn: () => getAllProductsApi({ page: 1, limit: 10000, sortBy: "featured" }),
        gcTime: 5 * 60 * 1000,
        staleTime: 1 * 60 * 1000,
    });
    const totalProducts = productData?.data?.totalCount || 0;

    const { data: pendingOrdersData } = useQuery({
        queryKey: ["dashboard", "pending-orders-count"],
        queryFn: () => getNumberOfPendingOrdersApi(),
    });
    const pendingOrdersCount = pendingOrdersData?.data ?? 0;

    const { data: activeCouponsData } = useQuery({
        queryKey: ["dashboard", "active-coupons-count"],
        queryFn: () => getActiveCouponApi(),
        gcTime: 5 * 60 * 1000,
        staleTime: 1 * 60 * 1000,
    });
    const activeCouponsCount = activeCouponsData?.data?.length || 0;

    const { data: revenueData } = useQuery({
        queryKey: ["dashboard", "revenue-accepted-orders"],
        queryFn: () => calculateRevenueForAcceptedOrdersApi(),
        gcTime: 5 * 60 * 1000,
        staleTime: 1 * 60 * 1000,
    });
    const totalRevenue = revenueData?.data || 0;

    const stats = [
        {
            label: "Total Products",
            value: totalProducts.toString(),
            icon: Package,
            color: "text-blue-400",
            bgColor: "bg-blue-900/20",
            borderColor: "border-blue-700"
        },
        {
            label: "Pending Orders",
            value: pendingOrdersCount.toString(),
            icon: ShoppingCart,
            color: "text-yellow-400",
            bgColor: "bg-yellow-900/20",
            borderColor: "border-yellow-700"
        },
        {
            label: "Total Revenue",
            value: "৳" + totalRevenue.toLocaleString(),
            icon: DollarSign,
            color: "text-green-400",
            bgColor: "bg-green-900/20",
            borderColor: "border-green-700"
        },
        {
            label: "Active Coupons",
            value: activeCouponsCount.toString(),
            icon: Tag,
            color: "text-purple-400",
            bgColor: "bg-purple-900/20",
            borderColor: "border-purple-700"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-10">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-400">
                        Welcome back! Manage your e-commerce platform from here.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`${stat.bgColor} border ${stat.borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:scale-105`}
                        >
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}>
                                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                                {stat.value}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-400">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Dashboard Sections */}
                <div className="mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                        Management Sections
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {dashboardSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <div
                                    key={section.id}
                                    onClick={() => navigate(section.path)}
                                    className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-gray-600 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                                    <div className="relative p-5 sm:p-6">
                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                                            {section.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-400 mb-4">
                                            {section.description}
                                        </p>
                                        <div className="space-y-1.5 sm:space-y-2">
                                            {section.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                                                    <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute bottom-4 right-4 text-gray-600 group-hover:text-blue-400 transition-all duration-300 group-hover:translate-x-1">
                                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate("/dashboard/productcontrol/add-product")}  // ✅ fixed
                            className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-blue-500"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-white">Add Product</p>
                                <p className="text-xs text-gray-400">Create new product</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate("/dashboard/ordercontrol/pending-orders")} // ✅ fixed
                            className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-green-500"
                        >
                            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                                <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-white">View Orders</p>
                                <p className="text-xs text-gray-400">Process orders</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate("/dashboard/reportcontrol")}               // ✅ fixed
                            className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-purple-500"
                        >
                            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-white">View Reports</p>
                                <p className="text-xs text-gray-400">Sales analytics</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate("/dashboard/couponcontrol/add-coupon")}    // ✅ fixed
                            className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 border border-gray-700 hover:border-yellow-500"
                        >
                            <div className="w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center flex-shrink-0">
                                <Tag className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-white">Add Coupon</p>
                                <p className="text-xs text-gray-400">Create discount</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-xl sm:rounded-2xl p-5 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-blue-300 mb-1 sm:mb-2">
                                Dashboard Overview
                            </h3>
                            <p className="text-xs sm:text-sm text-blue-200/70 leading-relaxed">
                                This dashboard provides access to all management sections of your e-commerce platform.
                                Click on any section card to navigate to specific management pages. Quick actions at the
                                bottom provide shortcuts to commonly used features.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;