import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Toast from "@/components/toast/Toast";
import addCouponApi from "@/services/dashboard/coupon/addCouponApi";
import updateCouponApi from "@/services/dashboard/coupon/updateCouponApi";
import deleteCouponApi from "@/services/dashboard/coupon/deleteCouponApi";
import getActiveCouponApi from "@/services/dashboard/coupon/getActiveCouponApi";
import getDeactivateCouponApi from "@/services/dashboard/coupon/getDeactiveCouponApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    CalendarIcon, Percent, DollarSign, Users, Tag, Loader2,
    AlertTriangle, Plus, RefreshCw, Eye, EyeOff, Trash2,
    Pencil, X, Hash, ShoppingCart, ArrowUpDown, ChevronDown, ChevronUp, Search
} from "lucide-react";
import { useState } from "react";

/* ─── Helpers ───────────────────────────────────────────────────── */
const EMPTY_FORM = {
    title: "",
    code: "",
    discountPCT: "",
    discountAMT: "",
    maxUsageLimit: "",
    minOrderAmount: "",
    expiryDate: null,
    isActive: true,
};

function fmt(val) {
    if (val === null || val === undefined || val === "") return "—";
    return val;
}

function discountLabel(coupon) {
    if (coupon.discountPCT) return `${coupon.discountPCT}% OFF`;
    if (coupon.discountAMT) return `$${coupon.discountAMT} OFF`;
    return "—";
}

/* ─── Confirm Dialog ────────────────────────────────────────────── */
function ConfirmDialog({ message, subMessage, confirmLabel, confirmClass, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-gray-950 shadow-2xl p-5">
                <div className="flex gap-3.5 mb-5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle style={{ width: "1.05rem", height: "1.05rem" }} className="text-red-400" />
                    </div>
                    <div className="pt-0.5 min-w-0">
                        <p className="text-sm font-semibold text-white leading-snug">{message}</p>
                        {subMessage && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{subMessage}</p>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="flex-1 px-3 py-2 text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className={`flex-1 px-3 py-2 text-xs font-semibold text-white rounded-xl transition-all active:scale-95 ${confirmClass}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Field ─────────────────────────────────────────────────────── */
function Field({ label, icon: Icon, iconColor = "text-gray-500", children, hint }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                {label}
            </label>
            {children}
            {hint && <p className="text-[0.67rem] text-gray-600">{hint}</p>}
        </div>
    );
}

function Input({ className = "", ...props }) {
    return (
        <input
            className={`w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all ${className}`}
            {...props}
        />
    );
}

/* ─── Coupon Form (Add / Edit) ──────────────────────────────────── */
function CouponForm({ initial = EMPTY_FORM, onSubmit, isPending, onCancel, isEdit = false }) {
    const [form, setForm] = useState(initial);
    const [calOpen, setCalOpen] = useState(false);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return Toast("Title is required", "error");
        if (!form.code.trim()) return Toast("Coupon code is required", "error");
        if (!form.discountPCT && !form.discountAMT) return Toast("Enter either a % or $ discount", "error");
        onSubmit({
            title: form.title.trim(),
            code: form.code.trim().toUpperCase(),
            discountPCT: form.discountPCT !== "" ? Number(form.discountPCT) : null,
            discountAMT: form.discountAMT !== "" ? Number(form.discountAMT) : null,
            maxUsageLimit: form.maxUsageLimit !== "" ? Number(form.maxUsageLimit) : null,
            minOrderAmount: form.minOrderAmount !== "" ? Number(form.minOrderAmount) : null,
            expiryDate: form.expiryDate ? form.expiryDate.toISOString() : null,
            isActive: form.isActive,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: title + code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Title" icon={Tag} iconColor="text-blue-400">
                    <Input value={form.title} onChange={set("title")} placeholder="e.g., Summer Sale" required />
                </Field>
                <Field label="Code" icon={Hash} iconColor="text-blue-400">
                    <Input
                        value={form.code}
                        onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g., SUMMER25"
                        className="uppercase tracking-widest font-mono"
                        required
                    />
                </Field>
            </div>

            {/* Row 2: discounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Discount %" icon={Percent} iconColor="text-emerald-400" hint="Leave blank if using fixed amount">
                    <Input value={form.discountPCT} onChange={set("discountPCT")} type="number" min="0" max="100" step="0.01" placeholder="0" />
                </Field>
                <Field label="Discount $" icon={DollarSign} iconColor="text-emerald-400" hint="Leave blank if using percentage">
                    <Input value={form.discountAMT} onChange={set("discountAMT")} type="number" min="0" step="0.01" placeholder="0.00" />
                </Field>
            </div>

            {/* Row 3: limits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Max Uses" icon={Users} iconColor="text-purple-400" hint="Blank = unlimited">
                    <Input value={form.maxUsageLimit} onChange={set("maxUsageLimit")} type="number" min="0" placeholder="Unlimited" />
                </Field>
                <Field label="Min Order $" icon={ShoppingCart} iconColor="text-orange-400" hint="Blank = no minimum">
                    <Input value={form.minOrderAmount} onChange={set("minOrderAmount")} type="number" min="0" step="0.01" placeholder="0.00" />
                </Field>
            </div>

            {/* Row 4: expiry + status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Expiry Date" icon={CalendarIcon} iconColor="text-orange-400">
                    <Popover open={calOpen} onOpenChange={setCalOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="w-full flex items-center gap-2 bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 text-sm text-left transition-all"
                            >
                                <CalendarIcon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                {form.expiryDate
                                    ? <span className="text-white">{format(form.expiryDate, "PPP")}</span>
                                    : <span className="text-gray-600">No expiry</span>
                                }
                                {form.expiryDate && (
                                    <X
                                        className="w-3 h-3 text-gray-600 hover:text-gray-400 ml-auto flex-shrink-0"
                                        onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, expiryDate: null })); }}
                                    />
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-900 border-white/10 z-50">
                            <Calendar
                                mode="single"
                                selected={form.expiryDate}
                                onSelect={(d) => { setForm((f) => ({ ...f, expiryDate: d })); setCalOpen(false); }}
                                className="bg-gray-900 text-white"
                            />
                        </PopoverContent>
                    </Popover>
                </Field>

                <Field label="Status" icon={Eye} iconColor="text-gray-400">
                    <div className="flex items-center gap-2 h-9">
                        <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isActive ? "bg-emerald-600" : "bg-gray-700"}`}
                        >
                            <span className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                        <span className={`text-xs font-semibold ${form.isActive ? "text-emerald-400" : "text-gray-500"}`}>
                            {form.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </Field>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 border border-white/8 rounded-xl transition-colors">
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-400 text-white transition-all active:scale-95 disabled:cursor-not-allowed"
                >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isEdit ? <Pencil className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {isPending ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save changes" : "Add coupon")}
                </button>
            </div>
        </form>
    );
}

/* ─── Skeleton ──────────────────────────────────────────────────── */
function SkeletonRow() {
    return (
        <div className="border border-white/5 rounded-xl px-3 py-2.5 animate-pulse bg-white/[0.015]">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-white/5 rounded w-1/3" />
                    <div className="h-2 bg-white/5 rounded w-1/2" />
                </div>
                <div className="flex gap-1.5">
                    <div className="h-7 w-7 sm:w-16 bg-white/5 rounded-lg" />
                    <div className="h-7 w-7 sm:w-16 bg-white/5 rounded-lg" />
                    <div className="h-7 w-7 sm:w-14 bg-white/5 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/* ─── Status Badge ──────────────────────────────────────────────── */
function StatusBadge({ active }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.62rem] font-bold tracking-wide uppercase whitespace-nowrap ${
            active
                ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                : "bg-white/5 border border-white/10 text-gray-500"
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? "bg-emerald-400" : "bg-gray-600"}`} />
            {active ? "Live" : "Hidden"}
        </span>
    );
}

/* ─── Coupon Row ────────────────────────────────────────────────── */
function CouponRow({ coupon, onToggle, onDelete, onEdit, isTogglePending, isDeletePending }) {
    const [confirmAction, setConfirmAction] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const handleConfirm = () => {
        if (confirmAction === "toggle") onToggle(coupon.couponId, !coupon.isActive);
        if (confirmAction === "delete") onDelete(coupon.couponId);
        setConfirmAction(null);
    };

    const dialogProps = confirmAction === "delete"
        ? { message: "Delete this coupon?", subMessage: "This is permanent and cannot be undone.", confirmLabel: "Delete", confirmClass: "bg-red-600 hover:bg-red-700" }
        : coupon.isActive
            ? { message: "Deactivate this coupon?", subMessage: "Customers won't be able to use it.", confirmLabel: "Deactivate", confirmClass: "bg-amber-500 hover:bg-amber-600" }
            : { message: "Activate this coupon?", subMessage: "It will be usable by customers immediately.", confirmLabel: "Activate", confirmClass: "bg-emerald-600 hover:bg-emerald-700" };

    return (
        <>
            {confirmAction && (
                <ConfirmDialog {...dialogProps} onConfirm={handleConfirm} onCancel={() => setConfirmAction(null)} />
            )}

            <div className={`group relative border rounded-xl transition-all duration-200 ${
                coupon.isActive
                    ? "border-white/8 hover:border-white/14 bg-white/[0.02]"
                    : "border-white/5 hover:border-white/8 bg-transparent opacity-55 hover:opacity-85"
            }`}>
                {coupon.isActive && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-emerald-500/60" />
                )}

                {/* Main row */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 min-w-0">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
                        coupon.isActive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/8"
                    }`}>
                        <Tag className={`w-3.5 h-3.5 ${coupon.isActive ? "text-emerald-400" : "text-gray-600"}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-white font-mono tracking-wider truncate">{coupon.code}</span>
                            <StatusBadge active={coupon.isActive} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[0.68rem] text-gray-500 truncate">{coupon.title}</span>
                            <span className="text-[0.65rem] font-semibold text-blue-400 flex-shrink-0">{discountLabel(coupon)}</span>
                            {(coupon.usedCount !== undefined) && (
                                <span className="text-[0.62rem] text-gray-600 flex-shrink-0">
                                    {coupon.usedCount}/{coupon.maxUsageLimit ?? "∞"} used
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Expand toggle */}
                    <button
                        onClick={() => setExpanded((v) => !v)}
                        className="flex-shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors"
                        title="Details"
                    >
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                            onClick={() => onEdit(coupon)}
                            title="Edit"
                            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[0.68rem] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95"
                        >
                            <Pencil className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button
                            onClick={() => setConfirmAction("toggle")}
                            disabled={isTogglePending || isDeletePending}
                            title={coupon.isActive ? "Deactivate" : "Activate"}
                            className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[0.68rem] font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                                coupon.isActive
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                        >
                            {isTogglePending ? <Loader2 className="w-3 h-3 animate-spin" /> : coupon.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span className="hidden sm:inline">{coupon.isActive ? "Deactivate" : "Activate"}</span>
                        </button>

                        <button
                            onClick={() => setConfirmAction("delete")}
                            disabled={isTogglePending || isDeletePending}
                            title="Delete"
                            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[0.68rem] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isDeletePending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>

                {/* Expanded detail strip */}
                {expanded && (
                    <div className="px-3 pb-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-white/5 pt-2.5">
                        {[
                            { label: "Min Order", value: coupon.minOrderAmount ? `$${coupon.minOrderAmount}` : "None" },
                            { label: "Max Uses", value: coupon.maxUsageLimit ?? "Unlimited" },
                            { label: "Expires", value: coupon.expiryDate ? format(new Date(coupon.expiryDate), "MMM d, yyyy") : "Never" },
                            { label: "Created", value: coupon.createdAt ? format(new Date(coupon.createdAt), "MMM d, yyyy") : "—" },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-white/[0.025] rounded-lg px-2.5 py-1.5">
                                <p className="text-[0.6rem] font-bold uppercase tracking-wide text-gray-600">{label}</p>
                                <p className="text-xs text-gray-300 mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

/* ─── Edit Drawer (inline) ──────────────────────────────────────── */
function EditPanel({ coupon, onSave, onCancel, isPending }) {
    const initial = {
        title: coupon.title ?? "",
        code: coupon.code ?? "",
        discountPCT: coupon.discountPCT ?? "",
        discountAMT: coupon.discountAMT ?? "",
        maxUsageLimit: coupon.maxUsageLimit ?? "",
        minOrderAmount: coupon.minOrderAmount ?? "",
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate) : null,
        isActive: coupon.isActive ?? true,
    };

    return (
        <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Pencil className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-300">Editing — <span className="font-mono text-white">{coupon.code}</span></span>
                </div>
                <button onClick={onCancel} className="p-1 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <CouponForm
                initial={initial}
                onSubmit={onSave}
                isPending={isPending}
                onCancel={onCancel}
                isEdit
            />
        </div>
    );
}

/* ─── Empty State ───────────────────────────────────────────────── */
function EmptyState({ tab, hasSearch, onAdd }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-4">
                <Tag className="w-5 h-5 text-gray-700" />
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-1">
                {hasSearch
                    ? "No matching coupons"
                    : tab === "active" ? "No live coupons" : "No inactive coupons"}
            </p>
            <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                {hasSearch
                    ? "Try a different search term."
                    : tab === "active" ? "Create a coupon to offer discounts to your customers." : "All your coupons are currently live."}
            </p>
            {tab === "active" && !hasSearch && (
                <button onClick={onAdd} className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95">
                    <Plus className="w-3.5 h-3.5" />
                    Create first coupon
                </button>
            )}
        </div>
    );
}

/* ─── Coupon Manager ────────────────────────────────────────────── */
function CouponManager() {
    const [tab, setTab] = useState("active");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null); // coupon object being edited
    const [search, setSearch] = useState("");

    /* queries */
    const {
        data: activeData, isLoading: activeLoading,
        refetch: refetchActive, isFetching: activeFetching
    } = useQuery({ queryKey: ["activeCoupons"], queryFn: getActiveCouponApi });

    const {
        data: inactiveData, isLoading: inactiveLoading,
        refetch: refetchInactive, isFetching: inactiveFetching
    } = useQuery({ queryKey: ["inactiveCoupons"], queryFn: getDeactivateCouponApi });

    const refetchBoth = () => { refetchActive(); refetchInactive(); };

    /* add */
    const { mutate: addCoupon, isPending: isAdding } = useMutation({
        mutationFn: addCouponApi,
        onSuccess: () => { Toast("Coupon created", "success"); setShowAddForm(false); refetchBoth(); },
        onError: () => Toast("Failed to create coupon", "error"),
    });

    /* update (toggle or edit) */
    const { mutate: updateCoupon, isPending: isUpdating } = useMutation({
        mutationFn: ({ couponId, data }) => updateCouponApi(couponId, data),
        onSuccess: (_, { isToggle }) => {
            Toast(isToggle ? "Coupon updated" : "Coupon saved", "success");
            setEditingCoupon(null);
            refetchBoth();
        },
        onError: () => Toast("Failed to update coupon", "error"),
    });

    /* delete */
    const { mutate: deleteCoupon, isPending: isDeleting } = useMutation({
        mutationFn: deleteCouponApi,
        onSuccess: () => { Toast("Coupon deleted", "success"); refetchBoth(); },
        onError: () => Toast("Failed to delete coupon", "error"),
    });

    const activeCoupons = activeData?.data ?? [];
    const inactiveCoupons = inactiveData?.data ?? [];
    const isLoading = tab === "active" ? activeLoading : inactiveLoading;
    const isFetching = tab === "active" ? activeFetching : inactiveFetching;
    const rawCoupons = tab === "active" ? activeCoupons : inactiveCoupons;

    const query = search.trim().toLowerCase();
    const coupons = query
        ? rawCoupons.filter((c) =>
            c.code?.toLowerCase().includes(query) ||
            c.title?.toLowerCase().includes(query)
        )
        : rawCoupons;

    const tabs = [
        { key: "active", label: "Live", count: activeCoupons.length, dot: "bg-emerald-400" },
        { key: "inactive", label: "Inactive", count: inactiveCoupons.length, dot: "bg-gray-600" },
    ];

    return (
        <div className="w-full px-3 sm:px-6 py-5 sm:py-8">
            <div className="max-w-3xl mx-auto">

                {/* ── Header ── */}
                <div className="mb-5">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-blue-500 mb-2">
                        Dashboard / Coupons
                    </p>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                                Coupon Manager
                            </h1>
                            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                                Create, edit, and manage discount codes for your storefront.
                            </p>
                        </div>
                        <button
                            onClick={() => { setShowAddForm((v) => !v); setEditingCoupon(null); }}
                            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-lg ${
                                showAddForm
                                    ? "bg-white/10 border border-white/15 text-white shadow-none"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30"
                            }`}
                        >
                            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            {showAddForm ? "Cancel" : "New Coupon"}
                        </button>
                    </div>
                </div>

                {/* ── Divider ── */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-5" />

                {/* ── Add Form ── */}
                {showAddForm && (
                    <div className="mb-5 border border-white/8 bg-white/[0.02] rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 mb-4 flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-blue-400" />
                            New Coupon
                        </p>
                        <CouponForm onSubmit={addCoupon} isPending={isAdding} onCancel={() => setShowAddForm(false)} />
                    </div>
                )}

                {/* ── Toolbar ── */}
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                    <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-xl">
                        {tabs.map(({ key, label, count, dot }) => {
                            const active = tab === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => { setTab(key); setEditingCoupon(null); }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        active ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                    }`}
                                >
                                    {label}
                                    <span className={`inline-flex items-center gap-1 text-[0.62rem] font-bold px-1.5 py-0.5 rounded-md ${
                                        active ? "bg-white/10 text-gray-300" : "bg-white/5 text-gray-600"
                                    }`}>
                                        {active && <span className={`w-1 h-1 rounded-full ${dot}`} />}
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={refetchBoth}
                        disabled={isFetching}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 bg-white/[0.04] hover:bg-white/8 border border-white/8 transition-all disabled:opacity-50 active:scale-95"
                    >
                        <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* ── Search ── */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search coupons by code or title…"
                        className="pl-9"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-600 hover:text-gray-400 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* ── Content ── */}
                {isLoading ? (
                    <div className="space-y-2.5">
                        {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
                    </div>
                ) : coupons.length === 0 ? (
                    <EmptyState tab={tab} hasSearch={!!query} onAdd={() => { setShowAddForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                ) : (
                    <div className="space-y-2.5">
                        {coupons.map((coupon) => (
                            <div key={coupon.couponId}>
                                {editingCoupon?.couponId === coupon.couponId ? (
                                    <EditPanel
                                        coupon={coupon}
                                        isPending={isUpdating}
                                        onCancel={() => setEditingCoupon(null)}
                                        onSave={(data) => updateCoupon({ couponId: coupon.couponId, data })}
                                    />
                                ) : (
                                    <CouponRow
                                        coupon={coupon}
                                        onToggle={(id, isActive) => updateCoupon({ couponId: id, data: { isActive }, isToggle: true })}
                                        onDelete={deleteCoupon}
                                        onEdit={(c) => { setEditingCoupon(c); setShowAddForm(false); }}
                                        isTogglePending={isUpdating}
                                        isDeletePending={isDeleting}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CouponManager;