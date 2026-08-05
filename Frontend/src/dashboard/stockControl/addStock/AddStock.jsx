import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeft, Box, ShoppingBag, DollarSign, Hash,
    Loader2, Plus, ChevronDown, Package, Search,
} from "lucide-react";
import addStockApi from "@/services/dashboard/stock/addStock";
import getAllProductsApi from "@/services/dashboard/product/getAllProductsApi";

// ─── helpers ──────────────────────────────────────────────────────────────────

const inputCls =
    "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition text-sm";

function Field({ label, icon: Icon, hint, children }) {
    return (
        <div>
            <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                {label}
            </label>
            {children}
            {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
        </div>
    );
}

// Searchable product dropdown
function ProductSelect({ products, value, onChange, isLoading }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = products.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.title?.toLowerCase().includes(q) ||
            p.productId?.toLowerCase().includes(q) ||
            p.group?.brand?.name?.toLowerCase().includes(q)
        );
    });

    const selected = products.find((p) => p.productId === value);

    return (
        <div className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 hover:border-gray-500"
            >
                {selected ? (
                    <div className="flex items-center gap-3 min-w-0">
                        {selected.images?.[0]?.imageURL ? (
                            <img
                                src={selected.images[0].imageURL}
                                alt={selected.title}
                                className="w-8 h-8 rounded-md object-cover flex-shrink-0 border border-gray-600"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-md bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <Package className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                        <div className="min-w-0 text-left">
                            <p className="text-white font-medium truncate">{selected.title}</p>
                            <p className="text-gray-400 text-xs font-mono">#{selected.productId}</p>
                        </div>
                    </div>
                ) : (
                    <span className="text-gray-400">
                        {isLoading ? "Loading products…" : "Select a product"}
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => { setOpen(false); setSearch(""); }}
                />
            )}

            {/* Dropdown — absolute works now that parent has no backdrop-blur */}
            {open && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl shadow-black/60 overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, ID or brand…"
                                className="w-full pl-8 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-xs focus:border-blue-500 focus:outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading && (
                            <div className="flex items-center justify-center py-6 gap-2 text-gray-400 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading…
                            </div>
                        )}

                        {!isLoading && filtered.length === 0 && (
                            <p className="text-center text-gray-500 text-sm py-6">No products found</p>
                        )}

                        {!isLoading && filtered.map((p) => (
                            <button
                                key={p.productId}
                                type="button"
                                onClick={() => {
                                    onChange(p.productId);
                                    setOpen(false);
                                    setSearch("");
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700/80 transition text-sm border-b border-gray-700/40 last:border-b-0 ${value === p.productId ? "bg-blue-600/15" : ""}`}
                            >
                                {p.images?.[0]?.imageURL ? (
                                    <img
                                        src={p.images[0].imageURL}
                                        alt={p.title}
                                        className="w-9 h-9 rounded-md object-cover flex-shrink-0 border border-gray-600"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-md bg-gray-600 flex items-center justify-center flex-shrink-0">
                                        <Package className="w-4 h-4 text-gray-400" />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-medium truncate">{p.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-gray-500 text-xs font-mono">#{p.productId}</span>
                                        {p.group?.brand?.name && (
                                            <span className="text-gray-600 text-xs">· {p.group.brand.name}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-gray-300 text-xs font-medium">৳{Number(p.price).toLocaleString()}</p>
                                    <p className={`text-[10px] mt-0.5 ${p.status === "published" ? "text-green-400" : "text-yellow-400"}`}>
                                        {p.status}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Summary card shown after a product is selected ──────────────────────────

function SelectedProductSummary({ product }) {
    if (!product) return null;
    return (
        <div className="flex items-center gap-4 p-4 bg-blue-600/10 border border-blue-600/25 rounded-xl mt-3">
            {product.images?.[0]?.imageURL ? (
                <img
                    src={product.images[0].imageURL}
                    alt={product.title}
                    className="w-14 h-14 rounded-xl object-cover border border-gray-600 flex-shrink-0"
                />
            ) : (
                <div className="w-14 h-14 rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-500" />
                </div>
            )}
            <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{product.title}</p>
                {product.subTitle && <p className="text-gray-400 text-xs truncate">{product.subTitle}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded font-mono text-[10px]">
                        #{product.productId}
                    </span>
                    {product.group?.brand?.name && (
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-[10px]">
                            {product.group.brand.name}
                        </span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-700 text-blue-400 rounded text-[10px] font-medium">
                        ৳{Number(product.price).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

const INITIAL = {
    productId: "",
    quantity: "",
    purchasingPrice: "",
    status: "available",
};

function AddStock() {
    const navigate = useNavigate();
    const [form, setForm] = useState(INITIAL);

    const { data: productsRes, isLoading: isLoadingProducts } = useQuery({
        queryKey: ["products"],
        queryFn: () => getAllProductsApi(),
        staleTime: 1000 * 60 * 5,
    });

    const products = productsRes?.data || [];
    const selectedProduct = products.find((p) => p.productId === form.productId) ?? null;

    const set = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const { mutate, isPending } = useMutation({
        mutationFn: (stockData) => addStockApi(stockData),
        onSuccess: (data) => {
            if (data?.success) {
                setForm(INITIAL);
                window.showToast("Stock added successfully.", "success");
            } else {
                window.showToast(data?.message || "Failed to add stock.", "error");
            }
        },
        onError: (err) => {
            console.error("Error adding stock:", err);
            window.showToast(
                err?.response?.data?.message || "Failed to add stock.",
                "error"
            );
        },
    });

    const handleSubmit = () => {
        if (!form.productId) return window.showToast("Please select a product.", "error");
        if (!form.quantity || Number(form.quantity) <= 0)
            return window.showToast("Quantity must be greater than 0.", "error");
        if (!form.purchasingPrice || Number(form.purchasingPrice) <= 0)
            return window.showToast("Purchasing price must be greater than 0.", "error");

        mutate({
            productId: form.productId,
            quantity: Number(form.quantity),
            reserved: 0,
            remaining: Number(form.quantity),
            purchasingPrice: Number(form.purchasingPrice),
            status: form.status,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-10">

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
                        Add Stock
                    </h1>
                    <p className="text-gray-400 text-sm">Add new inventory for a product</p>
                </div>

                <div className="space-y-6">

                    {/* Product selection — no backdrop-blur so absolute dropdown escapes correctly */}
                    <section className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 sm:p-8">
                        <h2 className="text-base font-semibold text-gray-100 mb-6">Select Product</h2>

                        <Field label="Product" icon={ShoppingBag}>
                            <ProductSelect
                                products={products}
                                value={form.productId}
                                onChange={(id) => setForm((prev) => ({ ...prev, productId: id }))}
                                isLoading={isLoadingProducts}
                            />
                        </Field>

                        <SelectedProductSummary product={selectedProduct} />
                    </section>

                    {/* Stock details */}
                    <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
                        <h2 className="text-base font-semibold text-gray-100 mb-6">Stock Details</h2>

                        <div className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <Field
                                    label="Quantity"
                                    icon={Box}
                                    hint="Total units being added to inventory"
                                >
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.quantity}
                                        onChange={set("quantity")}
                                        placeholder="e.g. 50"
                                        className={inputCls}
                                    />
                                </Field>

                                <Field
                                    label="Purchasing Price (৳)"
                                    icon={DollarSign}
                                    hint="Cost price per unit"
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.purchasingPrice}
                                        onChange={set("purchasingPrice")}
                                        placeholder="e.g. 2500.00"
                                        className={inputCls}
                                    />
                                </Field>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Status</label>
                                <div className="inline-flex rounded-lg border border-gray-600 overflow-hidden">
                                    {["available", "out-of-stock"].map((s) => (
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

                    {/* Calculated summary */}
                    {form.quantity && form.purchasingPrice && Number(form.quantity) > 0 && Number(form.purchasingPrice) > 0 && (
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
                            <h2 className="text-base font-semibold text-gray-100 mb-4">Summary</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "Units", value: Number(form.quantity).toLocaleString() },
                                    { label: "Unit Cost", value: `৳${Number(form.purchasingPrice).toLocaleString()}` },
                                    {
                                        label: "Total Value",
                                        value: `৳${(Number(form.quantity) * Number(form.purchasingPrice)).toLocaleString()}`,
                                        highlight: true,
                                    },
                                ].map(({ label, value, highlight }) => (
                                    <div key={label} className={`p-3 rounded-xl border text-center ${highlight ? "bg-blue-600/15 border-blue-600/30" : "bg-gray-700/50 border-gray-600/50"}`}>
                                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                                        <p className={`text-sm font-bold ${highlight ? "text-blue-300" : "text-white"}`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Note about Stock ID */}
                    <div className="flex items-start gap-3 px-4 py-3 bg-gray-700/30 border border-gray-700/50 rounded-xl">
                        <Hash className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-500">
                            Stock ID is assigned automatically by the system. You don't need to provide one.
                        </p>
                    </div>

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
                                <><Plus className="w-4 h-4" />Add Stock</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddStock;