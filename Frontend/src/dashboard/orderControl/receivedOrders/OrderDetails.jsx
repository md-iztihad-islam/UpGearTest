import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import getOrderByOrderIdApi from "@/services/dashboard/order/getOrderByOrderIdApi";
import { ArrowLeft, User, MapPin, CreditCard, Package, FileText, Loader2, CheckCircle, XCircle, Trash2, AlertTriangle } from "lucide-react";
import acceptOrderApi from "@/services/dashboard/order/acceptOrder";
import cancelOrderApi from "@/services/dashboard/order/cancelOrderApi";
import deleteOrderApi from "@/services/dashboard/order/deleteOrderApi";

function DeleteConfirmModal({ isOpen, onConfirm, onCancel, isDeleting }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-600/20 border border-red-600/40 flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete Order?</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            This action is <span className="text-red-400 font-semibold">permanent</span> and cannot be undone.
                            The order and all associated data will be removed.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button
                            onClick={onCancel}
                            disabled={isDeleting}
                            className="flex-1 py-2.5 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    Delete Order
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OrderDetails() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data: orderResponse, isLoading, isError, error } = useQuery({
        queryKey: ["orderDetails", orderId],
        queryFn: () => getOrderByOrderIdApi(orderId),
    });

    // Confirmed shape from the actual endpoint: { data: {...order}, message }
    const order = orderResponse?.data || {};

    const { mutate: acceptOrder, isPending: isMutating } = useMutation({
        // Serial numbers are already reserved automatically at order-creation
        // time (see reserveStockQuantityRepository in addOrderService), so
        // accepting just transitions status — no body needed.
        mutationFn: () => acceptOrderApi(orderId),
        onSuccess: () => {
            window.showToast("Order confirmed successfully!", "success");
            navigate(-1);
        },
        onError: () => {
            window.showToast("Error confirming order. Please try again.", "error");
        },
    });

    const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
        mutationFn: () => cancelOrderApi(orderId),
        onSuccess: () => {
            window.showToast("Order cancelled successfully!", "success");
            navigate(-1);
        },
        onError: () => {
            window.showToast("Error cancelling order. Please try again.", "error");
        },
    });

    const { mutate: deleteOrder, isPending: isDeleting } = useMutation({
        mutationFn: () => deleteOrderApi(orderId),
        onSuccess: () => {
            window.showToast("Order deleted successfully!", "success");
            navigate(-1);
        },
        onError: () => {
            window.showToast("Error deleting order. Please try again.", "error");
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl mb-4">Error: {error.message}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const {
        customer,
        deliveryAddress,
        paymentMethod,
        insideDhaka,
        deliveryCharge,
        subTotal,
        discount,
        totalBill,
        paymentStatus,
        paidAmount,
        dueAmount,
        transactionId,
        orderProducts = [],
        orderStatus,
        invoiceURL,
        deliveryNote,
        sellerNote,
        createdAt,
    } = order;

    const toNumber = (val) => (val === null || val === undefined ? 0 : parseFloat(val));

    const formatDateTime = (iso) => {
        if (!iso) return "-";
        const d = new Date(iso);
        return d.toLocaleString("en-BD", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatMoney = (value) => `৳${toNumber(value).toLocaleString("en-BD")}`;

    // orderStatus values observed so far: "PENDING", "CANCELLED". The
    // post-confirm state isn't confirmed yet — adjust the key below (and the
    // isCancellable / "Confirm Order" checks further down) once known.
    const statusColors = {
        PENDING: "bg-yellow-600",
        PROCESSING: "bg-green-600",
        SHIPPED: "bg-blue-600",
        DELIVERED: "bg-emerald-600",
        CANCELLED: "bg-red-600",
    };

    // orderProducts rows are one per physical unit, each carrying its own
    // populated `product` relation and an already-assigned `serialNumber`.
    // Group by product.productId to show one card per product with a
    // quantity count and the list of serials that make it up.
    const groupedProducts = (() => {
        const groups = new Map();
        orderProducts.forEach((op) => {
            const key = op.product?.productId || op.productId;
            if (!groups.has(key)) {
                groups.set(key, {
                    productId: key,
                    title: op.product?.title || `Product ${String(key).slice(0, 8)}`,
                    image: op.product?.bannerImageURL,
                    units: [],
                });
            }
            groups.get(key).units.push(op);
        });
        return Array.from(groups.values());
    })();

    const handleConfirmOrder = () => acceptOrder();

    const handleDownloadInvoice = () => {
        if (invoiceURL) {
            window.open(invoiceURL, "_blank");
        } else {
            alert("Invoice not available for this order");
        }
    };

    const isCancellable = ["PENDING", "PROCESSING"].includes(orderStatus);
    const isAnyActionPending = isMutating || isCancelling || isDeleting;

    return (
        <>
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onConfirm={() => deleteOrder()}
                onCancel={() => setShowDeleteModal(false)}
                isDeleting={isDeleting}
            />

            <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-6"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                            <span className="text-sm font-medium">Back</span>
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                                    Order #{order?.orderId?.slice(0, 8)}
                                </h1>
                                <p className="text-gray-400">Placed on {formatDateTime(createdAt)}</p>
                            </div>
                            <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${statusColors[orderStatus] || "bg-gray-600"}`}>
                                {orderStatus}
                            </span>
                        </div>
                    </div>

                    {/* Customer and Shipping Details */}
                    <div className="grid gap-6 md:grid-cols-2 mb-6">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                                <User className="w-5 h-5 text-blue-400" />
                                Customer Details
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-400">Name:</span> <span className="text-white ml-2">{customer?.name || "-"}</span></p>
                                <p><span className="text-gray-400">Phone:</span> <span className="text-white ml-2">{customer?.phone || "-"}</span></p>
                                <p><span className="text-gray-400">Email:</span> <span className="text-white ml-2">{customer?.email || "-"}</span></p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                            <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                                <MapPin className="w-5 h-5 text-purple-400" />
                                Shipping Details
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-400">Address:</span> <span className="text-white ml-2">{deliveryAddress || "-"}</span></p>
                                <p><span className="text-gray-400">Region:</span> <span className="text-white ml-2">{insideDhaka ? "Inside Dhaka" : "Outside Dhaka"}</span></p>
                                {deliveryNote && (
                                    <p><span className="text-gray-400">Courier note:</span> <span className="text-amber-300 ml-2">{deliveryNote}</span></p>
                                )}
                                {sellerNote && (
                                    <p><span className="text-gray-400">Seller note:</span> <span className="text-purple-300 ml-2">{sellerNote}</span></p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <CreditCard className="w-5 h-5 text-green-400" />
                            Payment Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <p><span className="text-gray-400">Method:</span> <span className="text-white ml-2">{paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "bkash" ? "bKash" : paymentMethod || "-"}</span></p>
                            <p><span className="text-gray-400">Payment Status:</span> <span className="text-white ml-2">{paymentStatus || "-"}</span></p>
                            <p><span className="text-gray-400">Shipping Cost:</span> <span className="text-white ml-2">{formatMoney(deliveryCharge)}</span></p>
                            <p><span className="text-gray-400">Paid / Due:</span> <span className="text-white ml-2">{formatMoney(paidAmount)} / {formatMoney(dueAmount)}</span></p>
                            {paymentMethod === "bkash" && (
                                <p><span className="text-gray-400">Transaction ID:</span> <span className="text-white ml-2">{transactionId || "-"}</span></p>
                            )}
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <Package className="w-5 h-5 text-yellow-400" />
                            Products
                        </h2>
                        <div className="space-y-4">
                            {groupedProducts.map((group) => {
                                const unitPrice = toNumber(group.units[0]?.purchasePrice);
                                const quantity = group.units.length;

                                return (
                                    <div key={group.productId} className="border border-gray-700 rounded-lg p-4">
                                        <div className="flex gap-4 mb-3">
                                            {group.image && (
                                                <img src={group.image} alt={group.title} className="w-16 h-16 object-cover rounded-lg" />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1">{group.title}</h3>
                                                <p className="text-sm text-gray-400">
                                                    {formatMoney(unitPrice)} × {quantity} = {formatMoney(unitPrice * quantity)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Serial numbers are already assigned at order time */}
                                        <div className="space-y-1">
                                            {group.units.map((unit) => (
                                                <div key={unit.orderProductId} className="flex items-center gap-2 text-sm">
                                                    {unit.serialNumber ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                                            <span className="text-gray-300">SN: {unit.serialNumber}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500 text-xs">No serial number assigned</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal</span>
                                <span className="text-white">{formatMoney(subTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Discount</span>
                                <span className="text-green-400">-{formatMoney(discount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Shipping</span>
                                <span className="text-white">{formatMoney(deliveryCharge)}</span>
                            </div>
                            <div className="border-t border-gray-700 my-3" />
                            <div className="flex justify-between text-lg font-semibold">
                                <span className="text-white">Total</span>
                                <span className="text-white">{formatMoney(totalBill)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {orderStatus === "PENDING" && (
                            <button
                                onClick={handleConfirmOrder}
                                disabled={isAnyActionPending}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {isMutating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Confirming...
                                    </>
                                ) : (
                                    "Confirm Order"
                                )}
                            </button>
                        )}

                        {orderStatus !== "PENDING" && invoiceURL && (
                            <button
                                onClick={handleDownloadInvoice}
                                disabled={isAnyActionPending}
                                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <FileText className="w-5 h-5" />
                                Download Invoice
                            </button>
                        )}

                        {isCancellable && (
                            <button
                                onClick={() => cancelOrder()}
                                disabled={isAnyActionPending}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isCancelling ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-5 h-5" />
                                        Cancel Order
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => setShowDeleteModal(true)}
                            disabled={isAnyActionPending}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete Order
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            disabled={isAnyActionPending}
                            className="sm:w-auto px-6 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OrderDetails;