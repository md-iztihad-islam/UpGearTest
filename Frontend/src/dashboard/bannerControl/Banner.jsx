import Toast from "@/components/toast/Toast";
import deactivateBannerApi from "@/services/dashboard/banner/deactivteBannerApi";
import activateBannerApi from "@/services/dashboard/banner/activateBannerApi";
import deleteBannerApi from "@/services/dashboard/banner/deleteBannerApi";
import getActiveBannerApi from "@/services/dashboard/banner/getActiveBannerApi";
import getDeactivatedBannerApi from "@/services/dashboard/banner/getDeactivatedBannerApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Eye, EyeOff, Trash2, Loader2, ExternalLink,
    AlertTriangle, Plus, RefreshCw, ImageOff
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
                        {subMessage && (
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{subMessage}</p>
                        )}
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

/* ─── Skeleton ──────────────────────────────────────────────────── */
function SkeletonRow() {
    return (
        <div className="border border-white/5 rounded-xl px-3 py-2.5 animate-pulse bg-white/[0.015]">
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0" />
                <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-2.5 bg-white/5 rounded w-2/5" />
                    <div className="h-2 bg-white/5 rounded w-3/5" />
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                    <div className="h-7 w-7 sm:w-20 bg-white/5 rounded-lg" />
                    <div className="h-7 w-7 sm:w-16 bg-white/5 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/* ─── Banner Row ────────────────────────────────────────────────── */
function BannerRow({ banner, isActive, onToggle, onDelete, isTogglePending, isDeletePending }) {
    const [confirmAction, setConfirmAction] = useState(null);
    const [imgError, setImgError] = useState(false);

    const handleConfirm = () => {
        if (confirmAction === "toggle") onToggle(banner.bannerId);
        if (confirmAction === "delete") onDelete(banner.bannerId);
        setConfirmAction(null);
    };

    const dialogProps = confirmAction === "delete"
        ? {
            message: "Delete this banner?",
            subMessage: "This is permanent and cannot be undone.",
            confirmLabel: "Delete",
            confirmClass: "bg-red-600 hover:bg-red-700",
        }
        : {
            message: isActive ? "Deactivate this banner?" : "Activate this banner?",
            subMessage: isActive
                ? "It will be hidden from your storefront immediately."
                : "It will go live on your storefront right away.",
            confirmLabel: isActive ? "Deactivate" : "Activate",
            confirmClass: isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700",
        };

    return (
        <>
            {confirmAction && (
                <ConfirmDialog
                    {...dialogProps}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirmAction(null)}
                />
            )}

            <div className={`group relative border rounded-xl px-3 py-2.5 transition-all duration-200 ${
                isActive
                    ? "border-white/8 hover:border-white/14 bg-white/[0.02]"
                    : "border-white/5 hover:border-white/8 bg-transparent opacity-55 hover:opacity-85"
            }`}>

                {/* Active left stripe */}
                {isActive && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-emerald-500/60" />
                )}

                {/* Single row: thumbnail + info + buttons */}
                <div className="flex items-center gap-2.5 min-w-0">

                    {/* Thumbnail — small & square */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-white/5 border border-white/8 flex items-center justify-center">
                        {!imgError ? (
                            <img
                                src={banner.imageURL}
                                alt={banner.title}
                                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${!isActive ? "grayscale group-hover:grayscale-0" : ""}`}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <ImageOff className="w-3.5 h-3.5 text-gray-700" />
                        )}
                    </div>

                    {/* Info — truncates hard, single line each */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <h3 className="text-xs font-semibold text-white truncate leading-tight">
                                {banner.title}
                            </h3>
                            <StatusBadge active={isActive} />
                            {banner.orderIndex !== undefined && (
                                <span className="text-[0.58rem] text-gray-600 font-mono bg-white/5 px-1 py-px rounded flex-shrink-0">
                                    #{banner.orderIndex}
                                </span>
                            )}
                        </div>

                        {banner.subTitle && (
                            <p className="text-[0.68rem] text-gray-500 truncate leading-tight mt-0.5">{banner.subTitle}</p>
                        )}

                        {/* {banner.link && (
                            <a
                                href={banner.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-[0.65rem] text-blue-400/70 hover:text-blue-300 transition-colors max-w-full mt-0.5"
                            >
                                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{banner.link}</span>
                            </a>
                        )} */}
                    </div>

                    {/* Buttons — icon-only on mobile, icon+label on sm+ */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                            onClick={() => setConfirmAction("toggle")}
                            disabled={isTogglePending || isDeletePending}
                            title={isActive ? "Deactivate" : "Activate"}
                            className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[0.68rem] font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                                isActive
                                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                        >
                            {isTogglePending
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />
                            }
                            <span className="hidden sm:inline">{isActive ? "Deactivate" : "Activate"}</span>
                        </button>

                        <button
                            onClick={() => setConfirmAction("delete")}
                            disabled={isTogglePending || isDeletePending}
                            title="Delete"
                            className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[0.68rem] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isDeletePending
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Trash2 className="w-3 h-3" />
                            }
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─── Empty State ───────────────────────────────────────────────── */
function EmptyState({ tab, onAdd }) {
    const isActive = tab === "active";
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center mb-4">
                {isActive ? <Eye className="w-5 h-5 text-gray-700" /> : <EyeOff className="w-5 h-5 text-gray-700" />}
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-1">
                {isActive ? "No live banners" : "No hidden banners"}
            </p>
            <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                {isActive
                    ? "Add a banner and activate it to display it on your storefront."
                    : "All your banners are currently live."}
            </p>
            {isActive && (
                <button
                    onClick={onAdd}
                    className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add your first banner
                </button>
            )}
        </div>
    );
}

/* ─── Banner Manager ────────────────────────────────────────────── */
function BannerManager() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("active");

    const {
        data: activeData,
        isLoading: activeLoading,
        refetch: refetchActive,
        isFetching: activeFetching,
    } = useQuery({ queryKey: ["activeBanners"], queryFn: getActiveBannerApi });

    const {
        data: inactiveData,
        isLoading: inactiveLoading,
        refetch: refetchInactive,
        isFetching: inactiveFetching,
    } = useQuery({ queryKey: ["deactivatedBanners"], queryFn: getDeactivatedBannerApi });

    const { mutate: deactivate, isPending: isDeactivating } = useMutation({
        mutationFn: deactivateBannerApi,
        onSuccess: () => { Toast("Banner deactivated", "success"); refetchActive(); refetchInactive(); },
        onError: () => Toast("Failed to deactivate banner", "error"),
    });

    const { mutate: activate, isPending: isActivating } = useMutation({
        mutationFn: activateBannerApi,
        onSuccess: () => { Toast("Banner activated", "success"); refetchActive(); refetchInactive(); },
        onError: () => Toast("Failed to activate banner", "error"),
    });

    const { mutate: deleteBanner, isPending: isDeleting } = useMutation({
        mutationFn: deleteBannerApi,
        onSuccess: () => { Toast("Banner deleted", "success"); refetchActive(); refetchInactive(); },
        onError: () => Toast("Failed to delete banner", "error"),
    });

    const activeBanners = activeData?.data ?? [];
    const inactiveBanners = inactiveData?.data ?? [];
    const isLoading = tab === "active" ? activeLoading : inactiveLoading;
    const isFetching = tab === "active" ? activeFetching : inactiveFetching;
    const banners = tab === "active" ? activeBanners : inactiveBanners;

    const tabs = [
        { key: "active",   label: "Live",   count: activeBanners.length,   dot: "bg-emerald-400" },
        { key: "inactive", label: "Hidden", count: inactiveBanners.length, dot: "bg-gray-600" },
    ];

    return (
        <div className="w-full px-3 sm:px-6 py-5 sm:py-8">
            <div className="max-w-3xl mx-auto">

                {/* ── Header ── */}
                <div className="mb-5">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-blue-500 mb-2">
                        Dashboard / Banners
                    </p>
                    {/* Title row: stacks on mobile, side-by-side on sm+ */}
                    <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                                Banner Manager
                            </h1>
                            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                                Control which banners appear on your storefront.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/dashboard/bannercontrol/add-banner")}
                            className="self-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95 shadow-lg shadow-blue-900/30 whitespace-nowrap flex-shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Add Banner
                        </button>
                    </div>
                </div>

                {/* ── Divider ── */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-5" />

                {/* ── Toolbar ── */}
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                    <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-xl">
                        {tabs.map(({ key, label, count, dot }) => {
                            const active = tab === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setTab(key)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        active
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
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
                        onClick={() => { refetchActive(); refetchInactive(); }}
                        disabled={isFetching}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 bg-white/[0.04] hover:bg-white/8 border border-white/8 transition-all disabled:opacity-50 active:scale-95"
                    >
                        <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* ── Content ── */}
                {isLoading ? (
                    <div className="space-y-2.5">
                        {[...Array(3)].map((_, i) => <SkeletonRow key={i} />)}
                    </div>
                ) : banners.length === 0 ? (
                    <EmptyState tab={tab} onAdd={() => navigate("/dashboard/bannercontrol/add-banner")} />
                ) : (
                    <div className="space-y-2.5">
                        {banners.map((banner) => (
                            <BannerRow
                                key={banner.bannerId}
                                banner={banner}
                                isActive={tab === "active"}
                                onToggle={tab === "active" ? deactivate : activate}
                                onDelete={deleteBanner}
                                isTogglePending={isDeactivating || isActivating}
                                isDeletePending={isDeleting}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BannerManager;