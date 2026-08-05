import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft, Search, Edit, Trash2, Loader2, Layers,
    Plus, Image as ImageIcon, Tag, ChevronDown, ChevronUp,
    BadgeCheck, Flame, Percent, Package, X,
} from "lucide-react";
import deleteProductByIdApi from "@/services/dashboard/product/deleteProductApi";
import getAllProductsApi from "@/services/dashboard/product/getAllProductsApi";
import updateProductByIdApi from "@/services/dashboard/product/updateProductApi";

// ─── tiny shared components ───────────────────────────────────────────────────

function StatusBadge({ status }) {
    const map = {
        published: "bg-green-600/20 text-green-400 border-green-600/30",
        draft: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${map[status] ?? "bg-gray-600/20 text-gray-400 border-gray-600/30"}`}>
            {status ?? "—"}
        </span>
    );
}

function ProductTypeBadge({ type }) {
    const map = {
        available: "bg-blue-600/20 text-blue-400 border-blue-600/30",
        preorder: "bg-orange-600/20 text-orange-400 border-orange-600/30",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${map[type] ?? "bg-gray-600/20 text-gray-400 border-gray-600/30"}`}>
            {type === "preorder" ? "Pre-order" : type ?? "—"}
        </span>
    );
}

// The three flag definitions used everywhere
const FLAG_DEFS = [
    {
        key: "isNewArrival",
        label: "New Arrival",
        shortLabel: "New",
        icon: BadgeCheck,
        activeClass: "bg-emerald-600/20 text-emerald-400 border-emerald-600/35",
        activeDot: "bg-emerald-400",
        btnActive: "bg-emerald-600/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/30",
        btnInactive: "bg-gray-700/60 border-gray-600 text-gray-500 hover:bg-gray-700 hover:text-gray-300",
        filterActive: "bg-emerald-600 text-white border-emerald-600",
        filterInactive: "bg-gray-700/60 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200",
    },
    {
        key: "isHotDeal",
        label: "Hot Deal",
        shortLabel: "Hot",
        icon: Flame,
        activeClass: "bg-orange-600/20 text-orange-400 border-orange-600/35",
        activeDot: "bg-orange-400",
        btnActive: "bg-orange-600/20 border-orange-500/50 text-orange-400 hover:bg-orange-600/30",
        btnInactive: "bg-gray-700/60 border-gray-600 text-gray-500 hover:bg-gray-700 hover:text-gray-300",
        filterActive: "bg-orange-600 text-white border-orange-600",
        filterInactive: "bg-gray-700/60 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200",
    },
    {
        key: "isDiscounted",
        label: "Discounted",
        shortLabel: "Sale",
        icon: Percent,
        activeClass: "bg-purple-600/20 text-purple-400 border-purple-600/35",
        activeDot: "bg-purple-400",
        btnActive: "bg-purple-600/20 border-purple-500/50 text-purple-400 hover:bg-purple-600/30",
        btnInactive: "bg-gray-700/60 border-gray-600 text-gray-500 hover:bg-gray-700 hover:text-gray-300",
        filterActive: "bg-purple-600 text-white border-purple-600",
        filterInactive: "bg-gray-700/60 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200",
    },
];

// ─── flag pill display (read-only) ───────────────────────────────────────────

function FlagPills({ product }) {
    const active = FLAG_DEFS.filter(f => product[f.key]);
    if (!active.length) return <span className="text-gray-600 text-xs">—</span>;
    return (
        <div className="flex flex-wrap gap-1">
            {active.map(({ key, shortLabel, icon: Icon, activeClass }) => (
                <span key={key} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] font-medium ${activeClass}`}>
                    <Icon className="w-2.5 h-2.5" />
                    {shortLabel}
                </span>
            ))}
        </div>
    );
}

// ─── inline flag toggle buttons ───────────────────────────────────────────────

function FlagToggles({ product, onToggle, togglingFlag }) {
    return (
        <div className="flex flex-col gap-1.5">
            {FLAG_DEFS.map(({ key, label, shortLabel, icon: Icon, btnActive, btnInactive }) => {
                const isActive = !!product[key];
                const isLoading = togglingFlag === key;
                return (
                    <button
                        key={key}
                        type="button"
                        disabled={!!togglingFlag}
                        onClick={() => onToggle(product, key, !isActive)}
                        title={isActive ? `Remove from ${label}` : `Add to ${label}`}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed min-w-[108px] ${isActive ? btnActive : btnInactive}`}
                    >
                        {isLoading
                            ? <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                            : isActive
                                ? <X className="w-3 h-3 flex-shrink-0" />
                                : <Icon className="w-3 h-3 flex-shrink-0" />
                        }
                        <span>{isActive ? `Remove ${shortLabel}` : `Mark ${shortLabel}`}</span>
                    </button>
                );
            })}
        </div>
    );
}

// ─── desktop table row ────────────────────────────────────────────────────────

function ProductRow({ product, onEdit, onDelete, onToggleFlag, isDeleting, togglingFlag }) {
    const [expanded, setExpanded] = useState(false);
    const firstImage = product.images?.[0]?.imageURL;
    const filters = product.productFilters ?? [];

    return (
        <>
            <tr className="border-b border-gray-700/60 hover:bg-gray-700/20 transition group">

                {/* Thumbnail + Title */}
                <td className="p-4">
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0 border border-gray-600">
                            {firstImage
                                ? <img src={firstImage} alt={product.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-500" /></div>
                            }
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white leading-tight line-clamp-2 max-w-[180px]">{product.title}</p>
                            {product.subTitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[180px]">{product.subTitle}</p>}
                            <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded text-[10px] font-mono">
                                {product.slug}
                            </span>
                        </div>
                    </div>
                </td>

                {/* Brand / Category */}
                <td className="p-4">
                    <p className="text-sm font-medium text-gray-200">{product.group?.brand?.title ?? "—"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{product.group?.category?.title}</p>
                    <p className="text-xs text-gray-600">{product.group?.subCategory?.title}</p>
                </td>

                {/* Price */}
                <td className="p-4">
                    <p className="text-sm font-semibold text-white">৳{Number(product.price).toLocaleString()}</p>
                    {product.mainPrice && Number(product.mainPrice) !== Number(product.price) && (
                        <p className="text-xs text-gray-500 line-through">৳{Number(product.mainPrice).toLocaleString()}</p>
                    )}
                    {product.coupon?.code && (
                        <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-teal-600/15 text-teal-400 border border-teal-600/25 rounded text-[10px] font-mono">
                            <Tag className="w-2.5 h-2.5" />{product.coupon.code}
                        </span>
                    )}
                </td>

                {/* Status + Type */}
                <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                        <StatusBadge status={product.status} />
                        <ProductTypeBadge type={product.group?.productType} />
                    </div>
                </td>

                {/* Active flags (read) */}
                <td className="p-4">
                    <FlagPills product={product} />
                </td>

                {/* Flag toggle buttons */}
                <td className="p-4">
                    <FlagToggles
                        product={product}
                        onToggle={onToggleFlag}
                        togglingFlag={togglingFlag}
                    />
                </td>

                {/* Media */}
                <td className="p-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600/15 text-indigo-400 border border-indigo-600/25 rounded text-xs w-fit">
                            <ImageIcon className="w-3 h-3" />
                            {product.images?.length ?? 0} img
                        </span>
                        {filters.length > 0 && (
                            <button
                                onClick={() => setExpanded(e => !e)}
                                className="flex items-center gap-1 px-2 py-0.5 bg-cyan-600/15 text-cyan-400 border border-cyan-600/25 rounded text-xs w-fit hover:bg-cyan-600/25 transition"
                            >
                                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {filters.length} filter{filters.length !== 1 ? "s" : ""}
                            </button>
                        )}
                    </div>
                </td>

                {/* Shipping */}
                <td className="p-4 text-xs text-gray-400">
                    <p>In: ৳{product.group?.insideDhakaCharge ?? "—"}</p>
                    <p>Out: ৳{product.group?.outsideDhakaCharge ?? "—"}</p>
                </td>

                {/* Edit / Delete */}
                <td className="p-4">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => onEdit(product.productId)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/40 hover:border-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-medium transition-all duration-150"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(product)}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600 border border-red-600/40 hover:border-red-600 text-red-400 hover:text-white rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-40"
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Delete
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expanded filter chips row */}
            {expanded && filters.length > 0 && (
                <tr className="border-b border-gray-700/40 bg-gray-800/30">
                    <td colSpan={9} className="px-6 py-3">
                        <div className="flex flex-wrap gap-2">
                            {filters
                                .slice()
                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                .map(pf => (
                                    <span key={pf.productFilterId} className="flex items-center gap-1 px-2.5 py-1 bg-gray-700 border border-gray-600 rounded-lg text-xs text-gray-300">
                                        <span className="text-gray-500">{pf.filter?.title}:</span>
                                        {pf.filterItem?.title}
                                    </span>
                                ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── mobile card ──────────────────────────────────────────────────────────────

function MobileProductCard({ product, onEdit, onDelete, onToggleFlag, isDeleting, togglingFlag }) {
    const [expanded, setExpanded] = useState(false);
    const firstImage = product.images?.[0]?.imageURL;
    const filters = product.productFilters ?? [];

    return (
        <div className="p-5 border-b border-gray-700/60 last:border-b-0">
            {/* Top row */}
            <div className="flex gap-3 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 border border-gray-600">
                    {firstImage
                        ? <img src={firstImage} alt={product.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-500" /></div>
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-tight line-clamp-2">{product.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">{product.slug}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        <StatusBadge status={product.status} />
                        <ProductTypeBadge type={product.group?.productType} />
                    </div>
                </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                    <p className="text-gray-500 text-xs mb-1">Brand & Category</p>
                    <p className="text-gray-200 font-medium text-xs">{product.group?.brand?.name ?? "—"}</p>
                    <p className="text-gray-500 text-xs">{product.group?.category?.title} / {product.group?.subCategory?.title}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">Price</p>
                    <p className="text-white font-semibold text-sm">৳{Number(product.price).toLocaleString()}</p>
                    {product.mainPrice && Number(product.mainPrice) !== Number(product.price) && (
                        <p className="text-gray-500 text-xs line-through">৳{Number(product.mainPrice).toLocaleString()}</p>
                    )}
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">Shipping</p>
                    <p className="text-gray-400 text-xs">In: ৳{product.group?.insideDhakaCharge ?? "—"}</p>
                    <p className="text-gray-400 text-xs">Out: ৳{product.group?.outsideDhakaCharge ?? "—"}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">Active flags</p>
                    <FlagPills product={product} />
                </div>
            </div>

            {/* Flag toggle buttons */}
            <div className="mb-4 p-3 bg-gray-700/25 rounded-xl border border-gray-700/50">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2.5">Quick flags</p>
                <div className="grid grid-cols-3 gap-1.5">
                    {FLAG_DEFS.map(({ key, shortLabel, icon: Icon, btnActive, btnInactive }) => {
                        const isActive = !!product[key];
                        const isLoading = togglingFlag === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                disabled={!!togglingFlag}
                                onClick={() => onToggleFlag(product, key, !isActive)}
                                className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg border text-[10px] font-medium transition-all disabled:opacity-50 ${isActive ? btnActive : btnInactive}`}
                            >
                                {isLoading
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : isActive
                                        ? <X className="w-3 h-3" />
                                        : <Icon className="w-3 h-3" />
                                }
                                <span>{isActive ? `- ${shortLabel}` : `+ ${shortLabel}`}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Images + filters */}
            <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-600/15 text-indigo-400 border border-indigo-600/25 rounded text-xs">
                    <ImageIcon className="w-3 h-3" />{product.images?.length ?? 0} images
                </span>
                {filters.length > 0 && (
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="flex items-center gap-1 px-2 py-0.5 bg-cyan-600/15 text-cyan-400 border border-cyan-600/25 rounded text-xs"
                    >
                        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {filters.length} filters
                    </button>
                )}
                {product.coupon?.code && (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 bg-teal-600/15 text-teal-400 border border-teal-600/25 rounded text-xs font-mono">
                        <Tag className="w-3 h-3" />{product.coupon.code}
                    </span>
                )}
            </div>

            {expanded && filters.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-700/50">
                    {filters
                        .slice()
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map(pf => (
                            <span key={pf.productFilterId} className="flex items-center gap-1 px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300">
                                <span className="text-gray-500">{pf.filter?.title}:</span>
                                {pf.filterItem?.title}
                            </span>
                        ))}
                </div>
            )}

            {/* Edit / Delete */}
            <div className="flex gap-3">
                <button
                    onClick={() => onEdit(product.productId)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/40 hover:border-blue-600 text-blue-400 hover:text-white rounded-lg text-sm font-medium transition-all"
                >
                    <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                    onClick={() => onDelete(product)}
                    disabled={isDeleting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600 border border-red-600/40 hover:border-red-600 text-red-400 hover:text-white rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {isDeleting ? "Deleting…" : "Delete"}
                </button>
            </div>
        </div>
    );
}

// ─── main page ────────────────────────────────────────────────────────────────

function ManageProduct() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState("");
    const [flagFilter, setFlagFilter] = useState(null); // null | "isNewArrival" | "isHotDeal" | "isDiscounted"
    const [deletingId, setDeletingId] = useState(null);
    // togglingMap: { [productId]: flagKey } — tracks which flag on which product is mid-request
    const [togglingMap, setTogglingMap] = useState({});

    const { data: productsRes, isLoading, error, refetch } = useQuery({
        queryKey: ["products"],
        queryFn: () => getAllProductsApi(),
    });

    const allProducts = productsRes?.data || [];

    // Apply text search then flag filter
    const filteredProducts = useMemo(() => {
        let list = allProducts;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((p) =>
                p.title?.toLowerCase().includes(q) ||
                p.subTitle?.toLowerCase().includes(q) ||
                p.slug?.toLowerCase().includes(q) ||
                p.status?.toLowerCase().includes(q) ||
                p.group?.brand?.name?.toLowerCase().includes(q) ||
                p.group?.category?.title?.toLowerCase().includes(q) ||
                p.group?.subCategory?.title?.toLowerCase().includes(q) ||
                p.group?.productType?.toLowerCase().includes(q) ||
                p.coupon?.code?.toLowerCase().includes(q) ||
                p.productFilters?.some(pf =>
                    pf.filter?.title?.toLowerCase().includes(q) ||
                    pf.filterItem?.title?.toLowerCase().includes(q)
                )
            );
        }

        if (flagFilter) {
            list = list.filter((p) => !!p[flagFilter]);
        }

        return list;
    }, [allProducts, searchQuery, flagFilter]);

    // Flag counts for the filter chips
    const flagCounts = useMemo(() => {
        const counts = {};
        FLAG_DEFS.forEach(({ key }) => {
            counts[key] = allProducts.filter(p => !!p[key]).length;
        });
        return counts;
    }, [allProducts]);

    // Delete mutation
    const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
        mutationFn: (productId) => deleteProductByIdApi(productId),
        onSuccess: (data) => {
            setDeletingId(null);
            if (data?.success) {
                window.showToast("Product deleted.", "success");
                refetch();
            } else {
                window.showToast("Failed to delete the product.", "error");
            }
        },
        onError: (err) => {
            setDeletingId(null);
            console.error("Error deleting product:", err);
            window.showToast("An error occurred while deleting the product.", "error");
        },
    });

    const handleDelete = (product) => {
        if (window.confirm(`Delete "${product.title}"? This cannot be undone.`)) {
            setDeletingId(product.productId);
            deleteProduct(product.productId);
        }
    };

    // Flag toggle mutation — optimistic update on the cached list
    const { mutate: updateFlag } = useMutation({
        mutationFn: ({ productId, flagKey, value }) => {
            const form = new FormData();
            form.append(flagKey, value);
            return updateProductByIdApi(productId, form);
        },
        onMutate: async ({ productId, flagKey, value }) => {
            // Optimistically flip the flag in the cache
            await queryClient.cancelQueries({ queryKey: ["products"] });
            const previous = queryClient.getQueryData(["products"]);
            queryClient.setQueryData(["products"], (old) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((p) =>
                        p.productId === productId ? { ...p, [flagKey]: value } : p
                    ),
                };
            });
            return { previous };
        },
        onSuccess: (data, { productId, flagKey, value }) => {
            setTogglingMap((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
            if (data?.success) {
                const def = FLAG_DEFS.find(f => f.key === flagKey);
                const msg = value
                    ? `Added to ${def.label}.`
                    : `Removed from ${def.label}.`;
                window.showToast(msg, "success");
            } else {
                window.showToast("Failed to update flag.", "error");
                queryClient.invalidateQueries({ queryKey: ["products"] });
            }
        },
        onError: (err, { productId }, context) => {
            setTogglingMap((prev) => {
                const next = { ...prev };
                delete next[productId];
                return next;
            });
            console.error("Error toggling flag:", err);
            window.showToast("An error occurred.", "error");
            // Roll back optimistic update
            if (context?.previous) {
                queryClient.setQueryData(["products"], context.previous);
            }
        },
    });

    const handleToggleFlag = (product, flagKey, value) => {
        // Prevent double-clicking while one is in flight for this product
        if (togglingMap[product.productId]) return;
        setTogglingMap((prev) => ({ ...prev, [product.productId]: flagKey }));
        updateFlag({ productId: product.productId, flagKey, value });
    };

    const handleEdit = (productId) => navigate(`edit-product/${productId}`);

    const TABLE_HEADERS = ["Product", "Brand / Category", "Price", "Status", "Flags", "Quick Flags", "Media", "Shipping", "Actions"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back</span>
                    </button>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Manage Products
                            </h1>
                            <p className="text-gray-400 text-sm">
                                {allProducts.length} product{allProducts.length !== 1 ? "s" : ""} total
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("../add-product")}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-900/30"
                        >
                            <Plus className="w-4 h-4" />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Search + Flag filters */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 sm:p-6 mb-6 space-y-4">
                    {/* Text search */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, brand, category, slug, filters, coupon…"
                                className="w-full pl-11 pr-4 py-3 bg-gray-700/80 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 whitespace-nowrap px-1">
                            <Layers className="w-4 h-4" />
                            <span>{filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}</span>
                        </div>
                    </div>

                    {/* Flag filter chips */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider mr-1">Filter:</span>

                        {/* All chip */}
                        <button
                            onClick={() => setFlagFilter(null)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                flagFilter === null
                                    ? "bg-gray-500 text-white border-gray-400"
                                    : "bg-gray-700/60 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                            }`}
                        >
                            All
                            <span className="px-1.5 py-0.5 bg-black/20 rounded text-[10px]">{allProducts.length}</span>
                        </button>

                        {FLAG_DEFS.map(({ key, label, icon: Icon, filterActive, filterInactive }) => (
                            <button
                                key={key}
                                onClick={() => setFlagFilter(prev => prev === key ? null : key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                    flagFilter === key ? filterActive : filterInactive
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${flagFilter === key ? "bg-black/20" : "bg-gray-600/50"}`}>
                                    {flagCounts[key]}
                                </span>
                            </button>
                        ))}

                        {/* Clear flag filter */}
                        {flagFilter && (
                            <button
                                onClick={() => setFlagFilter(null)}
                                className="flex items-center gap-1 px-2 py-1.5 text-gray-500 hover:text-gray-300 text-xs transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400 text-sm">Loading products…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                        <p className="text-red-400 text-sm">Error fetching products: {error.message}</p>
                    </div>
                )}

                {/* Products — Desktop Table */}
                {!isLoading && !error && filteredProducts.length > 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden mb-6">
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/40 border-b border-gray-700">
                                    <tr>
                                        {TABLE_HEADERS.map(h => (
                                            <th key={h} className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product) => (
                                        <ProductRow
                                            key={product.productId}
                                            product={product}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onToggleFlag={handleToggleFlag}
                                            isDeleting={isDeleting && deletingId === product.productId}
                                            togglingFlag={togglingMap[product.productId] ?? null}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden">
                            {filteredProducts.map((product) => (
                                <MobileProductCard
                                    key={product.productId}
                                    product={product}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleFlag={handleToggleFlag}
                                    isDeleting={isDeleting && deletingId === product.productId}
                                    togglingFlag={togglingMap[product.productId] ?? null}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* No results */}
                {!isLoading && !error && filteredProducts.length === 0 && (searchQuery || flagFilter) && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-14 text-center">
                        <div className="w-16 h-16 bg-gray-700/60 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-300 text-base mb-1">
                            {flagFilter
                                ? `No ${FLAG_DEFS.find(f => f.key === flagFilter)?.label} products${searchQuery ? ` matching "${searchQuery}"` : ""}`
                                : `No products match "${searchQuery}"`
                            }
                        </p>
                        <p className="text-gray-500 text-sm">Try a different keyword or clear the filters</p>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && allProducts.length === 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-14 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/40">
                            <Layers className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-200 text-lg font-semibold mb-1">No products yet</p>
                        <p className="text-gray-500 text-sm mb-6">Add your first product to get started</p>
                        <button
                            onClick={() => navigate("../add-product")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200"
                        >
                            Add Product
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageProduct;