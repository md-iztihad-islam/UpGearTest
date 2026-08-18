import Toast from "@/components/toast/Toast";
import addBrandApi from "@/services/dashboard/brand/addBrandApi";
import updateBrandApi from "@/services/dashboard/brand/updateBrandApi";
import deleteBrandApi from "@/services/dashboard/brand/deleteBrandApi";
import getAllBrandsApi from "@/services/dashboard/brand/getAllBrandsApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    Tag, Loader2, AlertTriangle, Plus, RefreshCw, Trash2,
    Pencil, X, Link2, FileText, Package, ChevronDown, ChevronUp, Search
} from "lucide-react";
import { useState } from "react";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";

/* ─── Helpers ───────────────────────────────────────────────────── */
const EMPTY_FORM = {
    title: "",
    subCategoryId: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
};

function slugify(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

// Builds "title-subcategoryTitle" then slugifies the combined string
function buildSlug(title, subCategoryTitle) {
    const parts = [title, subCategoryTitle].filter((p) => p && p.trim());
    return slugify(parts.join("-"));
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

function Textarea({ className = "", ...props }) {
    return (
        <textarea
            className={`w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none ${className}`}
            {...props}
        />
    );
}

function Select({ className = "", children, ...props }) {
    return (
        <select
            className={`w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}

/* ─── Brand Form (Add / Edit) ───────────────────────────────────── */
function BrandForm({ initial = EMPTY_FORM, onSubmit, isPending, onCancel, isEdit = false, subcategories = [], subcategoriesLoading = false }) {
    const [form, setForm] = useState(initial);
    const [slugTouched, setSlugTouched] = useState(isEdit);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const getSubCategoryTitle = (subCategoryId) =>
        subcategories.find((sc) => sc.subCategoryId === subCategoryId)?.title ?? "";

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setForm((f) => ({
            ...f,
            title,
            slug: slugTouched ? f.slug : buildSlug(title, getSubCategoryTitle(f.subCategoryId)),
        }));
    };

    const handleSubCategoryChange = (e) => {
        const subCategoryId = e.target.value;
        setForm((f) => ({
            ...f,
            subCategoryId,
            slug: slugTouched ? f.slug : buildSlug(f.title, getSubCategoryTitle(subCategoryId)),
        }));
    };

    const handleSlugChange = (e) => {
        setSlugTouched(true);
        setForm((f) => ({ ...f, slug: slugify(e.target.value) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return Toast("Title is required", "error");
        if (!form.subCategoryId) return Toast("Sub category is required", "error");
        if (!form.slug.trim()) return Toast("Slug is required", "error");
        onSubmit({
            title: form.title.trim(),
            subCategoryId: form.subCategoryId,
            slug: form.slug.trim(),
            metaTitle: form.metaTitle.trim() || null,
            metaDescription: form.metaDescription.trim() || null,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: title + subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Title" icon={Tag} iconColor="text-blue-400">
                    <Input value={form.title} onChange={handleTitleChange} placeholder="e.g., Samsung" required />
                </Field>
                <Field label="Sub Category" icon={Package} iconColor="text-purple-400">
                    <Select
                        value={form.subCategoryId}
                        onChange={handleSubCategoryChange}
                        required
                        disabled={subcategoriesLoading}
                    >
                        <option value="" disabled className="bg-gray-950">
                            {subcategoriesLoading ? "Loading…" : "Select a sub category"}
                        </option>
                        {subcategories.map((sc) => (
                            <option key={sc.subCategoryId} value={sc.subCategoryId} className="bg-gray-950">
                                {sc.title}
                            </option>
                        ))}
                    </Select>
                </Field>
            </div>

            {/* Row 2: slug */}
            <Field label="Slug" icon={Link2} iconColor="text-emerald-400" hint="Auto-generated from title + sub category, editable">
                <Input
                    value={form.slug}
                    onChange={handleSlugChange}
                    placeholder="e.g., samsung"
                    className="font-mono"
                    required
                />
            </Field>

            {/* Row 3: meta title + description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Meta Title" icon={FileText} iconColor="text-orange-400" hint="Optional, for SEO">
                    <Input value={form.metaTitle} onChange={set("metaTitle")} placeholder="SEO title" />
                </Field>
                <Field label="Meta Description" icon={FileText} iconColor="text-orange-400" hint="Optional, for SEO">
                    <Textarea value={form.metaDescription} onChange={set("metaDescription")} placeholder="SEO description" rows={1} />
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
                    {isPending ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save changes" : "Add brand")}
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
                    <div className="h-7 w-7 sm:w-14 bg-white/5 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/* ─── Brand Row ─────────────────────────────────────────────────── */
function BrandRow({ brand, onDelete, onEdit, isDeletePending }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleConfirm = () => {
        onDelete(brand.brandId);
        setConfirmDelete(false);
    };

    return (
        <>
            {confirmDelete && (
                <ConfirmDialog
                    message="Delete this brand?"
                    subMessage="This is permanent and cannot be undone."
                    confirmLabel="Delete"
                    confirmClass="bg-red-600 hover:bg-red-700"
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}

            <div className="group relative border border-white/8 hover:border-white/14 bg-white/[0.02] rounded-xl transition-all duration-200">
                <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-blue-500/60" />

                {/* Main row */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 min-w-0">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-blue-500/10 border-blue-500/20">
                        <Tag className="w-3.5 h-3.5 text-blue-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-bold text-white truncate">{brand.title}</span>
                            <span className="text-[0.62rem] text-gray-600 font-mono bg-white/5 px-1 py-px rounded flex-shrink-0">
                                {brand.slug}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[0.68rem] text-gray-500 truncate">
                                {brand.subCategory?.title ?? "No sub category"}
                            </span>
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
                            onClick={() => onEdit(brand)}
                            title="Edit"
                            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[0.68rem] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all active:scale-95"
                        >
                            <Pencil className="w-3 h-3" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button
                            onClick={() => setConfirmDelete(true)}
                            disabled={isDeletePending}
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
                            { label: "Sub Category", value: brand.subCategory?.title || "None" },
                            { label: "Meta Title", value: brand.metaTitle || "None" },
                            { label: "Meta Description", value: brand.metaDescription || "None" },
                            { label: "Created", value: brand.createdAt ? format(new Date(brand.createdAt), "MMM d, yyyy") : "—" },
                            { label: "Updated", value: brand.updatedAt ? format(new Date(brand.updatedAt), "MMM d, yyyy") : "—" },
                        ].map(({ label, value }) => (
                            <div key={label} className="bg-white/[0.025] rounded-lg px-2.5 py-1.5">
                                <p className="text-[0.6rem] font-bold uppercase tracking-wide text-gray-600">{label}</p>
                                <p className="text-xs text-gray-300 mt-0.5 truncate">{value}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

/* ─── Edit Panel (inline) ───────────────────────────────────────── */
function EditPanel({ brand, onSave, onCancel, isPending, subcategories, subcategoriesLoading }) {
    const initial = {
        title: brand.title ?? "",
        subCategoryId: brand.subCategoryId ?? "",
        slug: brand.slug ?? "",
        metaTitle: brand.metaTitle ?? "",
        metaDescription: brand.metaDescription ?? "",
    };

    return (
        <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Pencil className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-300">Editing — <span className="text-white">{brand.title}</span></span>
                </div>
                <button onClick={onCancel} className="p-1 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <BrandForm
                initial={initial}
                onSubmit={onSave}
                isPending={isPending}
                onCancel={onCancel}
                isEdit
                subcategories={subcategories}
                subcategoriesLoading={subcategoriesLoading}
            />
        </div>
    );
}

/* ─── Empty State ───────────────────────────────────────────────── */
function EmptyState({ hasSearch, onAdd }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-4">
                <Tag className="w-5 h-5 text-gray-700" />
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-1">
                {hasSearch ? "No matching brands" : "No brands yet"}
            </p>
            <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                {hasSearch ? "Try a different search term." : "Create a brand to group products under your storefront."}
            </p>
            {!hasSearch && (
                <button onClick={onAdd} className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95">
                    <Plus className="w-3.5 h-3.5" />
                    Create first brand
                </button>
            )}
        </div>
    );
}

/* ─── Brand Manager ─────────────────────────────────────────────── */
function BrandManager() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [search, setSearch] = useState("");

    // Get all the subcategories
    const { data: subcategoriesData, isLoading: subcategoriesLoading } = useQuery({
        queryKey: ["subcategories"],
        queryFn: () => getAllSubCategoriesApi(),
    });

    const subcategories = subcategoriesData?.data ?? [];

    /* query */
    const {
        data: brandsData, isLoading,
        refetch, isFetching
    } = useQuery({ queryKey: ["brands"], queryFn: getAllBrandsApi });

    /* add */
    const { mutate: addBrand, isPending: isAdding } = useMutation({
        mutationFn: addBrandApi,
        onSuccess: () => { Toast("Brand created", "success"); setShowAddForm(false); refetch(); },
        onError: () => Toast("Failed to create brand", "error"),
    });

    /* update */
    const { mutate: updateBrand, isPending: isUpdating } = useMutation({
        mutationFn: ({ brandId, data }) => updateBrandApi(brandId, data),
        onSuccess: () => {
            Toast("Brand saved", "success");
            setEditingBrand(null);
            refetch();
        },
        onError: () => Toast("Failed to update brand", "error"),
    });

    /* delete */
    const { mutate: deleteBrand, isPending: isDeleting } = useMutation({
        mutationFn: deleteBrandApi,
        onSuccess: () => { Toast("Brand deleted", "success"); refetch(); },
        onError: () => Toast("Failed to delete brand", "error"),
    });

    const allBrands = brandsData?.data ?? [];
    const query = search.trim().toLowerCase();
    const brands = query
        ? allBrands.filter((b) =>
            b.title?.toLowerCase().includes(query) ||
            b.subCategory?.title?.toLowerCase().includes(query) ||
            b.slug?.toLowerCase().includes(query)
        )
        : allBrands;

    return (
        <div className="w-full px-3 sm:px-6 py-5 sm:py-8">
            <div className="max-w-3xl mx-auto">

                {/* ── Header ── */}
                <div className="mb-5">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-blue-500 mb-2">
                        Dashboard / Brands
                    </p>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                                Brand Manager
                            </h1>
                            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                                Create, edit, and manage brands for your storefront.
                            </p>
                        </div>
                        <button
                            onClick={() => { setShowAddForm((v) => !v); setEditingBrand(null); }}
                            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-lg ${
                                showAddForm
                                    ? "bg-white/10 border border-white/15 text-white shadow-none"
                                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30"
                            }`}
                        >
                            {showAddForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            {showAddForm ? "Cancel" : "New Brand"}
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
                            New Brand
                        </p>
                        <BrandForm
                            onSubmit={addBrand}
                            isPending={isAdding}
                            onCancel={() => setShowAddForm(false)}
                            subcategories={subcategories}
                            subcategoriesLoading={subcategoriesLoading}
                        />
                    </div>
                )}

                {/* ── Toolbar ── */}
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/8 rounded-xl">
                        <span className="text-xs font-semibold text-gray-300">All Brands</span>
                        <span className="inline-flex items-center text-[0.62rem] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-gray-300">
                            {allBrands.length}
                        </span>
                    </div>

                    <button
                        onClick={refetch}
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
                        placeholder="Search brands by title, sub category, or slug…"
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
                ) : brands.length === 0 ? (
                    <EmptyState hasSearch={!!query} onAdd={() => { setShowAddForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                ) : (
                    <div className="space-y-2.5">
                        {brands.map((brand) => (
                            <div key={brand.brandId}>
                                {editingBrand?.brandId === brand.brandId ? (
                                    <EditPanel
                                        brand={brand}
                                        isPending={isUpdating}
                                        onCancel={() => setEditingBrand(null)}
                                        onSave={(data) => updateBrand({ brandId: brand.brandId, data })}
                                        subcategories={subcategories}
                                        subcategoriesLoading={subcategoriesLoading}
                                    />
                                ) : (
                                    <BrandRow
                                        brand={brand}
                                        onDelete={deleteBrand}
                                        onEdit={(b) => { setEditingBrand(b); setShowAddForm(false); }}
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

export default BrandManager;