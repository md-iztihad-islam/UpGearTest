import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import getOrderByOrderIdApi from "@/services/dashboard/order/getOrderByOrderIdApi";
import confirmOrderApi from "@/services/dashboard/order/getConfirmOrderApi";
import { ArrowLeft, User, MapPin, CreditCard, Package, FileText, Loader2, CheckCircle } from "lucide-react";

function Details() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [serialNumbers, setSerialNumbers] = useState({});

    const { data: orderData, isLoading, isError, error } = useQuery({
        queryKey: ['orderDetails', orderId],
        queryFn: () => getOrderByOrderIdApi(orderId),
    });

    // console.log("Fetched Order Data:", orderData);

    const { mutate, isPending: isMutating } = useMutation({
        mutationFn: (orderData) => confirmOrderApi(orderId, orderData),
        onSuccess: (data) => {
            // console.log("Order confirmed successfully:", data);
            window.showToast("Order confirmed successfully!", "success");
            navigate(-1);
        },
        onError: (error) => {
            // console.log("Error confirming order:", error);
            window.showToast("Error confirming order. Please try again.", "error");
        }
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

    const order = orderData?.data || {};
    const {
        customerName,
        customerPhone,
        customerEmail,
        deliverAddress,
        city,
        postalCode,
        paymentMethod,
        insideDhaka,
        shippingCost,
        products = [],
        orderStatus,
        discount,
        totalAmount,
        invoiceUrl,
    } = order;

    console.log("Product Data:", products);

    const subtotal = totalAmount - shippingCost + discount;

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

    const formatMoney = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

    const statusColors = {
        Pending: "bg-yellow-600",
        Accepted: "bg-green-600",
        Shipped: "bg-blue-600",
        Delivered: "bg-emerald-600",
        Cancelled: "bg-red-600",
    };

    const handleSerialNumberChange = (productId, serialNumber, index) => {
        setSerialNumbers((prev) => {
            const updatedSerialNumbers = { ...prev };
            if (!updatedSerialNumbers[productId]) {
                updatedSerialNumbers[productId] = [];
            }
            updatedSerialNumbers[productId][index] = serialNumber;
            return updatedSerialNumbers;
        });
    };

    const handleConfirmOrder = () => {
        console.log("Confirming order with serial numbers:", serialNumbers);
        // FIXED: Pass serialNumbers directly, not wrapped in orderData
        mutate(serialNumbers);
    };

    const handleDownloadInvoice = () => {
        if (invoiceUrl) {
            window.open(invoiceUrl, '_blank');
        } else {
            alert("Invoice not available for this order");
        }
    };

    return (
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
                                Order #{order?.orderId}
                            </h1>
                            <p className="text-gray-400">Placed on {formatDateTime(order?.createdAt)}</p>
                        </div>
                        <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${statusColors[orderStatus] || "bg-gray-600"}`}>
                            {orderStatus}
                        </span>
                    </div>
                </div>

                {/* Customer and Shipping Details */}
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                    {/* Customer Details */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <User className="w-5 h-5 text-blue-400" />
                            Customer Details
                        </h2>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-gray-400">Name:</span> <span className="text-white ml-2">{customerName || "-"}</span></p>
                            <p><span className="text-gray-400">Phone:</span> <span className="text-white ml-2">{customerPhone || "-"}</span></p>
                            <p><span className="text-gray-400">Email:</span> <span className="text-white ml-2">{customerEmail || "-"}</span></p>
                        </div>
                    </div>

                    {/* Shipping Details */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                            <MapPin className="w-5 h-5 text-purple-400" />
                            Shipping Details
                        </h2>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-gray-400">Address:</span> <span className="text-white ml-2">{deliverAddress || "-"}</span></p>
                            <p><span className="text-gray-400">City:</span> <span className="text-white ml-2">{city || "-"}</span></p>
                            <p><span className="text-gray-400">Postal Code:</span> <span className="text-white ml-2">{postalCode || "-"}</span></p>
                            <p><span className="text-gray-400">Region:</span> <span className="text-white ml-2">{insideDhaka ? "Inside Dhaka" : "Outside Dhaka"}</span></p>
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
                        <p><span className="text-gray-400">Method:</span> <span className="text-white ml-2">{paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod || "-"}</span></p>
                        <p><span className="text-gray-400">Shipping Cost:</span> <span className="text-white ml-2">{formatMoney(shippingCost)}</span></p>
                    </div>
                </div>

                {/* Products */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-6">
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                        <Package className="w-5 h-5 text-yellow-400" />
                        Products
                    </h2>
                    <div className="space-y-4">
                        {products.map((p, idx) => {
                            const baseProduct = typeof p.productId === "object" ? p.productId : null;
                            const title = (p.productName || baseProduct?.title || `Product ${idx + 1}`);
                            const unitPrice = p.productPrice || baseProduct?.finalPrice || 0;
                            const imageUrl = baseProduct?.images?.[0];
                            const id = p?.productId.productId;

                            return (
                                <div key={p._id || idx} className="border border-gray-700 rounded-lg p-4">
                                    <div className="flex gap-4 mb-3">
                                        {imageUrl && (
                                            <img src={imageUrl} alt={title} className="w-16 h-16 object-cover rounded-lg" />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-1">{title + " " + "(" + id + ")"}</h3>
                                            <p className="text-sm text-gray-400">
                                                {formatMoney(unitPrice)} × {p.productQuantity} = {formatMoney(unitPrice * p.productQuantity)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Serial Numbers */}
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-300">Serial Numbers:</p>
                                        {Array.from({ length: p.productQuantity }, (_, index) => (
                                            <div key={index}>
                                                {p.serialNumbers && p.serialNumbers[index] ? (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                        <span className="text-gray-300">SN: {p.serialNumbers[index]}</span>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        Not assigned yet
                                                    </div>
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
                            <span className="text-white">{formatMoney(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Discount</span>
                            <span className="text-green-400">-{formatMoney(discount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Shipping</span>
                            <span className="text-white">{formatMoney(shippingCost)}</span>
                        </div>
                        <div className="border-t border-gray-700 my-3" />
                        <div className="flex justify-between text-lg font-semibold">
                            <span className="text-white">Total</span>
                            <span className="text-white">{formatMoney(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {orderStatus === "Pending" ? (
                        <button
                            onClick={handleConfirmOrder}
                            disabled={isMutating}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                        >
                            {isMutating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Confirming...
                                </span>
                            ) : (
                                "Confirm Order"
                            )}
                        </button>
                    ) : invoiceUrl && (
                        <button
                            onClick={handleDownloadInvoice}
                            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                            <FileText className="w-5 h-5" />
                            Download Invoice
                        </button>
                    )}
                    <button
                        onClick={() => navigate(-1)}
                        className="sm:w-auto px-6 bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-all duration-200"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Details;