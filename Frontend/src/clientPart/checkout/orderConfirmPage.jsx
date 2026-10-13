import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import trackOrderApi from "@/services/clientPart/order/trackOrderApi";
import { apiErrorMessage } from "@/lib/apiError";
import TrackOrderForm from "@/components/clientPart/order/TrackOrderForm";
import TrackedOrderDetails from "@/components/clientPart/order/TrackedOrderDetails";

// Phone the order was just placed with: from the checkout redirect, or from
// sessionStorage if the page was refreshed.
const rememberedPhone = (orderId, state) => {
    if (state?.phone) return state.phone;
    try {
        const last = JSON.parse(sessionStorage.getItem("lastOrder") || "null");
        return last?.orderId === orderId ? last.phone : "";
    } catch {
        return "";
    }
};

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const [phone, setPhone] = useState(() => rememberedPhone(orderId, location.state));

    const { data, isLoading, error } = useQuery({
        queryKey: ["trackedOrder", orderId, phone],
        queryFn: () => trackOrderApi(orderId, phone),
        enabled: !!orderId && !!phone,
        retry: false,
    });
    const order = data?.data;

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white py-10 sm:py-14 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Success header */}
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-5"
                    >
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2">Thank you for your order!</h1>
                    <p className="text-gray-400">
                        Your order ID is <span className="font-mono font-semibold text-white">#{orderId}</span>.
                        Keep it — with your phone number you can track the order any time.
                    </p>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                )}

                {order && <TrackedOrderDetails order={order} />}

                {/* No phone remembered (or it didn't match): ask for it */}
                {!order && !isLoading && (
                    <div className="bg-[#181818] border border-[#2a2a2a] rounded-none rounded-tr-2xl rounded-bl-2xl p-5 sm:p-6">
                        <p className="text-sm text-gray-400 mb-4">Enter your phone number to see the order details.</p>
                        <TrackOrderForm
                            initialOrderId={orderId}
                            error={error ? apiErrorMessage(error) : ""}
                            onSubmit={({ phone: enteredPhone }) => setPhone(enteredPhone)}
                        />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/all-products"
                        className="px-6 py-3 text-center bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Continue shopping
                    </Link>
                    <Link
                        to={`/track-order?id=${orderId}`}
                        className="px-6 py-3 text-center bg-[#1a1a1a] border border-[#333333] font-medium rounded-xl hover:bg-[#242424] transition-colors"
                    >
                        Track order
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
