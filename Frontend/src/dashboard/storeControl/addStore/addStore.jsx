import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Store, Mail, Phone, MapPin, Hash,
    Lock, SortAsc, Loader2, Plus,
} from "lucide-react";
import addStoreApi from "@/services/dashboard/store/addStoreApi";

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
};

function AddStore() {
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL);

    const set = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => addStoreApi(data),
        onSuccess: (data) => {
            if (data?.success) {
                setForm(INITIAL);
                window.showToast("Store added successfully!", "success");
            } else {
                window.showToast(data?.message || "Failed to add store.", "error");
            }
        },
        onError: (err) => {
            console.error("Error adding store:", err);
            window.showToast("Failed to add store. Please try again.", "error");
        },
    });

    const handleSubmit = () => {
        if (!form.title.trim()) return window.showToast("Store title is required.", "error");
        if (!form.address.trim()) return window.showToast("Address is required.", "error");
        if (!form.phone.trim()) return window.showToast("Phone is required.", "error");
        if (!form.email.trim()) return window.showToast("Email is required.", "error");
        if (!form.password.trim()) return window.showToast("Password is required.", "error");

        mutate({
            ...form
        });
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
                        Add Store
                    </h1>
                    <p className="text-gray-400 text-sm">Create a new store location</p>
                </div>

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
                                        required
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


                            <Field label="Address" icon={MapPin}>
                                <input
                                    type="text"
                                    value={form.address}
                                    onChange={set("address")}
                                    placeholder="Full street address"
                                    className={inputCls}
                                    required
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

                    {/* Contact */}
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
                                        required
                                    />
                                </Field>
                                <Field label="Email" icon={Mail}>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={set("email")}
                                        placeholder="store@company.com"
                                        className={inputCls}
                                        required
                                    />
                                </Field>
                            </div>

                            <Field label="Password" icon={Lock}>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={set("password")}
                                    placeholder="Store login password"
                                    className={inputCls}
                                    required
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
                            disabled={isPending}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 text-sm"
                        >
                            {isPending ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Adding…</>
                            ) : (
                                <><Plus className="w-4 h-4" />Add Store</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddStore;