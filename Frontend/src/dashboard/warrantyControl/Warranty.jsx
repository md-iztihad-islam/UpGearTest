import Toast from "@/components/toast/Toast";
import addWarrantyApi from "@/services/dashboard/warrenty/addWarrantyApi";
import deleteWarrantyApi from "@/services/dashboard/warrenty/deleteWarrantyApi";
import getAllWarrantiesApi from "@/services/dashboard/warrenty/getAllWarrantiesApi";
import updateWarrantyApi from "@/services/dashboard/warrenty/updateWarrantyApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    ShieldCheck, Loader2, AlertTriangle, Plus, RefreshCw, Eye, EyeOff,
    Trash2, Pencil, X, ArrowUpDown, FileText, Type, ChevronDown, ChevronUp, Search
} from "lucide-react";
import { useState } from "react";

const EMPTY_FORM = { title: "", subTitle: "", description: "", isActive: true };

function ConfirmDialog({ message, subMessage, confirmLabel, confirmClass, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-gray-950 shadow-2xl p-5">
                <div className="flex gap-3 mb-5">
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
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

function Field({ label, icon: Icon, iconColor = "text-gray-500", children, hint }) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} />{label}
            </label>
            {children}
            {hint && <p className="text-[0.67rem] text-gray-600">{hint}</p>}
        </div>
    );
}

const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all";

function WarrantyForm({ initial = EMPTY_FORM, onSubmit, isPending, onCancel, isEdit = false }) {
    const [form, setForm] = useState(initial);
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return Toast("Title is required", "error");
        onSubmit({
            title: form.title.trim(),
            subTitle: form.subTitle.trim() || null,
            description: form.description.trim() || null,
            status: form.isActive ? "Active" : "Inactive",
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Title" icon={ShieldCheck} iconColor="text-blue-400">
                    <input className={inputCls} value={form.title} onChange={set("title")} placeholder="e.g. 1 Year Warranty" required />
                </Field>
                <Field label="Subtitle" icon={Type} iconColor="text-blue-400" hint="Optional">
                    <input className={inputCls} value={form.subTitle} onChange={set("subTitle")} placeholder="e.g. Manufacturer warranty" />
                </Field>
            </div>
            <Field label="Description" icon={FileText} iconColor="text-orange-400" hint="Optional">
                <textarea className={`${inputCls} resize-none`} value={form.description} onChange={set("description")} placeholder="Warranty terms and details" rows={3} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Status" icon={Eye} iconColor="text-gray-400">
                    <div className="flex items-center gap-3 h-10">
                        <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-emerald-600" : "bg-gray-700"}`}
                        >
                            <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                        <span className={`text-sm font-semibold ${form.isActive ? "text-emerald-400" : "text-gray-500"}`}>
                            {form.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                </Field>
            </div>
            <div className="flex items-center gap-3 pt-1">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors">
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:text-blue-400 text-white transition-all active:scale-95 disabled:cursor-not-allowed"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isPending ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save changes" : "Add warranty")}
                </button>
            </div>
        </form>
    );
}

function SkeletonRow() {
    return (
        <div className="border border-white/5 rounded-xl px-4 py-3.5 animate-pulse bg-white/[0.015]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                    <div className="h-2.5 bg-white/5 rounded w-1/2" />
                </div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 sm:w-16 bg-white/5 rounded-lg" />
                    <div className="h-8 w-8 sm:w-24 bg-white/5 rounded-lg" />
                    <div className="h-8 w-8 sm:w-16 bg-white/5 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ active }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase whitespace-nowrap ${active ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400" : "bg-white/5 border border-white/10 text-gray-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-emerald-400" : "bg-gray-600"}`} />
            {active ? "Live" : "Hidden"}
        </span>
    );
}

function WarrantyRow({ warranty, onToggle, onDelete, onEdit, isTogglePending, isDeletePending }) {
    const [confirmAction, setConfirmAction] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const isActive = warranty.status === "Active";

    const handleConfirm = () => {
        if (confirmAction === "toggle") onToggle(warranty.warrantyId, !isActive);
        if (confirmAction === "delete") onDelete(warranty.warrantyId);
        setConfirmAction(null);
    };

    const dialogProps = confirmAction === "delete"
        ? { message: "Delete this warranty?", subMessage: "This is permanent and cannot be undone.", confirmLabel: "Delete", confirmClass: "bg-red-600 hover:bg-red-700" }
        : isActive
            ? { message: "Deactivate this warranty?", subMessage: "It won't be selectable for new groups.", confirmLabel: "Deactivate", confirmClass: "bg-amber-500 hover:bg-amber-600" }
            : { message: "Activate this warranty?", subMessage: "It will be available immediately.", confirmLabel: "Activate", confirmClass: "bg-emerald-600 hover:bg-emerald-700" };

    return (
        <>
            {confirmAction && <ConfirmDialog {...dialogProps} onConfirm={handleConfirm} onCancel={() => setConfirmAction(null)} />}
            <div className={`group relative border rounded-xl transition-all duration-200 ${isActive ? "border-white/8 hover:border-white/14 bg-white/[0.02]" : "border-white/5 hover:border-white/8 bg-transparent opacity-55 hover:opacity-85"}`}>
                {isActive && <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-emerald-500/60" />}
                <div className="flex items-center gap-3 px-4 py-3.5 min-w-0">
                    <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${isActive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/8"}`}>
                        <ShieldCheck className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-gray-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">{warranty.title}</span>
                            <StatusBadge active={isActive} />
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">{warranty.subTitle || "No subtitle"}</p>
                    </div>
                    <button onClick={() => setExpanded((v) => !v)} className="shrink-0 p-2 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors">
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => onEdit(warranty)}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95"
                        >
                            <Pencil className="w-3.5 h-3.5" /><span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                            onClick={() => setConfirmAction("toggle")}
                            disabled={isTogglePending || isDeletePending}
                            className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${isActive ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"}`}
                        >
                            {isTogglePending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isActive ? "Deactivate" : "Activate"}</span>
                        </button>
                        <button
                            onClick={() => setConfirmAction("delete")}
                            disabled={isTogglePending || isDeletePending}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isDeletePending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
                {expanded && (
                    <div className="px-4 pb-3.5 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/5 pt-3">
                        {[
                            { label: "Description", value: warranty.description || "None" },
                            { label: "Created", value: warranty.createdAt ? format(new Date(warranty.createdAt), "MMM d, yyyy") : "—" },
                            { label: "Updated", value: warranty.updatedAt ? format(new Date(warranty.updatedAt), "MMM d, yyyy") : "—" },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-white/[0.025] rounded-lg px-3 py-2">
                                <p className="text-[0.62rem] font-bold uppercase tracking-wide text-gray-600">{label}</p>
                                <p className="text-xs text-gray-300 mt-1 break-words">{value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function EditPanel({ warranty, onSave, onCancel, isPending }) {
    const initial = {
        title: warranty.title ?? "",
        subTitle: warranty.subTitle ?? "",
        description: warranty.description ?? "",
        isActive: warranty.status === "Active",
    };
    return (
        <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
                <span className="flex items-center gap-2 text-sm font-semibold text-blue-300">
                    <Pencil className="w-4 h-4 text-blue-400" />
                    Editing — <span className="text-white">{warranty.title}</span>
                </span>
                <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <WarrantyForm initial={initial} onSubmit={onSave} isPending={isPending} onCancel={onCancel} isEdit />
        </div>
    );
}

function EmptyState({ hasSearch, onAdd }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-gray-700" />
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-1.5">{hasSearch ? "No matching warranties" : "No warranties yet"}</p>
            <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                {hasSearch ? "Try a different search term." : "Create a warranty to assign to your product groups."}
            </p>
            {!hasSearch && (
                <button onClick={onAdd} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95">
                    <Plus className="w-4 h-4" />Create first warranty
                </button>
            )}
        </div>
    );
}

function Warranty() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingWarranty, setEditingWarranty] = useState(null);
    const [search, setSearch] = useState("");

    const { data: warrantyData, isLoading, isFetching, refetch } = useQuery({
        queryKey: ["warranties"],
        queryFn: getAllWarrantiesApi,
        staleTime: 2 * 60 * 1000,
    });

    const { mutate: addWarranty, isPending: isAdding } = useMutation({
        mutationFn: addWarrantyApi,
        onSuccess: () => { Toast("Warranty created", "success"); setShowAddForm(false); refetch(); },
        onError: () => Toast("Failed to create warranty", "error"),
    });

    const { mutate: updateWarranty, isPending: isUpdating } = useMutation({
        mutationFn: ({ warrantyId, data }) => updateWarrantyApi(warrantyId, data),
        onSuccess: (_, { isToggle }) => { Toast(isToggle ? "Warranty updated" : "Warranty saved", "success"); setEditingWarranty(null); refetch(); },
        onError: () => Toast("Failed to update warranty", "error"),
    });

    const { mutate: deleteWarranty, isPending: isDeleting } = useMutation({
        mutationFn: deleteWarrantyApi,
        onSuccess: () => { Toast("Warranty deleted", "success"); refetch(); },
        onError: () => Toast("Failed to delete warranty", "error"),
    });

    const allWarranties = warrantyData?.data ?? [];
    const query = search.trim().toLowerCase();
    const warranties = query
        ? allWarranties.filter((w) => (w.title + " " + (w.subTitle || "") + " " + (w.description || "")).toLowerCase().includes(query))
        : allWarranties;
    const activeCount = allWarranties.filter((w) => w.status === "Active").length;

    return (
        <div className="w-full px-4 sm:px-8 py-6 sm:py-10">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-blue-500 mb-2">Dashboard / Warranties</p>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Warranty manager</h1>
                            <p className="mt-1.5 text-sm text-gray-500">Create, edit, and manage warranty plans for your product groups.</p>
                        </div>
                        <button
                            onClick={() => { setShowAddForm((v) => !v); setEditingWarranty(null); }}
                            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 ${showAddForm ? "bg-white/10 border border-white/15 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
                        >
                            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {showAddForm ? "Cancel" : "New warranty"}
                        </button>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-6" />

                {/* Add Form */}
                {showAddForm && (
                    <div className="mb-6 border border-white/8 bg-white/[0.02] rounded-xl p-6">
                        <p className="text-sm font-semibold text-gray-400 mb-5 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-blue-400" />New warranty
                        </p>
                        <WarrantyForm onSubmit={addWarranty} isPending={isAdding} onCancel={() => setShowAddForm(false)} />
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.03] border border-white/8 rounded-xl">
                        <span className="text-sm font-semibold text-gray-300">All</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-gray-300">{allWarranties.length}</span>
                        <span className="w-px h-3.5 bg-white/10" />
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{activeCount} live
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />{allWarranties.length - activeCount} hidden
                        </span>
                    </div>
                    <button
                        onClick={refetch}
                        disabled={isFetching}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 bg-white/[0.04] hover:bg-white/8 border border-white/8 transition-all disabled:opacity-50 active:scale-95"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />Refresh
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-5">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search warranties by title, subtitle, or description…"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-gray-600 hover:text-gray-400 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}</div>
                ) : warranties.length === 0 ? (
                    <EmptyState hasSearch={!!query} onAdd={() => { setShowAddForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                ) : (
                    <div className="space-y-3">
                        {warranties.map((warranty) => (
                            <div key={warranty.warrantyId}>
                                {editingWarranty?.warrantyId === warranty.warrantyId ? (
                                    <EditPanel
                                        warranty={warranty}
                                        isPending={isUpdating}
                                        onCancel={() => setEditingWarranty(null)}
                                        onSave={(data) => updateWarranty({ warrantyId: warranty.warrantyId, data })}
                                    />
                                ) : (
                                    <WarrantyRow
                                        warranty={warranty}
                                        onToggle={(id, isActive) => updateWarranty({ warrantyId: id, data: { status: isActive ? "Active" : "Inactive" }, isToggle: true })}
                                        onDelete={deleteWarranty}
                                        onEdit={(w) => { setEditingWarranty(w); setShowAddForm(false); }}
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

export default Warranty;