import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeft, Store, Mail, Phone, MapPin, Hash,
    Lock, SortAsc, Loader2, Save,
} from "lucide-react";
import getStoreByIdApi from "@/services/dashboard/store/getStoreByIdApi";
import updateStoreApi from "@/services/dashboard/store/updateStoreApi";
// import getStoreByIdApi from "@/services/dashboard/store/getStoreByIdApi";
// import updateStoreByIdApi from "@/services/dashboard/store/updateStoreByIdApi";

const inputCls =
    "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition text-sm";

function Field({ label, icon: Icon, children }) {
    return (
        <div>
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </label>
            {children}
        </div>
    );
}

const INITIAL = {
    title: "",
    subTitle: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    status: "active",
    orderIndex: "",
};

function EditStore() {
    const navigate = useNavigate();
    const { storeId } = useParams();

    const [form, setForm] = useState(INITIAL);
    const [hasHydrated, setHasHydrated] = useState(false);

    const { data: storeRes, isLoading, error } = useQuery({
        queryKey: ["store", storeId],
        queryFn: () => getStoreByIdApi(storeId),
        enabled: !!storeId,
    });

    // Hydrate form once
    useEffect(() => {
        const store = storeRes?.data;
        if (!store || hasHydrated) return;

        setForm({
            title: store.title || "",
            subTitle: store.subTitle || "",
            address: store.address || "",
            phone: store.phone || "",
            email: store.email || "",
            password: "",          // never pre-fill passwords
            status: store.status || "active",
            orderIndex: store.orderIndex?.toString() ?? "",
        });
        setHasHydrated(true);
    }, [storeRes, hasHydrated]);

    const set = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const { mutate: updateStore, isPending: isSaving } = useMutation({
        mutationFn: (data) => updateStoreApi(storeId, data),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Store updated successfully.", "success");
                navigate(-1);
            } else {
                window.showToast(data?.message || "Failed to update store.", "error");
            }
        },
        onError: (err) => {
            console.error("Error updating store:", err);
            window.showToast("An error occurred while updating the store.", "error");
        },
    });

    const handleSubmit = () => {
        if (!form.title.trim()) return window.showToast("Store title is required.", "error");
        if (!form.address.trim()) return window.showToast("Address is required.", "error");
        if (!form.phone.trim()) return window.showToast("Phone is required.", "error");
        if (!form.email.trim()) return window.showToast("Email is required.", "error");
        if (form.orderIndex === "" || isNaN(Number(form.orderIndex)))
            return window.showToast("Order index must be a number.", "error");

        const payload = {
            title: form.title,
            subTitle: form.subTitle,
            address: form.address,
            phone: form.phone,
            email: form.email,
            status: form.status,
            orderIndex: Number(form.orderIndex),
        };

        // Only include password if the user actually typed a new one
        if (form.password.trim()) {
            payload.password = form.password;
        }

        updateStore(payload);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-10">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back
                    </button>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Edit Store
                    </h1>
                    <p className="text-gray-500 font-mono text-xs">{storeId}</p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400 text-sm">Loading store…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                        <p className="text-red-400 text-sm">Error fetching store: {error.message}</p>
                    </div>
                )}

                {!isLoading && !error && hasHydrated && (
                    <div className="space-y-6">

                        {/* Identity */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-base font-semibold text-gray-100 mb-6">Store Identity</h2>
                            <div className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field label="Store Title" icon={Store}>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={set("title")}
                                            placeholder="e.g. Dhaka Main Branch"
                                            className={inputCls}
                                        />
                                    </Field>
                                    <Field label="Subtitle (optional)" icon={Store}>
                                        <input
                                            type="text"
                                            value={form.subTitle}
                                            onChange={set("subTitle")}
                                            placeholder="e.g. Ground Floor, Shop 3"
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field label="Order Index" icon={SortAsc}>
                                        <input
                                            type="number"
                                            value={form.orderIndex}
                                            onChange={set("orderIndex")}
                                            placeholder="0"
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>

                                <Field label="Address" icon={MapPin}>
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={set("address")}
                                        placeholder="Full street address"
                                        className={inputCls}
                                    />
                                </Field>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                                    <div className="inline-flex rounded-lg border border-gray-600 overflow-hidden">
                                        {["active", "inactive"].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setForm((p) => ({ ...p, status: s }))}
                                                className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${
                                                    form.status === s
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Contact & Access */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                            <h2 className="text-base font-semibold text-gray-100 mb-6">Contact & Access</h2>
                            <div className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <Field label="Phone" icon={Phone}>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={set("phone")}
                                            placeholder="+880 1XXX-XXXXXX"
                                            className={inputCls}
                                        />
                                    </Field>
                                    <Field label="Email" icon={Mail}>
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={set("email")}
                                            placeholder="store@company.com"
                                            className={inputCls}
                                        />
                                    </Field>
                                </div>

                                <Field label="New Password (leave blank to keep current)" icon={Lock}>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={set("password")}
                                        placeholder="Enter a new password to change it"
                                        className={inputCls}
                                        autoComplete="new-password"
                                    />
                                </Field>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pb-10">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 text-sm"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                                ) : (
                                    <><Save className="w-4 h-4" />Save Changes</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EditStore;