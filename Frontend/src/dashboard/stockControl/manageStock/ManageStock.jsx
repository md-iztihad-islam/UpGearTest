import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft, Search, Package, Download, Loader2,
    Hash, Box, Layers, ChevronDown, ChevronUp, Plus,
    TrendingDown, AlertTriangle, CheckCircle,
} from "lucide-react";
import getAllStockApi from "@/services/dashboard/stock/getAllStockApi";

// ─── helpers ──────────────────────────────────────────────────────────────────

function StockLevelBadge({ remaining, quantity }) {
    const pct = quantity > 0 ? (remaining / quantity) * 100 : 0;

    if (remaining === 0)
        return (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded-full text-[11px] font-medium">
                <AlertTriangle className="w-3 h-3" /> Out of stock
            </span>
        );
    if (pct < 20)
        return (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded-full text-[11px] font-medium">
                <TrendingDown className="w-3 h-3" /> Low stock
            </span>
        );
    return (
        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-600/20 text-green-400 border border-green-600/30 rounded-full text-[11px] font-medium">
            <CheckCircle className="w-3 h-3" /> In stock
        </span>
    );
}

function RemainingText({ remaining, quantity }) {
    const pct = quantity > 0 ? (remaining / quantity) * 100 : 0;
    const cls =
        remaining === 0
            ? "text-red-400"
            : pct < 20
            ? "text-orange-400"
            : "text-green-400";
    return <span className={`font-semibold text-sm ${cls}`}>{remaining}</span>;
}

// Expandable serial numbers row
function SerialNumbersRow({ serialNumbers, colSpan }) {
    const [open, setOpen] = useState(false);
    if (!serialNumbers?.length) return null;

    return (
        <>
            <tr className="border-b border-gray-700/40">
                <td colSpan={colSpan} className="px-4 py-0">
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
                        className="flex items-center gap-1.5 py-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {open ? "Hide" : "Show"} {serialNumbers.length} serial number{serialNumbers.length !== 1 ? "s" : ""}
                    </button>
                </td>
            </tr>
            {open && (
                <tr className="border-b border-gray-700/40 bg-gray-800/30">
                    <td colSpan={colSpan} className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                            {serialNumbers.map((sn) => (
                                <span
                                    key={sn.serialNumberId}
                                    className="px-2.5 py-1 bg-gray-700 border border-gray-600 rounded-lg text-xs font-mono text-gray-300"
                                >
                                    {sn.serialNumber}
                                </span>
                            ))}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── Desktop table row ────────────────────────────────────────────────────────

function StockRow({ stock }) {
    const firstImage = stock.product?.images?.[0]?.imageURL;

    return (
        <>
            <tr className="border-b border-gray-700/60 hover:bg-gray-700/20 transition group">
                {/* Product */}
                <td className="p-4">
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-700 border border-gray-600 flex-shrink-0">
                            {firstImage
                                ? <img src={firstImage} alt={stock.product?.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-500" /></div>
                            }
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate max-w-[180px]">
                                {stock.product?.title ?? "—"}
                            </p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">#{stock.productId}</p>
                        </div>
                    </div>
                </td>

                {/* Stock ID */}
                <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600/15 text-purple-400 border border-purple-600/25 rounded-lg text-xs font-mono">
                        <Hash className="w-3 h-3" />{stock.stockId}
                    </span>
                </td>

                {/* Qty / Reserved / Remaining */}
                <td className="p-4">
                    <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 w-16">Total</span>
                            <span className="text-gray-200 font-medium">{stock.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 w-16">Reserved</span>
                            <span className="text-yellow-400 font-medium">{stock.reserved}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-500 w-16">Remaining</span>
                            <RemainingText remaining={stock.remaining} quantity={stock.quantity} />
                        </div>
                    </div>
                </td>

                {/* Progress bar */}
                <td className="p-4 min-w-[120px]">
                    <div className="space-y-1.5">
                        <StockLevelBadge remaining={stock.remaining} quantity={stock.quantity} />
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${
                                    stock.remaining === 0
                                        ? "bg-red-500"
                                        : stock.remaining / stock.quantity < 0.2
                                        ? "bg-orange-500"
                                        : "bg-green-500"
                                }`}
                                style={{ width: `${stock.quantity > 0 ? (stock.remaining / stock.quantity) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </td>

                {/* Purchasing Price */}
                <td className="p-4">
                    <p className="text-sm font-semibold text-white">৳{Number(stock.purchasingPrice).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">per unit</p>
                </td>

                {/* Status */}
                <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                        stock.status === "active"
                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                            : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                    }`}>
                        {stock.status}
                    </span>
                </td>

                {/* Barcode */}
                <td className="p-4">
                    {stock.barcodePDF ? (
                        <button
                            onClick={() => window.open(stock.barcodePDF, "_blank")}
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/40 hover:border-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-medium transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                        </button>
                    ) : (
                        <span className="text-gray-600 text-xs">—</span>
                    )}
                </td>
            </tr>

            {/* Expandable serial numbers */}
            <SerialNumbersRow serialNumbers={stock.serialNumbers} colSpan={7} />
        </>
    );
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function MobileStockCard({ stock }) {
    const [showSerials, setShowSerials] = useState(false);
    const firstImage = stock.product?.images?.[0]?.imageURL;
    const serialNumbers = stock.serialNumbers ?? [];

    return (
        <div className="p-5 border-b border-gray-700/60 last:border-b-0">
            {/* Top */}
            <div className="flex gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-700 border border-gray-600 flex-shrink-0">
                    {firstImage
                        ? <img src={firstImage} alt={stock.product?.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-500" /></div>
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white line-clamp-2">{stock.product?.title ?? "—"}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">#{stock.productId}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 bg-purple-600/15 text-purple-400 border border-purple-600/25 rounded text-[10px] font-mono">
                            #{stock.stockId}
                        </span>
                        <StockLevelBadge remaining={stock.remaining} quantity={stock.quantity} />
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                    { label: "Total Qty", value: stock.quantity, cls: "text-gray-200" },
                    { label: "Reserved", value: stock.reserved, cls: "text-yellow-400" },
                    { label: "Remaining", value: <RemainingText remaining={stock.remaining} quantity={stock.quantity} />, cls: "" },
                    { label: "Unit Cost", value: `৳${Number(stock.purchasingPrice).toLocaleString()}`, cls: "text-white font-semibold" },
                ].map(({ label, value, cls }) => (
                    <div key={label} className="bg-gray-700/40 border border-gray-700/50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                        <p className={`text-sm ${cls}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full ${
                            stock.remaining === 0 ? "bg-red-500"
                            : stock.remaining / stock.quantity < 0.2 ? "bg-orange-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${stock.quantity > 0 ? (stock.remaining / stock.quantity) * 100 : 0}%` }}
                    />
                </div>
            </div>

            {/* Serial numbers toggle */}
            {serialNumbers.length > 0 && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={() => setShowSerials((o) => !o)}
                        className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors mb-2"
                    >
                        {showSerials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {showSerials ? "Hide" : "Show"} {serialNumbers.length} serial number{serialNumbers.length !== 1 ? "s" : ""}
                    </button>
                    {showSerials && (
                        <div className="flex flex-wrap gap-1.5 p-3 bg-gray-700/30 border border-gray-700/50 rounded-xl">
                            {serialNumbers.map((sn) => (
                                <span key={sn.serialNumberId} className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded text-[10px] font-mono text-gray-300">
                                    {sn.serialNumber}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Barcode */}
            {stock.barcodePDF && (
                <button
                    onClick={() => window.open(stock.barcodePDF, "_blank")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-600/40 hover:border-blue-600 text-blue-400 hover:text-white rounded-lg text-sm font-medium transition-all"
                >
                    <Download className="w-4 h-4" />
                    Download Barcode PDF
                </button>
            )}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ManageStock() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: allStockData, isLoading, error } = useQuery({
        queryKey: ["all-stock"],
        queryFn: () => getAllStockApi(),
        staleTime: 1000 * 60 * 2,
    });

    const stocks = allStockData?.data || [];

    const filteredStocks = useMemo(() => {
        if (!searchQuery.trim()) return stocks;
        const q = searchQuery.toLowerCase();
        return stocks.filter((s) =>
            s.stockId?.toLowerCase().includes(q) ||
            s.productId?.toLowerCase().includes(q) ||
            s.product?.title?.toLowerCase().includes(q) ||
            s.status?.toLowerCase().includes(q)
        );
    }, [stocks, searchQuery]);

    const TABLE_HEADERS = ["Product", "Stock ID", "Quantity", "Level", "Unit Cost", "Status", "Barcode"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10">

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
                                Manage Stock
                            </h1>
                            <p className="text-gray-400 text-sm">
                                {stocks.length} stock entr{stocks.length !== 1 ? "ies" : "y"} total
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("../add-stock")}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-900/30 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Stock
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
                                placeholder="Search by product name, product ID, stock ID, or status…"
                                className="w-full pl-11 pr-4 py-3 bg-gray-700/80 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 whitespace-nowrap">
                            <Layers className="w-4 h-4" />
                            {filteredStocks.length} result{filteredStocks.length !== 1 ? "s" : ""}
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400 text-sm">Loading stock…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                        <p className="text-red-400 text-sm">Error fetching stock: {error.message}</p>
                    </div>
                )}

                {/* Table */}
                {!isLoading && !error && filteredStocks.length > 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden mb-6">

                        {/* Desktop */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/40 border-b border-gray-700">
                                    <tr>
                                        {TABLE_HEADERS.map((h) => (
                                            <th key={h} className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStocks.map((stock) => (
                                        <StockRow key={stock.stockId} stock={stock} />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="lg:hidden">
                            {filteredStocks.map((stock) => (
                                <MobileStockCard key={stock.stockId} stock={stock} />
                            ))}
                        </div>
                    </div>
                )}

                {/* No search results */}
                {!isLoading && !error && filteredStocks.length === 0 && searchQuery && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-14 text-center">
                        <div className="w-14 h-14 bg-gray-700/60 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-7 h-7 text-gray-500" />
                        </div>
                        <p className="text-gray-300 text-base mb-1">No stock matches "{searchQuery}"</p>
                        <p className="text-gray-500 text-sm">Try a different keyword</p>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && stocks.length === 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-14 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-900/40">
                            <Box className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-200 text-lg font-semibold mb-1">No stock yet</p>
                        <p className="text-gray-500 text-sm mb-6">Add your first stock entry to get started</p>
                        <button
                            onClick={() => navigate("../add-stock")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-200 text-sm"
                        >
                            Add Stock
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageStock;