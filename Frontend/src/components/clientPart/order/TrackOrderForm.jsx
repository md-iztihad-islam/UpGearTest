import { useState } from "react";
import { Loader2, Search } from "lucide-react";

// Phones are matched as 01XXXXXXXXX; accept +880 / 880 / spaces too.
const normalizeBdPhone = (value) => {
    let phone = String(value ?? "").replace(/[\s-]/g, "");
    if (phone.startsWith("+880")) phone = "0" + phone.slice(4);
    else if (phone.startsWith("880")) phone = "0" + phone.slice(3);
    return phone;
};

/** Order ID + phone form. Calls onSubmit({ orderId, phone }) once both look valid. */
function TrackOrderForm({ initialOrderId = "", initialPhone = "", onSubmit, isLoading, error }) {
    const [orderId, setOrderId] = useState(initialOrderId);
    const [phone, setPhone] = useState(initialPhone);
    const [localError, setLocalError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        const id = orderId.trim().replace(/^#/, "");
        const normalizedPhone = normalizeBdPhone(phone);
        if (!id) return setLocalError("Enter your order ID");
        if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) return setLocalError("Enter the 11-digit phone number you ordered with");
        setLocalError("");
        onSubmit({ orderId: id, phone: normalizedPhone });
    };

    const inputCls =
        "w-full bg-[#0f0f0f] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#666666] transition-colors";
    const shownError = localError || error;

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                    <span className="text-sm font-medium text-gray-300">Order ID</span>
                    <input
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="e.g. 102613001"
                        inputMode="numeric"
                        autoComplete="off"
                        className={`${inputCls} font-mono`}
                    />
                </label>
                <label className="space-y-1.5">
                    <span className="text-sm font-medium text-gray-300">Phone number</span>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        inputMode="tel"
                        autoComplete="tel"
                        className={inputCls}
                    />
                </label>
            </div>

            {shownError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{shownError}</p>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-colors"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track order
            </button>
        </form>
    );
}

export default TrackOrderForm;
