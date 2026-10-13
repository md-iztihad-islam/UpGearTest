import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, PackageSearch, ChevronRight, Store, Globe } from "lucide-react";
import searchOrdersApi from "@/services/dashboard/order/searchOrdersApi";
import { apiErrorMessage } from "@/lib/apiError";

const STATUS_STYLES = {
    PENDING: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    ACCEPTED: "bg-green-500/15 text-green-300 border-green-500/30",
    SHIPPED: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    CANCELED: "bg-red-500/15 text-red-300 border-red-500/30",
};

const money = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;
const formatDate = (iso) =>
    new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Look up any order by order ID, customer phone or customer name.
// The query lives in the URL (?q=) so Back from an order returns here.
function SearchOrder() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const submitted = searchParams.get("q") || "";
    const [input, setInput] = useState(submitted);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["searchOrders", submitted],
        queryFn: () => searchOrdersApi(submitted),
        enabled: submitted.trim().length >= 2,
        retry: false,
    });
    const orders = data?.orders || [];

    const handleSubmit = (e) => {
        e.preventDefault();
        const query = input.trim().replace(/^#/, "");
        if (query.length >= 2) setSearchParams({ q: query });
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Search Orders
                    </h1>
                    <p className="text-gray-400">Find an order by order ID, customer phone or customer name</p>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g. 102613001, 017XXXXXXXX or Rahim"
                            autoFocus
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={input.trim().length < 2}
                        className="px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
                    >
                        Search
                    </button>
                </form>

                {isLoading && (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                )}

                {isError && (
                    <p className="text-center text-red-400 py-10">{apiErrorMessage(error, "Search failed, please try again")}</p>
                )}

                {!submitted && (
                    <div className="text-center py-16 text-gray-500">
                        <PackageSearch className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                        Search results will show here
                    </div>
                )}

                {submitted && !isLoading && !isError && orders.length === 0 && (
                    <p className="text-center text-gray-400 py-16">No orders match “{submitted}”</p>
                )}

                {orders.length > 0 && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                        <p className="px-5 py-3 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-700">
                            {orders.length === 50 ? "Showing the 50 most recent matches" : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
                        </p>
                        <ul className="divide-y divide-gray-700">
                            {orders.map((order) => (
                                <li key={order.orderId}>
                                    <button
                                        onClick={() => navigate(`order/${order.orderId}`)}
                                        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-800/60 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-mono font-semibold">#{order.orderId}</span>
                                                <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_STYLES[order.orderStatus] || "bg-gray-700 text-gray-300 border-gray-600"}`}>
                                                    {order.orderStatus}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    {order.orderType === "POS" ? <Store className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                                                    {order.orderType === "POS" ? order.store?.title || "In-store" : "Online"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 truncate">
                                                {order.customer?.name} · {order.customer?.phone} · {order.orderProducts?.length || 0} item(s)
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                                        </div>
                                        <span className="font-semibold">{money(order.totalBill)}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchOrder;
