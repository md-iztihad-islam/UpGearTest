import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users, Search, Phone, Mail, MapPin,
    ShoppingBag, ChevronRight, Loader2, AlertCircle, UserX
} from "lucide-react";
import getAllCustomersApi from "@/services/dashboard/customer/getAllCustomerApi";

// --------------- Stat Card ---------------
function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}

// --------------- Customer Row ---------------
function CustomerRow({ customer, onClick }) {
    return (
        <div
            onClick={onClick}
            className="group flex items-center gap-4 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-blue-500/50 rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
        >
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {customer.customerName?.charAt(0)?.toUpperCase() || "?"}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                    {customer.customerName || "—"}
                </p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Phone className="w-3 h-3" />
                        {customer.customerPhone || "—"}
                    </span>
                    {customer.customerEmail && (
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[160px]">{customer.customerEmail}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Orders badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-400 text-sm font-semibold">
                        {customer.numberOfOrders ?? 0}
                    </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
            </div>
        </div>
    );
}

// --------------- Main Component ---------------
function CustomerControl() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["all-customers"],
        queryFn: getAllCustomersApi,
    });

    const customers = data?.customers || [];

    const filtered = customers.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.customerName?.toLowerCase().includes(q) ||
            c.customerPhone?.includes(q) ||
            c.customerEmail?.toLowerCase().includes(q)
        );
    });

    const totalOrders = customers.reduce((sum, c) => sum + (c.numberOfOrders || 0), 0);

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Customers
                    </h1>
                    <p className="text-gray-400 text-lg">Manage and view all your customers</p>
                </div>

                {/* Stats */}
                {!isLoading && !isError && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <StatCard icon={Users} label="Total Customers" value={customers.length} color="bg-blue-600" />
                        <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders} color="bg-purple-600" />
                        <StatCard
                            icon={Users}
                            label="Avg. Orders / Customer"
                            value={customers.length ? (totalOrders / customers.length).toFixed(1) : "0"}
                            color="bg-emerald-600"
                        />
                    </div>
                )}

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, phone, or email…"
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>

                {/* Content */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p className="text-gray-400">Loading customers…</p>
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 font-medium">Failed to load customers</p>
                        <p className="text-gray-500 text-sm">{error?.message}</p>
                    </div>
                )}

                {!isLoading && !isError && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <UserX className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400 font-medium">No customers found</p>
                        {search && (
                            <p className="text-gray-500 text-sm">Try a different search term</p>
                        )}
                    </div>
                )}

                {!isLoading && !isError && filtered.length > 0 && (
                    <>
                        <p className="text-gray-500 text-sm mb-3">
                            Showing {filtered.length} of {customers.length} customers
                        </p>
                        <div className="space-y-3">
                            {filtered.map((customer) => (
                                <CustomerRow
                                    key={customer._id}
                                    customer={customer}
                                    onClick={() => navigate(`/dashboard/customercontrol/customers/${customer._id}`)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CustomerControl;