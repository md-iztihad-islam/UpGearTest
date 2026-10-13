import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { PackageSearch } from "lucide-react";
import trackOrderApi from "@/services/clientPart/order/trackOrderApi";
import { apiErrorMessage } from "@/lib/apiError";
import TrackOrderForm from "@/components/clientPart/order/TrackOrderForm";
import TrackedOrderDetails from "@/components/clientPart/order/TrackedOrderDetails";

// Customers look up an order with its ID and the phone number they ordered
// with — no account needed. ?id=<orderId> pre-fills the order ID.
function TrackOrder() {
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState(null);

    const { mutate: track, isPending, error, reset } = useMutation({
        mutationFn: ({ orderId, phone }) => trackOrderApi(orderId, phone),
        onSuccess: (response) => setOrder(response.data),
        onError: () => setOrder(null),
    });

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
                <div>
                    <h1 className="flex items-center gap-3 text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                        <PackageSearch className="w-8 h-8" /> Track your order
                    </h1>
                    <p className="text-gray-400">
                        Enter your order ID and the phone number you used at checkout.
                    </p>
                </div>

                <div className="bg-[#181818] border border-[#2a2a2a] rounded-none rounded-tr-2xl rounded-bl-2xl p-5 sm:p-6">
                    <TrackOrderForm
                        initialOrderId={searchParams.get("id") || ""}
                        isLoading={isPending}
                        error={error ? apiErrorMessage(error, "Couldn't look up that order, please try again") : ""}
                        onSubmit={(values) => {
                            reset();
                            track(values);
                        }}
                    />
                </div>

                {order && <TrackedOrderDetails order={order} />}
            </div>
        </div>
    );
}

export default TrackOrder;
