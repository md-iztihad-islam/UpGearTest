import getShippedOrdersApi from "@/services/dashboard/order/getShippedOrdersApi";
import cancelMultipleShippedOrdersApi from "@/services/dashboard/order/cancelMultipleShippedOrdersApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Eye, Download, Calendar, Loader2, FileText, X, CheckSquare, Square } from "lucide-react";

function ShippedOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  const { data: shippedOrdersData, isLoading } = useQuery({
    queryKey: ["shippedOrdersData", startDate, endDate],
    queryFn: () => getShippedOrdersApi(startDate, endDate),
  });

  // Same controller response shape as accepted orders: { message, orders: [...] }
  const orders = shippedOrdersData?.orders || [];

  const selectedOrders = orders.filter((o) => selectedIds.has(o.orderId));

  // orderProducts is one row per unit — same as AcceptedOrders.
  const getGroupedProducts = (order) => {
    const groups = new Map();
    (order.orderProducts || []).forEach((op) => {
      const key = op.product?.productId || op.productId;
      const name = op.product?.title || `Product ${String(key).slice(0, 8)}`;
      const existing = groups.get(key);
      if (existing) existing.quantity += 1;
      else groups.set(key, { productId: key, name, quantity: 1 });
    });
    return Array.from(groups.values());
  };

  const toNumber = (val) => (val === null || val === undefined ? 0 : parseFloat(val));

  const phoneFix = (phone) => (phone?.startsWith("+88") ? phone.slice(3) : phone || "");

  const escapeCSVField = (field) => {
    if (field === null || field === undefined) return "";
    const stringField = String(field);
    if (stringField.includes(",") || stringField.includes("\n") || stringField.includes('"')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const exportSelectedToCSV = () => {
    if (selectedOrders.length === 0) {
      alert("Select at least one order to export");
      return;
    }

    const csvRows = [];
    csvRows.push(
      ["OrderId", "CustomerName", "Phone", "Address", "TotalBill", "ShippedItems"].join(",")
    );

    selectedOrders.forEach((order) => {
      const grouped = getGroupedProducts(order);
      const itemDesc = grouped.map((g) => `${g.name} (x${g.quantity})`).join("; ");

      csvRows.push(
        [
          escapeCSVField(order.orderId),
          escapeCSVField(order.customer?.name),
          `="${phoneFix(order.customer?.phone)}"`,
          escapeCSVField(order.deliveryAddress),
          escapeCSVField(toNumber(order.totalBill)),
          escapeCSVField(itemDesc),
        ].join(",")
      );
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shipped_orders_selected_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadSelectedInvoices = () => {
    const withInvoice = selectedOrders.filter((o) => o.invoiceURL);
    if (withInvoice.length === 0) {
      alert("None of the selected orders have an invoice available");
      return;
    }
    withInvoice.forEach((o) => window.open(o.invoiceURL, "_blank"));
    if (withInvoice.length < selectedOrders.length) {
      alert(`${selectedOrders.length - withInvoice.length} selected order(s) had no invoice and were skipped`);
    }
  };

  const handleDownloadInvoice = (invoiceURL) => {
    if (invoiceURL) {
      window.open(invoiceURL, "_blank");
    } else {
      alert("Invoice not available for this order");
    }
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

  const { mutate: cancelSelected, isPending: isCancelling } = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selectedIds);
      return cancelMultipleShippedOrdersApi(ids);
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["shippedOrdersData"] });
    },
    onError: (error) => {
      alert(error?.response?.data?.message || "Some orders failed to cancel, please retry");
      queryClient.invalidateQueries({ queryKey: ["shippedOrdersData"] });
    },
  });

  const handleCancelSelected = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Cancel ${selectedIds.size} shipped order(s)? This cannot be undone.`)) return;
    cancelSelected();
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Shipped Orders
          </h1>
          <p className="text-gray-400 text-lg">View and manage shipped orders</p>
        </div>

        {/* Filters */}
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
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="sticky top-4 z-10 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-950/60 border border-blue-500/40 rounded-xl px-6 py-4 backdrop-blur">
            <p className="text-sm font-medium text-blue-200">
              {selectedIds.size} order{selectedIds.size > 1 ? "s" : ""} selected
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={exportSelectedToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={downloadSelectedInvoices}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                <FileText className="w-4 h-4" />
                Invoices
              </button>
              <button
                onClick={handleCancelSelected}
                disabled={isCancelling}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium"
              >
                {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Cancel Selected
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
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
              All Shipped Orders ({orders.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-700">
            {isLoading ? (
              <div className="px-6 py-12 text-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading orders...</p>
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-400">No shipped orders found</p>
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
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
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
                        </div>
                      </div>

                      <div className="flex gap-3 sm:flex-shrink-0">
                        <button
                          onClick={() => handleDownloadInvoice(order.invoiceURL)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden sm:inline">Invoice</span>
                        </button>
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

export default ShippedOrders;