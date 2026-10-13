import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Clock, MapPin, Package, Truck, XCircle, CreditCard } from "lucide-react";

const money = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

const formatDate = (iso) =>
    iso
        ? new Date(iso).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "";

const STEPS = [
    { status: "PENDING", label: "Order placed", hint: "We've received your order", icon: Clock },
    { status: "ACCEPTED", label: "Confirmed", hint: "Your order is confirmed and being packed", icon: Package },
    { status: "SHIPPED", label: "Shipped", hint: "Your parcel is on its way", icon: Truck },
];

const PAYMENT_LABELS = {
    cod: "Cash on Delivery",
    bkash: "bKash",
    cash: "Cash",
    nagad: "Nagad",
    card: "Card",
    bank: "Bank Transfer",
};

const PAYMENT_STATUS_LABELS = { PAID: "Paid", PARTIAL: "Partly paid", UNPAID: "To pay on delivery" };

function StatusTimeline({ status }) {
    if (status === "CANCELED") {
        return (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-red-300">Order cancelled</p>
                    <p className="text-sm text-gray-400">This order was cancelled. Contact us if you have any questions.</p>
                </div>
            </div>
        );
    }

    const currentIndex = Math.max(0, STEPS.findIndex((step) => step.status === status));

    return (
        <ol className="grid grid-cols-3 gap-2">
            {STEPS.map((step, index) => {
                const done = index <= currentIndex;
                const Icon = done ? step.icon : Circle;
                return (
                    <li key={step.status} className="flex flex-col items-center text-center gap-2">
                        <div className="flex items-center w-full">
                            <div className={`h-0.5 flex-1 ${index === 0 ? "invisible" : done ? "bg-white" : "bg-[#2a2a2a]"}`} />
                            <span
                                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 ${
                                    done ? "bg-white text-black border-white" : "bg-[#0f0f0f] text-gray-600 border-[#2a2a2a]"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                            </span>
                            <div
                                className={`h-0.5 flex-1 ${index === STEPS.length - 1 ? "invisible" : index < currentIndex ? "bg-white" : "bg-[#2a2a2a]"}`}
                            />
                        </div>
                        <div>
                            <p className={`text-sm font-semibold ${done ? "text-white" : "text-gray-600"}`}>{step.label}</p>
                            {index === currentIndex && <p className="text-xs text-gray-400 hidden sm:block">{step.hint}</p>}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}

// Groups the one-row-per-unit order lines into one row per product.
const groupLines = (orderProducts = []) => {
    const groups = new Map();
    orderProducts.forEach((op) => {
        if (!groups.has(op.productId)) {
            groups.set(op.productId, {
                productId: op.productId,
                product: op.product,
                unitPrice: Number(op.purchasePrice),
                quantity: 0,
            });
        }
        groups.get(op.productId).quantity += 1;
    });
    return [...groups.values()];
};

/** Customer-facing view of an order returned by the track-order endpoint. */
function TrackedOrderDetails({ order }) {
    const lines = groupLines(order.orderProducts);
    const panel = "bg-[#181818] border border-[#2a2a2a] rounded-none rounded-tr-2xl rounded-bl-2xl";

    return (
        <div className="space-y-5">
            {/* Status */}
            <section className={`${panel} p-5 sm:p-6`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Order</p>
                        <p className="text-xl font-bold text-white font-mono">#{order.orderId}</p>
                    </div>
                    <p className="text-sm text-gray-400">Placed {formatDate(order.createdAt)}</p>
                </div>
                <StatusTimeline status={order.orderStatus} />
            </section>

            {/* Items */}
            <section className={`${panel} p-5 sm:p-6`}>
                <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
                <ul className="divide-y divide-[#2a2a2a]">
                    {lines.map((line) => {
                        const image = line.product?.bannerImageURL || line.product?.images?.[0]?.imageURL;
                        return (
                            <li key={line.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                <div className="w-14 h-14 shrink-0 rounded-lg bg-[#0a0a0a] overflow-hidden">
                                    {image && <img src={image} alt="" className="w-full h-full object-contain" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {line.product?.slug ? (
                                        <Link to={`/products/${line.product.slug}`} className="text-sm font-medium text-white hover:underline line-clamp-1">
                                            {line.product.title}
                                        </Link>
                                    ) : (
                                        <p className="text-sm font-medium text-white line-clamp-1">{line.product?.title || "Product"}</p>
                                    )}
                                    {line.product?.subTitle && <p className="text-xs text-gray-500 line-clamp-1">{line.product.subTitle}</p>}
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {money(line.unitPrice)} × {line.quantity}
                                    </p>
                                </div>
                                <p className="text-sm font-semibold text-white">{money(line.unitPrice * line.quantity)}</p>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <div className="grid gap-5 md:grid-cols-2">
                {/* Delivery */}
                <section className={`${panel} p-5 sm:p-6 space-y-2 text-sm`}>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                        <MapPin className="w-4 h-4" /> Delivery
                    </h2>
                    <p className="text-white">{order.customer?.name}</p>
                    <p className="text-gray-400">{order.customer?.phone}</p>
                    <p className="text-gray-400">{order.deliveryAddress}</p>
                    <p className="text-gray-500">{order.insideDhaka ? "Inside Dhaka" : "Outside Dhaka"}</p>
                    {order.deliveryNote && <p className="text-gray-500">Note: {order.deliveryNote}</p>}
                </section>

                {/* Payment */}
                <section className={`${panel} p-5 sm:p-6 text-sm`}>
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-white mb-3">
                        <CreditCard className="w-4 h-4" /> Payment
                    </h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-400">
                            <span>Subtotal</span>
                            <span className="text-white">{money(order.subTotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                            <span>Delivery</span>
                            <span className="text-white">{money(order.deliveryCharge)}</span>
                        </div>
                        {Number(order.discount) > 0 && (
                            <div className="flex justify-between text-green-400">
                                <span>Discount</span>
                                <span>-{money(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-base text-white border-t border-[#2a2a2a] pt-2">
                            <span>Total</span>
                            <span>{money(order.totalBill)}</span>
                        </div>
                        <p className="text-gray-500 pt-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
                            {" · "}
                            {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                            {Number(order.dueAmount) > 0 && order.orderStatus !== "CANCELED" && ` (${money(order.dueAmount)} due)`}
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default TrackedOrderDetails;
