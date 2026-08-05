import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeft, Search, Edit, Trash2, Loader2,
    Store, Plus, Hash, Phone, Mail, MapPin, ArrowUpDown,
} from "lucide-react";
import getAllStoresApi from "@/services/dashboard/store/getAllStoresApi";
import deleteStoreApi from "@/services/dashboard/store/deleteStoreApi";
// import deleteStoreByIdApi from "@/services/dashboard/store/deleteStoreByIdApi";

function StatusBadge({ status }) {
    const map = {
        active: "bg-green-600/20 text-green-400 border-green-600/30",
        inactive: "bg-red-600/20 text-red-400 border-red-600/30",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${map[status] ?? "bg-gray-600/20 text-gray-400 border-gray-600/30"}`}>
            {status ?? "—"}
        </span>
    );
}

function StoreRow({ store, onEdit, onDelete, isDeleting }) {
    return (
        <tr className="border-b border-gray-700/60 hover:bg-gray-700/20 transition">
            {/* Store */}
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-600/30 flex items-center justify-center flex-shrink-0">
                        <Store className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{store.title}</p>
                        {store.subTitle && <p className="text-xs text-gray-500 mt-0.5">{store.subTitle}</p>}
                    </div>
                </div>
            </td>

            {/* Number + Index */}
            <td className="p-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-gray-300 border border-gray-600 rounded font-mono text-xs">
                    <Hash className="w-3 h-3" />{store.storeNumber}
                </span>
                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3" />idx {store.orderIndex}
                </p>
            </td>

            {/* Address */}
            <td className="p-4">
                <p className="text-xs text-gray-400 flex items-start gap-1.5 max-w-[180px]">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-500" />
                    {store.address}
                </p>
            </td>

            {/* Contact */}
            <td className="p-4">
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1">
                    <Phone className="w-3 h-3 text-gray-500" />{store.phone}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-gray-500" />{store.email}
                </p>
            </td>

            {/* Status */}
            <td className="p-4">
                <StatusBadge status={store.status} />
            </td>

            {/* Actions */}
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(store.storeId)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/40 hover:border-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-medium transition-all"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(store)}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600 border border-red-600/40 hover:border-red-600 text-red-400 hover:text-white rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                    >
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
}

function MobileStoreCard({ store, onEdit, onDelete, isDeleting }) {
    return (
        <div className="p-5 border-b border-gray-700/60 last:border-b-0">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-600/30 flex items-center justify-center flex-shrink-0">
                        <Store className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{store.title}</p>
                        {store.subTitle && <p className="text-xs text-gray-500">{store.subTitle}</p>}
                    </div>
                </div>
                <StatusBadge status={store.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div>
                    <p className="text-gray-500 mb-1">Store Number</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-gray-300 border border-gray-600 rounded font-mono">
                        <Hash className="w-3 h-3" />{store.storeNumber}
                    </span>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">Order Index</p>
                    <p className="text-gray-300">{store.orderIndex}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-gray-500 mb-1">Address</p>
                    <p className="text-gray-400">{store.address}</p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">Phone</p>
                    <p className="text-gray-400">{store.phone}</p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="text-gray-400 truncate">{store.email}</p>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => onEdit(store.storeId)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/40 hover:border-blue-600 text-blue-400 hover:text-white rounded-lg text-sm font-medium transition-all"
                >
                    <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                    onClick={() => onDelete(store)}
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

function ManageStore() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const { data: storesRes, isLoading, error, refetch } = useQuery({
        queryKey: ["stores"],
        queryFn: () => getAllStoresApi(),
    });

    const allStores = storesRes?.data || [];

    const filteredStores = useMemo(() => {
        if (!searchQuery.trim()) return allStores;
        const q = searchQuery.toLowerCase();
        return allStores.filter((s) =>
            s.title?.toLowerCase().includes(q) ||
            s.subTitle?.toLowerCase().includes(q) ||
            s.storeNumber?.toLowerCase().includes(q) ||
            s.address?.toLowerCase().includes(q) ||
            s.phone?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.status?.toLowerCase().includes(q)
        );
    }, [allStores, searchQuery]);

    const { mutate: deleteStore, isPending: isDeleting } = useMutation({
        mutationFn: (storeId) => deleteStoreApi(storeId),
        onSuccess: (data) => {
            setDeletingId(null);
            if (data?.success) {
                window.showToast("Store deleted successfully.", "success");
                refetch();
            } else {
                window.showToast("Failed to delete the store.", "error");
            }
        },
        onError: (err) => {
            setDeletingId(null);
            console.error("Error deleting store:", err);
            window.showToast("An error occurred while deleting the store.", "error");
        },
    });

    const handleDelete = (store) => {
        if (window.confirm(`Delete "${store.title}" (${store.storeNumber})? This cannot be undone.`)) {
            setDeletingId(store.storeId);
            deleteStore(store.storeId);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back
                    </button>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Manage Stores
                            </h1>
                            <p className="text-gray-400 text-sm">
                                {allStores.length} store{allStores.length !== 1 ? "s" : ""} total
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("../add-store")}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-900/30 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Store
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-4 sm:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, number, address, email, status…"
                                className="w-full pl-11 pr-4 py-3 bg-gray-700/80 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition text-sm"
                            />
                        </div>
                        <p className="text-sm text-gray-400 whitespace-nowrap">
                            {filteredStores.length} result{filteredStores.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400 text-sm">Loading stores…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                        <p className="text-red-400 text-sm">Error fetching stores: {error.message}</p>
                    </div>
                )}

                {/* Table */}
                {!isLoading && !error && filteredStores.length > 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden mb-6">

                        {/* Desktop */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/40 border-b border-gray-700">
                                    <tr>
                                        {["Store", "Number", "Address", "Contact", "Status", "Actions"].map((h) => (
                                            <th key={h} className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStores.map((store) => (
                                        <StoreRow
                                            key={store.storeId}
                                            store={store}
                                            onEdit={(id) => navigate(`edit-store/${id}`)}
                                            onDelete={handleDelete}
                                            isDeleting={isDeleting && deletingId === store.storeId}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden">
                            {filteredStores.map((store) => (
                                <MobileStoreCard
                                    key={store.storeId}
                                    store={store}
                                    onEdit={(id) => navigate(`edit-store/${id}`)}
                                    onDelete={handleDelete}
                                    isDeleting={isDeleting && deletingId === store.storeId}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* No results */}
                {!isLoading && !error && filteredStores.length === 0 && searchQuery && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-14 text-center">
                        <div className="w-14 h-14 bg-gray-700/60 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-7 h-7 text-gray-500" />
                        </div>
                        <p className="text-gray-300 text-base mb-1">No stores match "{searchQuery}"</p>
                        <p className="text-gray-500 text-sm">Try a different keyword</p>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && allStores.length === 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-14 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/40">
                            <Store className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-200 text-lg font-semibold mb-1">No stores yet</p>
                        <p className="text-gray-500 text-sm mb-6">Add your first store location to get started</p>
                        <button
                            onClick={() => navigate("../add-store")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200 text-sm"
                        >
                            Add Store
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageStore;