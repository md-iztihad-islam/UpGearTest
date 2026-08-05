import { useQuery } from "@tanstack/react-query";
import getOrderByInvoiceNumberApi from "@/services/dashboard/order/getOrderByInvoiceNumberApi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, Hash, Calendar, User, Phone, MapPin,
    Package, CreditCard, Truck, Tag, FileText,
    Clock, CheckCircle, XCircle, Loader2, AlertCircle,
    ShoppingBag, Receipt, ChevronDown, ChevronUp,
    Mail, Shield, ExternalLink
} from "lucide-react";

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

// --------------- Order Preview Card ---------------
function OrderPreviewCard({ order, expanded, onToggle, onViewDetails }) {
    const date = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-US", {
              day: "numeric", month: "short", year: "numeric",
          })
        : "—";

    const firstImage = order.products?.[0]?.productId?.images?.[0];

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800/60 border border-gray-700/60 rounded-2xl overflow-hidden">
            {/* Preview Row — always visible */}
            <button
                onClick={onToggle}
                className="w-full text-left p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
            >
                {/* Product thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-800 border border-gray-700">
                    {firstImage ? (
                        <img src={firstImage} alt="product" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-gray-600" />
                        </div>
                    )}
                </div>

                {/* Core info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white font-mono font-bold text-sm tracking-wider">
                            #{order.orderId}
                        </span>
                        <StatusBadge status={order.orderStatus} />
                    </div>
                    <p className="text-gray-400 text-sm truncate">{order.customerName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {date}
                        </span>
                        <span className="flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3" /> {order.products?.length} item{order.products?.length !== 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold text-white">৳{order.totalAmount?.toLocaleString()}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/60 text-blue-400 hover:text-blue-300 rounded-lg text-xs font-medium transition-all duration-200"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View Details</span>
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                        {expanded
                            ? <ChevronUp className="w-4 h-4 text-gray-400" />
                            : <ChevronDown className="w-4 h-4 text-gray-400" />
                        }
                    </div>
                </div>
            </button>

            {/* Expanded Detail Panel */}
            {expanded && (
                <div className="border-t border-gray-700/60 px-5 pb-6 pt-5 space-y-6">

                    {/* Customer Info */}
                    <div>
                        <SectionLabel icon={User} label="Customer Information" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                            <InfoRow icon={User}     label="Name"    value={order.customerName} />
                            <InfoRow icon={Phone}    label="Phone"   value={order.customerPhone} />
                            <InfoRow icon={Mail}     label="Email"   value={order.customerEmail} />
                            <InfoRow icon={MapPin}   label="Address"
                                value={[order.deliverAddress, order.city, order.postalCode].filter(Boolean).join(", ")}
                            />
                            <InfoRow icon={Truck}    label="Zone"
                                value={order.insideDhaka ? "Inside Dhaka" : "Outside Dhaka"}
                            />
                            <InfoRow icon={CreditCard} label="Payment"
                                value={order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}
                            />
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <SectionLabel icon={Package} label="Ordered Products" />
                        <div className="space-y-3 mt-3">
                            {order.products?.map((item, i) => {
                                const product = item.productId;
                                const image = product?.images?.[0];
                                return (
                                    <div key={item._id || i} className="flex gap-3 bg-gray-800/50 border border-gray-700/40 rounded-xl p-3">
                                        {/* Image */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                                            {image ? (
                                                <img src={image} alt={item.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium leading-snug line-clamp-2">
                                                {item.productName}
                                            </p>
                                            {product?.subTitle && (
                                                <p className="text-gray-500 text-xs mt-0.5">{product.subTitle}</p>
                                            )}

                                            {/* Key features */}
                                            {product?.keyFeatures?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {product.keyFeatures.slice(0, 3).map((f, fi) => (
                                                        <span key={fi} className="text-xs bg-gray-700 text-gray-300 rounded-md px-2 py-0.5">
                                                            {f}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Warranty */}
                                            {product?.warrenty?.warrentyPeriod && (
                                                <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                                                    <Shield className="w-3 h-3" />
                                                    {product.warrenty.warrentyPeriod} Warranty
                                                </div>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="flex-shrink-0 text-right">
                                            <p className="text-white font-bold text-sm">
                                                ৳{(item.productPrice * item.productQuantity).toLocaleString()}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                ৳{item.productPrice?.toLocaleString()} × {item.productQuantity}
                                            </p>
                                            {product?.discountAmount > 0 && (
                                                <p className="text-emerald-400 text-xs mt-1">
                                                    −৳{product.discountAmount} off
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    <div>
                        <SectionLabel icon={Receipt} label="Order Summary" />
                        <div className="mt-3 bg-gray-800/40 border border-gray-700/40 rounded-xl p-4 space-y-2">
                            <PriceLine label="Subtotal" value={`৳${order.subTotal?.toLocaleString()}`} />
                            {order.shippingCost > 0 && (
                                <PriceLine
                                    label={`Shipping (${order.insideDhaka ? "Inside Dhaka" : "Outside Dhaka"})`}
                                    value={`৳${order.shippingCost?.toLocaleString()}`}
                                />
                            )}
                            {order.discount > 0 && (
                                <PriceLine label="Discount" value={`−৳${order.discount?.toLocaleString()}`} green />
                            )}
                            {order.appliedCoupon && (
                                <PriceLine label="Coupon Applied" value={order.appliedCoupon.code || "—"} green />
                            )}
                            <div className="flex justify-between items-center pt-2 border-t border-gray-700/60">
                                <span className="text-white font-bold">Total</span>
                                <span className="text-white font-bold text-xl">
                                    ৳{order.totalAmount?.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Invoice */}
                    {order.invoiceUrl && (
                        <a
                            href={order.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-xl transition-all duration-200 text-sm font-medium"
                        >
                            <FileText className="w-4 h-4" />
                            Download Invoice PDF
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

// --------------- Small helpers ---------------
function SectionLabel({ icon: Icon, label }) {
    return (
        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wide font-semibold">
            <Icon className="w-3.5 h-3.5" />
            {label}
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-2.5">
            <Icon className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
                <p className="text-gray-500 text-xs">{label}</p>
                <p className="text-white text-sm break-all">{value}</p>
            </div>
        </div>
    );
}

function PriceLine({ label, value, green }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-400">{label}</span>
            <span className={green ? "text-emerald-400" : "text-gray-300"}>{value}</span>
        </div>
    );
}

// --------------- Main Component ---------------
function SearchOrder() {
    const navigate = useNavigate();
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [submittedInvoice, setSubmittedInvoice] = useState("");
    const [expanded, setExpanded] = useState(false);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["search-order", submittedInvoice],
        queryFn: () => getOrderByInvoiceNumberApi(submittedInvoice),
        enabled: !!submittedInvoice,
        retry: false,
    });

    const order = data?.data;

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmed = invoiceNumber.trim();
        if (!trimmed) return;
        setExpanded(false);
        setSubmittedInvoice(trimmed);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Search Order
                    </h1>
                    <p className="text-gray-400">Look up any order by invoice number</p>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                placeholder="Enter invoice number e.g. 033260922210"
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-mono"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !invoiceNumber.trim()}
                            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 flex-shrink-0"
                        >
                            {isLoading
                                ? <Loader2 className="w-5 h-5 animate-spin" />
                                : <Search className="w-5 h-5" />
                            }
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </div>
                </form>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p className="text-gray-400">Searching for order…</p>
                    </div>
                )}

                {/* Error */}
                {isError && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-700 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 font-medium">Order not found</p>
                        <p className="text-gray-500 text-sm">
                            No order matched <span className="font-mono text-gray-300">"{submittedInvoice}"</span>
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {!submittedInvoice && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-gray-800 rounded-2xl">
                        <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center">
                            <Receipt className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-500">Enter an invoice number to find an order</p>
                    </div>
                )}

                {/* Result */}
                {!isLoading && !isError && order && (
                    <OrderPreviewCard
                        order={order}
                        expanded={expanded}
                        onToggle={() => setExpanded(prev => !prev)}
                        onViewDetails={() => navigate(`/dashboard/searchorder/order/${order._id}`)}
                    />
                )}
            </div>
        </div>
    );
}

export default SearchOrder;