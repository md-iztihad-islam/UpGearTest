import getPendingOrdersApi from "@/services/dashboard/order/getPendingOrdersApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Eye, Download, Calendar, Loader2, Check, X, CheckSquare, Square } from "lucide-react";
import acceptMultiplePendingOrdersApi from "@/services/dashboard/order/acceptMultiplePendingOrdersApi";
import cancelMultiplePendingOrdersApi from "@/services/dashboard/order/cancelMultiplePendingOrdersApi";

function PendingOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const { data: pendingOrdersData, isLoading } = useQuery({
    queryKey: ["pendingOrdersData", startDate, endDate],
    queryFn: () => getPendingOrdersApi(startDate, endDate),
  });

  // Actual response shape: { message, orders: [...] } — no pagination.
  const orders = pendingOrdersData?.orders || [];

  // Each entry in order.orderProducts is ONE UNIT (backend flattens quantity
  // into individual rows, see addOrderService). Group by productId to get
  // a per-product quantity for display/export.
  const getGroupedProducts = (order) => {
    const groups = new Map();
    (order.orderProducts || []).forEach((op) => {
      const key = op.productId?.productId || op.productId; // handles populated or raw FK
      const name = op.productId?.title || op.productName || `Product ${String(key).slice(0, 8)}`;
      const existing = groups.get(key);
      if (existing) {
        existing.quantity += 1;
      } else {
        groups.set(key, { productId: key, name, quantity: 1, raw: op });
      }
    });
    return Array.from(groups.values());
  };

  // Weight isn't populated on orderProducts in this response; falls back to
  // 0.5kg/unit unless the product relation is populated with specifications.
  const getProductWeight = (op) => {
    const specs = op.productId?.specifications;
    if (!specs) return 0.5;
    const weightSpec = specs.find(
      (s) => s.value && (s.value.toLowerCase().includes("kg") || s.value.toLowerCase().includes("weight"))
    );
    if (weightSpec) {
      const match = weightSpec.value.match(/(\d+\.?\d*)/);
      return match ? parseFloat(match[1]) : 0.5;
    }
    return 0.5;
  };

  const toNumber = (val) => (val === null || val === undefined ? 0 : parseFloat(val));

  const escapeCSVField = (field) => {
    if (field === null || field === undefined) return "";
    const stringField = String(field);
    if (stringField.includes(",") || stringField.includes("\n") || stringField.includes('"')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const phoneFix = (phone) => (phone?.startsWith("+88") ? phone.slice(3) : phone || "");

  const exportToCSV = () => {
    if (!orders || orders.length === 0) {
      alert("No data to export");
      return;
    }

    const csvRows = [];
    csvRows.push(
      [
        "ItemType",
        "StoreName",
        "MerchantOrderId",
        "RecipientName(*)",
        "RecipientPhone(*)",
        "RecipientAddress(*)",
        "RecipientCity(*)",
        "RecipientZone(*)",
        "RecipientArea",
        "AmountToCollect(*)",
        "ItemQuantity",
        "ItemWeight",
        "ItemDesc",
        "SpecialInstruction",
      ].join(",")
    );

    orders.forEach((order) => {
      const grouped = getGroupedProducts(order);
      const totalWeight = (order.orderProducts || [])
        .reduce((sum, op) => sum + getProductWeight(op), 0)
        .toFixed(2);
      const itemDesc = grouped.map((g) => `${g.name} (x${g.quantity})`).join("; ");
      const itemQuantity = order.orderProducts?.length || 0;

      csvRows.push(
        [
          escapeCSVField("parcel"),
          escapeCSVField("UpGear"),
          escapeCSVField(order.orderId),
          escapeCSVField(order.customer?.name),
          escapeCSVField(phoneFix(order.customer?.phone)),
          escapeCSVField(order.deliveryAddress),
          escapeCSVField(""),
          escapeCSVField(""),
          escapeCSVField(""),
          escapeCSVField(toNumber(order.dueAmount ?? order.totalBill)),
          escapeCSVField(itemQuantity),
          escapeCSVField(totalWeight),
          escapeCSVField(itemDesc),
          escapeCSVField(order.deliveryNote || ""),
        ].join(",")
      );
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pending_orders_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const toggleSelect = (orderId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const allSelected = orders.length > 0 && selectedIds.size === orders.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(orders.map((o) => o.orderId)));
  };

  const { mutate: bulkAction, isPending: isUpdating } = useMutation({
    mutationFn: async (action) => {
      const ids = Array.from(selectedIds);
      const apiFn = action === "accept" ? acceptMultiplePendingOrdersApi : cancelMultiplePendingOrdersApi;

      await apiFn(ids);

      return ids;
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["pendingOrdersData"] });
    },
    onError: (error) => {
      alert(error.message || "Some orders failed to update, please retry");
      queryClient.invalidateQueries({ queryKey: ["pendingOrdersData"] });
    },
  });

  const handleAcceptSelected = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Accept ${selectedIds.size} order(s)?`)) return;
    bulkAction("accept");
  };

  const handleCancelSelected = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Cancel ${selectedIds.size} order(s)? This cannot be undone.`)) return;
    bulkAction("cancel");
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Pending Orders
          </h1>
          <p className="text-gray-400 text-lg">View and manage pending orders</p>
        </div>

        {/* Filters and Export */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white">
                <Calendar className="w-4 h-4 text-blue-400" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white">
                <Calendar className="w-4 h-4 text-blue-400" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                disabled={!orders || orders.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Bulk action bar - only shows once something is selected */}
        {selectedIds.size > 0 && (
          <div className="sticky top-4 z-10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-950/60 border border-blue-500/40 rounded-xl px-6 py-4 backdrop-blur">
            <p className="text-sm font-medium text-blue-200">
              {selectedIds.size} order{selectedIds.size > 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAcceptSelected}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Accept Selected
              </button>
              <button
                onClick={handleCancelSelected}
                disabled={isUpdating}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Cancel Selected
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          {/* List Header */}
          <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              disabled={orders.length === 0}
              className="text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Select all"
            >
              {allSelected ? <CheckSquare className="w-5 h-5 text-blue-400" /> : <Square className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              All Pending Orders ({orders.length})
            </h2>
          </div>

          {/* List Content */}
          <div className="divide-y divide-gray-700">
            {isLoading ? (
              <div className="px-6 py-12 text-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading orders...</p>
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-400">No pending orders found</p>
              </div>
            ) : (
              orders.map((order, idx) => {
                const grouped = getGroupedProducts(order);
                const isSelected = selectedIds.has(order.orderId);
                return (
                  <div
                    key={order.orderId}
                    className={`px-6 py-4 transition-colors duration-200 ${
                      isSelected ? "bg-blue-500/10" : "hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <button
                          onClick={() => toggleSelect(order.orderId)}
                          className="flex-shrink-0 mt-1 text-gray-400 hover:text-white transition-colors"
                          aria-label={`Select order ${order.orderId}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-400" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-semibold">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            Order #{order.orderId.slice(0, 8)}
                          </h3>
                          <p className="text-sm text-gray-400 mb-1">
                            {order.customer?.name} • {phoneFix(order.customer?.phone)}
                          </p>
                          <p className="text-sm text-gray-400 mb-2">
                            ৳{toNumber(order.totalBill).toFixed(2)} • {order.deliveryAddress}
                          </p>
                          <div className="space-y-1">
                            {grouped.map((g) => (
                              <div key={g.productId} className="text-xs text-gray-500">
                                {g.name} (Qty: {g.quantity})
                              </div>
                            ))}
                          </div>
                          {(order.deliveryNote || order.sellerNote) && (
                            <div className="mt-2 space-y-0.5">
                              {order.deliveryNote && (
                                <p className="text-xs text-amber-400/80">Courier note: {order.deliveryNote}</p>
                              )}
                              {order.sellerNote && (
                                <p className="text-xs text-purple-400/80">Seller note: {order.sellerNote}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 sm:flex-shrink-0">
                        <button
                          onClick={() => navigate(`details/${order.orderId}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PendingOrders;