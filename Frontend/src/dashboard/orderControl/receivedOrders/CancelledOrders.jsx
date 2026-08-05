import getCancelledOrdersApi from "@/services/dashboard/order/getCancelledOrdersApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Eye, Download, Calendar, Loader2 } from "lucide-react";

function CancelledOrders() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: cancelledOrdersData, isLoading } = useQuery({
        queryKey: ['cancelledOrdersData', page, startDate, endDate],
        queryFn: () => getCancelledOrdersApi(page, limit, startDate, endDate),
    });

    console.log("Cancelled Orders Data:", cancelledOrdersData);

    const orders = cancelledOrdersData?.data || [];
    const pagination = cancelledOrdersData?.pagination || {};

    // Helper function to extract weight from product specifications
    const getProductWeight = (product) => {
        if (!product.productId || !product.productId.specifications) {
            return '0.5';
        }
        
        const weightSpec = product.productId.specifications.find(spec => 
            spec.value && (
                spec.value.toLowerCase().includes('kg') || 
                spec.value.toLowerCase().includes('weight')
            )
        );
        
        if (weightSpec) {
            const match = weightSpec.value.match(/(\d+\.?\d*)/);
            return match ? match[1] : '0.5';
        }
        
        return '0.5';
    };

    // Helper function to escape CSV fields
    const escapeCSVField = (field) => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    // Export to CSV
    const exportToCSV = () => {
        if (!orders || orders.length === 0) {
            alert("No data to export");
            return;
        }

        const csvRows = [];
        csvRows.push([
            'ItemType',
            'StoreName',
            'MerchantOrderId',
            'RecipientName(*)',
            'RecipientPhone(*)',
            'RecipientAddress(*)',
            'RecipientCity(*)',
            'RecipientZone(*)',
            'RecipientArea',
            'AmountToCollect(*)',
            'ItemQuantity',
            'ItemWeight',
            'ItemDesc',
            'SpecialInstruction',
            'CancellationReason'
        ].join(','));

        orders.forEach(order => {
            const totalWeight = order.products.reduce((sum, p) => {
                const weight = parseFloat(getProductWeight(p));
                return sum + (weight * p.productQuantity);
            }, 0).toFixed(2);

            const itemDesc = order.products.map(p => {
                const name = p.productName || p.productId?.title || 'Product';
                return `${name} (x${p.productQuantity})`;
            }).join('; ');

            csvRows.push([
                escapeCSVField('parcel'),
                escapeCSVField('UpGear'),
                escapeCSVField(order.orderId),
                escapeCSVField(order.customerName),
                escapeCSVField(order.customerPhone),
                escapeCSVField(order.deliverAddress),
                escapeCSVField(order.city || 'Dhaka'),
                escapeCSVField(order.postalCode || ''),
                escapeCSVField(order.insideDhaka ? 'Inside Dhaka' : 'Outside Dhaka'),
                escapeCSVField(order.totalAmount),
                escapeCSVField(order.products.reduce((sum, p) => sum + p.productQuantity, 0)),
                escapeCSVField(totalWeight),
                escapeCSVField(itemDesc),
                escapeCSVField(''),
                escapeCSVField(order.cancellationReason || 'N/A')
            ].join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cancelled_orders_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
        setPage(1);
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
                        Cancelled Orders
                    </h1>
                    <p className="text-gray-400 text-lg">
                        View all cancelled orders
                    </p>
                </div>

                {/* Filters and Export */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Start Date */}
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

                        {/* End Date */}
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

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={handleClearFilters}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                Clear Filters
                            </button>
                        </div>

                        {/* Export CSV */}
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

                {/* Orders List */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    {/* List Header */}
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                            All Cancelled Orders ({pagination.total || 0})
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
                                <p className="text-gray-400">No cancelled orders found</p>
                            </div>
                        ) : (
                            orders.map((order, idx) => (
                                <div
                                    key={order._id}
                                    className="px-6 py-4 hover:bg-gray-800/50 transition-colors duration-200"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Order Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                                                {((page - 1) * limit) + idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    Order #{order.orderId}
                                                </h3>
                                                <p className="text-sm text-gray-400 mb-2">
                                                    ৳{order.totalAmount?.toFixed(2)} • {order.deliverAddress}
                                                </p>
                                                {order.cancellationReason && (
                                                    <p className="text-sm text-red-400 mb-2">
                                                        Reason: {order.cancellationReason}
                                                    </p>
                                                )}
                                                <div className="space-y-1">
                                                    {order.products?.map((product, pIdx) => (
                                                        <div key={product._id} className="text-xs text-gray-500">
                                                            {pIdx + 1}. {product.productId?.title || product.productName} (Qty: {product.productQuantity})
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 sm:flex-shrink-0">
                                            <button
                                                onClick={() => navigate(`details/${order._id}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span className="hidden sm:inline">Details</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-400">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.totalPages}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CancelledOrders;