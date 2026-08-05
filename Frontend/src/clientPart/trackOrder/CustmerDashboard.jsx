import getCustomerByIdApi from "@/services/clientPart/auth/getCustomerByIdApi";
import userStore from "@/state/clientPart/userStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    User, Phone, Mail, ShoppingBag, Package,
    ChevronRight, LogOut, Loader2, AlertCircle,
    MapPin, Calendar, Hash
} from "lucide-react";
import signoutCustomerApi from "@/services/clientPart/auth/signoutCustomerApi";

function CustomerDashboard() {
    const navigate = useNavigate();
    const { user, setUser } = userStore();
    const customerId = user?._id;

    const { data: userData, isLoading, isError } = useQuery({
        queryKey: ["customer", customerId],
        queryFn: () => getCustomerByIdApi(customerId),
        enabled: !!customerId,
    });

    const customer = userData?.customer;

    const { mutate: logout } = useMutation({
        mutationFn: () => signoutCustomerApi(customerId),
        onSuccess: () => {
            localStorage.removeItem("authToken");
            setUser(null);
            navigate("/customer/signin");
        },
        onError: (error) => {
            alert("Failed to log out. Please try again.");
        }
    })

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            logout();
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
        });
    };

    const formatCurrency = (amount) =>
        `৳${(amount || 0).toLocaleString()}`;

    // ── Loading ──────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-gray-400 text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────
    if (isError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-red-900/30 border border-red-700 rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm text-center">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <p className="text-red-400 font-semibold">Failed to load dashboard</p>
                    <p className="text-gray-500 text-sm">Please refresh or sign in again.</p>
                    <button
                        onClick={handleLogout}
                        className="mt-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-all"
                    >
                        Back to Sign In
                    </button>
                </div>
            </div>
        );
    }

    const orders = customer?.orderIds || [];
    const recentOrders = [...orders].reverse();

    // ── Dashboard ────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* ── Header ── */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            My Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Welcome back, {customer?.customerName?.split(" ")[0] || "Customer"}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 border border-gray-700 hover:border-red-500/50 hover:text-red-400 text-gray-400 rounded-xl text-sm font-semibold transition-all duration-200"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Orders</p>
                            <p className="text-white text-3xl font-bold">{customer?.numberOfOrders ?? 0}</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <Calendar className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Member Since</p>
                            <p className="text-white text-xl font-bold">{formatDate(customer?.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* ── Profile Info ── */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <User className="w-5 h-5 text-blue-500" /> Profile Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Full Name</p>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-600" />
                                <p className="text-white font-medium">{customer?.customerName || "—"}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Phone Number</p>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-600" />
                                <p className="text-white font-medium">{customer?.customerPhone || "—"}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Email Address</p>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-600" />
                                <p className="text-white font-medium">{customer?.customerEmail || "—"}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Address</p>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-600" />
                                <p className="text-white font-medium">{customer?.customerAddress || "Not provided"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Orders List ── */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <Package className="w-5 h-5 text-blue-500" /> Order History
                    </h2>

                    {recentOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <ShoppingBag className="w-12 h-12 text-gray-700" />
                            <p className="text-gray-500 font-medium">No orders yet</p>
                            <button
                                onClick={() => navigate("/")}
                                className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order, index) => (
                                <div
                                    key={order._id}
                                    onClick={() => navigate(`/customer/dashbaord/${order._id}`)}
                                    className="group flex items-center justify-between p-4 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 hover:border-blue-500/40 rounded-xl transition-all duration-200 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-700 group-hover:bg-blue-500/10 rounded-lg transition-colors">
                                            <Package className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-3 h-3 text-gray-600" />
                                                <p className="text-white font-mono text-sm font-semibold">
                                                    {order._id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MapPin className="w-3 h-3" />
                                                    {order.insideDhaka ? "Inside Dhaka" : "Outside Dhaka"}
                                                </span>
                                                <span className="text-xs text-gray-600">•</span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(order.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-white font-bold text-sm hidden sm:block">
                                            {formatCurrency(order.totalAmount)}
                                        </p>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default CustomerDashboard;