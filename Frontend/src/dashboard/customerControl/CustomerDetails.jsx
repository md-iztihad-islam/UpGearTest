import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft, Phone, Mail, MapPin, ShoppingBag,
    Package, Calendar, Loader2, AlertCircle, Hash,
    Clock, CheckCircle, XCircle, Truck, Receipt,
    CreditCard, Tag, FileText
} from "lucide-react";
import getCustomerByIdApi from "@/services/dashboard/customer/getCustomerByIdApi";

// --------------- Status Config ---------------
const statusConfig = {
    accepted:   { label: "Accepted",   icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    pending:    { label: "Pending",    icon: Clock,       color: "text-yellow-400",  bg: "bg-yellow-400/10 border-yellow-400/20" },
    processing: { label: "Processing", icon: Package,     color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20" },
    shipped:    { label: "Shipped",    icon: Truck,       color: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/20" },
    delivered:  { label: "Delivered",  icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    cancelled:  { label: "Cancelled",  icon: XCircle,     color: "text-red-400",     bg: "bg-red-400/10 border-red-400/20" },
};

function StatusBadge({ status }) {
    const key = status?.toLowerCase();
    const cfg = statusConfig[key] || statusConfig.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${cfg.bg} ${cfg.color}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

// --------------- Info Chip ---------------
function InfoChip({ icon: Icon, label, value, accent = "blue" }) {
    if (!value) return null;
    const accents = {
        blue:    "text-blue-400 bg-blue-400/10",
        purple:  "text-purple-400 bg-purple-400/10",
        emerald: "text-emerald-400 bg-emerald-400/10",
    };
    return (
        <div className="flex items-start gap-3 bg-gray-900 border border-gray-700/60 rounded-xl p-4 hover:border-gray-600 transition-colors">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${accents[accent]}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
                <p className="text-gray-500 text-xs mb-0.5 uppercase tracking-wide">{label}</p>
                <p className="text-white text-sm font-medium break-all">{value}</p>
            </div>
        </div>
    );
}

// --------------- Order Card ---------------
function OrderCard({ order }) {
    const date = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-US", {
              day: "numeric", month: "short", year: "numeric",
          })
        : "—";

    const paymentLabel = order.paymentMethod === "cod"
        ? "Cash on Delivery"
        : order.paymentMethod || "—";

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800/80 border border-gray-700/60 rounded-2xl p-5 hover:border-gray-600 transition-all duration-200 flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Hash className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-200 text-sm font-mono font-semibold tracking-wider">
                            {order.orderId || order._id?.slice(-8).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        {date}
                    </div>
                </div>
                <StatusBadge status={order.orderStatus || order.status} />
            </div>

            {/* Products */}
            {order.products?.length > 0 && (
                <div className="space-y-2.5 bg-gray-800/50 rounded-xl p-3">
                    {order.products.map((item, i) => (
                        <div key={i} className="flex items-start justify-between gap-2 text-sm">
                            <span className="text-gray-300 leading-snug line-clamp-2 flex-1">
                                {item.productName || "Product"}
                            </span>
                            <div className="flex-shrink-0 text-right ml-2">
                                <p className="text-gray-500 text-xs">×{item.productQuantity || 1}</p>
                                <p className="text-gray-400 text-xs">
                                    ৳{(item.productPrice || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pricing Breakdown */}
            <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span>৳{order.subTotal?.toLocaleString() ?? "—"}</span>
                </div>
                {order.shippingCost > 0 && (
                    <div className="flex justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Shipping ({order.insideDhaka ? "Inside Dhaka" : "Outside Dhaka"})
                        </span>
                        <span>৳{order.shippingCost?.toLocaleString()}</span>
                    </div>
                )}
                {order.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-400">
                        <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Discount
                        </span>
                        <span>−৳{order.discount?.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-700/60">
                    <span className="text-gray-400 text-sm font-medium">Total</span>
                    <span className="text-white font-bold text-base">
                        ৳{order.totalAmount?.toLocaleString() ?? "—"}
                    </span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-700/40">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CreditCard className="w-3.5 h-3.5" />
                    {paymentLabel}
                </div>
                {order.invoiceUrl && (
                    <a
                        href={order.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        View Invoice
                    </a>
                )}
            </div>
        </div>
    );
}

// --------------- Main Component ---------------
function CustomerDetails() {
    const { customerId } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["customer-by-id", customerId],
        queryFn: () => getCustomerByIdApi(customerId),
        enabled: !!customerId,
    });

    const customer = data?.customer;

    // Populated orders only (objects, not bare IDs)
    const orders = customer?.orderIds?.filter(o => typeof o === "object") || [];
    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const completedCount = orders.filter(o =>
        ["delivered", "accepted"].includes(o.orderStatus?.toLowerCase())
    ).length;

    const formatSpent = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString();

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-5xl mx-auto">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="text-sm">Back to Customers</span>
                </button>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p className="text-gray-400">Loading customer…</p>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 font-medium">Failed to load customer</p>
                        <p className="text-gray-500 text-sm">{error?.message}</p>
                    </div>
                )}

                {/* Content */}
                {!isLoading && !isError && customer && (
                    <>
                        {/* Profile Header */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800/60 border border-gray-700/60 rounded-3xl p-6 sm:p-8 mb-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-4xl flex-shrink-0 shadow-xl shadow-blue-500/20">
                                    {customer.customerName?.charAt(0)?.toUpperCase() || "?"}
                                </div>

                                {/* Name & meta */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 truncate">
                                        {customer.customerName || "Unknown Customer"}
                                    </h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-gray-500 text-xs font-mono bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1">
                                            ID: {customer._id?.slice(-10).toUpperCase()}
                                        </span>
                                        <span className="text-gray-600 text-xs">·</span>
                                        <span className="text-gray-500 text-xs">
                                            Member since {new Date(customer.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick stats */}
                                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-center min-w-[80px]">
                                        <p className="text-blue-400 text-2xl font-bold">{customer.numberOfOrders ?? 0}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">Orders</p>
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-center min-w-[80px]">
                                        <p className="text-emerald-400 text-2xl font-bold">৳{formatSpent(totalSpent)}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">Spent</p>
                                    </div>
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 text-center min-w-[80px]">
                                        <p className="text-purple-400 text-2xl font-bold">{completedCount}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            <InfoChip icon={Phone}    label="Phone"        value={customer.customerPhone}  accent="blue" />
                            <InfoChip icon={Mail}     label="Email"        value={customer.customerEmail}  accent="purple" />
                            <InfoChip icon={MapPin}   label="Address"      value={customer.customerAddress} accent="emerald" />
                            <InfoChip
                                icon={Calendar}
                                label="Member Since"
                                accent="blue"
                                value={customer.createdAt
                                    ? new Date(customer.createdAt).toLocaleDateString("en-US", {
                                          day: "numeric", month: "long", year: "numeric",
                                      })
                                    : null
                                }
                            />
                        </div>

                        {/* Orders */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-blue-400" />
                                    Order History
                                </h2>
                                <span className="text-gray-500 text-sm bg-gray-900 border border-gray-700 rounded-lg px-3 py-1">
                                    {orders.length} {orders.length === 1 ? "order" : "orders"}
                                </span>
                            </div>

                            {orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 bg-gray-900 border border-gray-700 rounded-2xl gap-3">
                                    <ShoppingBag className="w-10 h-10 text-gray-600" />
                                    <p className="text-gray-400">No orders yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {orders.map((order, i) => (
                                        <OrderCard key={order._id || i} order={order} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CustomerDetails;