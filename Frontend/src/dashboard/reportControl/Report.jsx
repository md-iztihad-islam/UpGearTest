import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { 
    ArrowLeft, 
    FileText, 
    Calendar, 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    Download, 
    Search,
    Package,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import getOrdersByDateRangeApi from "@/services/dashboard/report/getOrdersByDateRangeApi";

function Reports() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportData, setReportData] = useState(null);
    const [expandedProduct, setExpandedProduct] = useState(null);

    const { mutate: generateReport, isPending } = useMutation({
        mutationFn: async ({ startDate, endDate }) => {
            const response = await getOrdersByDateRangeApi(startDate, endDate);
            return response;
        },
        onSuccess: (data) => {
            const orders = data?.data || [];
            calculateReportMetrics(orders);
        },
        onError: (error) => {
            console.log("Error generating report:", error);
            window.showToast("Error generating report", "error");
        }
    });

    const calculateReportMetrics = (orders) => {
        // Filter orders by status
        const acceptedOrders = orders.filter(order => 
            order.orderStatus === "Accepted" || 
            order.orderStatus === "Shipped" || 
            order.orderStatus === "Delivered"
        );
        const cancelledOrders = orders.filter(order => order.orderStatus === "Cancelled");
        const pendingOrders = orders.filter(order => order.orderStatus === "Pending");

        // Calculate revenue from accepted orders (excluding shipping - paid to courier)
        const totalRevenue = acceptedOrders.reduce((sum, order) => {
            const orderRevenue = (order.subTotal || 0) - (order.discount || 0);
            return sum + orderRevenue;
        }, 0);
        
        // Calculate actual cost from stock information
        let totalCost = 0;
        let totalCostCalculated = 0;
        let hasStockData = false;

        const productSales = {};
        
        acceptedOrders.forEach(order => {
            order.products.forEach(product => {
                const productId = product.productId?._id || product.productId || 'unknown';
                const productName = product.productName || "Unknown Product";
                const quantity = product.productQuantity || 0;
                const sellingPrice = product.productPrice || 0;
                const stockInfo = product.stockId;
                
                // Get buying price from stock
                let buyingPrice = 0;
                if (stockInfo && stockInfo.price) {
                    buyingPrice = stockInfo.price;
                    hasStockData = true;
                } else {
                    // Fallback to 70% estimation if stock data unavailable
                    buyingPrice = sellingPrice * 0.70;
                }

                const productCost = buyingPrice * quantity;
                totalCost += productCost;

                // Track product sales
                if (!productSales[productId]) {
                    productSales[productId] = {
                        name: productName,
                        quantity: 0,
                        revenue: 0,
                        cost: 0,
                        sellingPrice: sellingPrice,
                        buyingPrice: buyingPrice,
                        hasActualCost: stockInfo && stockInfo.price ? true : false
                    };
                }
                
                productSales[productId].quantity += quantity;
                productSales[productId].revenue += sellingPrice * quantity;
                productSales[productId].cost += productCost;
            });
        });

        // Calculate financial metrics
        const totalSubtotal = acceptedOrders.reduce((sum, order) => sum + (order.subTotal || 0), 0);
        const totalShipping = acceptedOrders.reduce((sum, order) => sum + (order.shippingCost || 0), 0);
        const totalDiscounts = acceptedOrders.reduce((sum, order) => sum + (order.discount || 0), 0);
        
        // Profit/Loss calculation
        const grossProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;
        const averageOrderValue = acceptedOrders.length > 0 ? totalRevenue / acceptedOrders.length : 0;

        // Payment method breakdown (revenue excluding shipping)
        const paymentMethods = {};
        acceptedOrders.forEach(order => {
            const method = order.paymentMethod || "Unknown";
            if (!paymentMethods[method]) {
                paymentMethods[method] = {
                    count: 0,
                    revenue: 0
                };
            }
            paymentMethods[method].count += 1;
            const orderRevenue = (order.subTotal || 0) - (order.discount || 0);
            paymentMethods[method].revenue += orderRevenue;
        });

        // Top products by revenue
        const topProducts = Object.entries(productSales)
            .map(([id, data]) => ({ 
                id, 
                ...data,
                profit: data.revenue - data.cost,
                profitMargin: data.revenue > 0 ? ((data.revenue - data.cost) / data.revenue * 100) : 0
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        // Daily breakdown (revenue excluding shipping)
        const dailyStats = {};
        acceptedOrders.forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    orders: 0,
                    revenue: 0,
                    cost: 0,
                    shipping: 0
                };
            }
            dailyStats[date].orders += 1;
            const orderRevenue = (order.subTotal || 0) - (order.discount || 0);
            dailyStats[date].revenue += orderRevenue;
            dailyStats[date].shipping += (order.shippingCost || 0);
            
            // Calculate cost for this order
            order.products.forEach(product => {
                const quantity = product.productQuantity || 0;
                const stockInfo = product.stockId;
                const sellingPrice = product.productPrice || 0;
                const buyingPrice = (stockInfo && stockInfo.price) ? stockInfo.price : sellingPrice * 0.70;
                dailyStats[date].cost += buyingPrice * quantity;
            });
        });

        setReportData({
            dateRange: { startDate, endDate },
            summary: {
                totalOrders: orders.length,
                acceptedOrders: acceptedOrders.length,
                cancelledOrders: cancelledOrders.length,
                pendingOrders: pendingOrders.length,
                totalRevenue,
                totalSubtotal,
                totalCost,
                grossProfit,
                profitMargin: profitMargin.toFixed(2),
                totalShipping,
                totalDiscounts,
                averageOrderValue,
                hasStockData
            },
            topProducts,
            paymentMethods,
            dailyStats,
            orders: acceptedOrders,
            allOrders: orders
        });
    };

    const handleGenerateReport = () => {
        if (!startDate || !endDate) {
            window.showToast("Please select both start and end dates", "error");
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            window.showToast("Start date must be before end date", "error");
            return;
        }

        generateReport({ startDate, endDate });
    };

    const handleDownloadCSV = () => {
        if (!reportData) {
            window.showToast("Please generate a report first", "error");
            return;
        }

        const { summary, topProducts, orders, paymentMethods, dailyStats } = reportData;
        
        let csvContent = "";
        
        // Header
        csvContent += "COMPREHENSIVE SALES & PROFIT ANALYSIS REPORT\n";
        csvContent += "=".repeat(80) + "\n";
        csvContent += `Report Generated: ${new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })}\n`;
        csvContent += `Period: ${startDate} to ${endDate}\n`;
        csvContent += `Total Days: ${Object.keys(dailyStats).length}\n\n`;

        // Executive Summary
        csvContent += "EXECUTIVE SUMMARY\n";
        csvContent += "=".repeat(80) + "\n";
        csvContent += `Total Revenue,৳${summary.totalRevenue.toFixed(2)}\n`;
        csvContent += `Total Cost of Goods Sold (COGS),৳${summary.totalCost.toFixed(2)}\n`;
        csvContent += `Gross Profit,৳${summary.grossProfit.toFixed(2)}\n`;
        csvContent += `Gross Profit Margin,${summary.profitMargin}%\n`;
        csvContent += `Average Order Value,৳${summary.averageOrderValue.toFixed(2)}\n`;
        csvContent += `Total Orders Processed,${summary.totalOrders}\n`;
        csvContent += `Completed Orders,${summary.acceptedOrders}\n`;
        csvContent += `Order Completion Rate,${summary.totalOrders > 0 ? ((summary.acceptedOrders / summary.totalOrders) * 100).toFixed(2) : 0}%\n`;
        if (!summary.hasStockData) {
            csvContent += `\n⚠ Note: Cost calculations based on 70% estimation (stock price data unavailable)\n`;
        }
        csvContent += "\n\n";

        // Financial Breakdown
        csvContent += "FINANCIAL BREAKDOWN\n";
        csvContent += "=".repeat(80) + "\n";
        csvContent += "Description,Amount\n";
        csvContent += `Product Subtotal,৳${summary.totalSubtotal.toFixed(2)}\n`;
        csvContent += `Discounts Applied,-৳${summary.totalDiscounts.toFixed(2)}\n`;
        csvContent += `Net Revenue (Subtotal - Discounts),৳${summary.totalRevenue.toFixed(2)}\n`;
        csvContent += `Shipping Collected (Paid to Courier),৳${summary.totalShipping.toFixed(2)}\n`;
        csvContent += `Total Amount Collected,৳${(summary.totalRevenue + summary.totalShipping).toFixed(2)}\n`;
        csvContent += `\n`;
        csvContent += `Cost of Goods Sold,-৳${summary.totalCost.toFixed(2)}\n`;
        csvContent += `Gross Profit,৳${summary.grossProfit.toFixed(2)}\n`;
        csvContent += "\n\n";

        // Order Status Analysis
        csvContent += "ORDER STATUS ANALYSIS\n";
        csvContent += "=".repeat(80) + "\n";
        csvContent += "Status,Count,Percentage\n";
        csvContent += `Completed (Accepted/Shipped/Delivered),${summary.acceptedOrders},${summary.totalOrders > 0 ? ((summary.acceptedOrders / summary.totalOrders) * 100).toFixed(1) : 0}%\n`;
        csvContent += `Pending,${summary.pendingOrders},${summary.totalOrders > 0 ? ((summary.pendingOrders / summary.totalOrders) * 100).toFixed(1) : 0}%\n`;
        csvContent += `Cancelled,${summary.cancelledOrders},${summary.totalOrders > 0 ? ((summary.cancelledOrders / summary.totalOrders) * 100).toFixed(1) : 0}%\n`;
        csvContent += `Total,${summary.totalOrders},100%\n`;
        csvContent += "\n\n";

        // Payment Methods
        csvContent += "PAYMENT METHOD ANALYSIS\n";
        csvContent += "=".repeat(80) + "\n";
        csvContent += "Payment Method,Orders,Revenue,Avg Order Value\n";
        Object.entries(paymentMethods).forEach(([method, data]) => {
            const avg = data.count > 0 ? (data.revenue / data.count) : 0;
            csvContent += `${method},${data.count},৳${data.revenue.toFixed(2)},৳${avg.toFixed(2)}\n`;
        });
        csvContent += "\n\n";

        // Top Performing Products
        csvContent += "TOP 10 PERFORMING PRODUCTS\n";
        csvContent += "=".repeat(80) + "\n";
        csvContent += "Rank,Product Name,Units Sold,Revenue,COGS,Gross Profit,Margin %,Avg Selling Price,Avg Cost Price\n";
        topProducts.forEach((product, idx) => {
            const avgSelling = product.quantity > 0 ? (product.revenue / product.quantity) : 0;
            const avgCost = product.quantity > 0 ? (product.cost / product.quantity) : 0;
            csvContent += `${idx + 1},"${product.name.replace(/"/g, '""')}",${product.quantity},৳${product.revenue.toFixed(2)},৳${product.cost.toFixed(2)},৳${product.profit.toFixed(2)},${product.profitMargin.toFixed(2)}%,৳${avgSelling.toFixed(2)},৳${avgCost.toFixed(2)}\n`;
        });
        csvContent += "\n\n";

        // Daily Performance
        csvContent += "DAILY PERFORMANCE BREAKDOWN\n";
        csvContent += "=".repeat(80) + "\n";
        csvContent += "Date,Orders,Revenue (excl. shipping),Shipping Collected,COGS,Gross Profit,Profit Margin %\n";
        Object.entries(dailyStats)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .forEach(([date, stats]) => {
                const profit = stats.revenue - stats.cost;
                const margin = stats.revenue > 0 ? ((profit / stats.revenue) * 100) : 0;
                csvContent += `${date},${stats.orders},৳${stats.revenue.toFixed(2)},৳${stats.shipping.toFixed(2)},৳${stats.cost.toFixed(2)},৳${profit.toFixed(2)},${margin.toFixed(2)}%\n`;
            });
        csvContent += "\n\n";

        // Detailed Order Information
        csvContent += "DETAILED ORDER RECORDS\n";
        csvContent += "=".repeat(80) + "\n";
        csvContent += "Order ID,Date & Time,Customer Name,Phone,Email,City,Address,Payment Method,Order Status,Products,Units,Subtotal,Shipping (to Courier),Discount,Order Revenue,Total Collected,Estimated COGS,Estimated Profit\n";
        
        orders.forEach(order => {
            const productsStr = order.products
                .map(p => `${p.productName} (Qty: ${p.productQuantity} @ ৳${p.productPrice})`)
                .join('; ');
            
            const totalUnits = order.products.reduce((sum, p) => sum + (p.productQuantity || 0), 0);
            
            // Calculate order cost
            let orderCost = 0;
            order.products.forEach(product => {
                const quantity = product.productQuantity || 0;
                const stockInfo = product.stockId;
                const sellingPrice = product.productPrice || 0;
                const buyingPrice = (stockInfo && stockInfo.price) ? stockInfo.price : sellingPrice * 0.70;
                orderCost += buyingPrice * quantity;
            });
            
            const orderRevenue = (order.subTotal || 0) - (order.discount || 0);
            const orderProfit = orderRevenue - orderCost;
            const orderDate = new Date(order.createdAt).toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' });
            
            csvContent += `${order.orderId},`;
            csvContent += `"${orderDate}",`;
            csvContent += `"${(order.customerName || 'N/A').replace(/"/g, '""')}",`;
            csvContent += `"${order.customerPhone || 'N/A'}",`;
            csvContent += `"${order.customerEmail || 'N/A'}",`;
            csvContent += `"${(order.city || 'N/A').replace(/"/g, '""')}",`;
            csvContent += `"${(order.deliverAddress || 'N/A').replace(/"/g, '""')}",`;
            csvContent += `${order.paymentMethod || 'N/A'},`;
            csvContent += `${order.orderStatus},`;
            csvContent += `"${productsStr.replace(/"/g, '""')}",`;
            csvContent += `${totalUnits},`;
            csvContent += `৳${(order.subTotal || 0).toFixed(2)},`;
            csvContent += `৳${(order.shippingCost || 0).toFixed(2)},`;
            csvContent += `৳${(order.discount || 0).toFixed(2)},`;
            csvContent += `৳${orderRevenue.toFixed(2)},`;
            csvContent += `৳${(order.totalAmount || 0).toFixed(2)},`;
            csvContent += `৳${orderCost.toFixed(2)},`;
            csvContent += `৳${orderProfit.toFixed(2)}\n`;
        });

        csvContent += "\n\n";
        csvContent += "=".repeat(80) + "\n";
        csvContent += "END OF REPORT\n";
        csvContent += "=".repeat(80) + "\n";

        // Add BOM for UTF-8 support in Excel
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `Sales_Report_${startDate}_to_${endDate}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.showToast("Report downloaded successfully", "success");
    };

    const formatCurrency = (amount) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatPercentage = (value) => {
        return `${parseFloat(value).toFixed(2)}%`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                    <span className="font-medium">Back to Dashboard</span>
                </button>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-1">
                                Sales Analytics
                            </h1>
                            <p className="text-slate-400 text-lg font-light">
                                Comprehensive profit & loss analysis
                            </p>
                        </div>
                    </div>
                </div>

                {/* Date Range Selection */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 mb-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-emerald-400" />
                        Report Period
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-300">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-12 px-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={handleGenerateReport}
                                disabled={isPending}
                                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Generate Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Results */}
                {reportData && (
                    <div className="space-y-8">
                        {/* Cost Data Warning */}
                        {!reportData.summary.hasStockData && (
                            <div className="bg-amber-900/20 border border-amber-700/50 rounded-2xl p-6 flex items-start gap-4">
                                <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="text-amber-200 font-semibold mb-1">Estimated Cost Calculation</h3>
                                    <p className="text-amber-100/70 text-sm">
                                        Cost of goods sold (COGS) is estimated at 70% of selling price. For accurate profit calculations, ensure stock records include buying prices.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Key Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Total Revenue */}
                            <div className="group bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-emerald-300 text-sm font-semibold uppercase tracking-wide">Revenue</h3>
                                    <DollarSign className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(reportData.summary.totalRevenue)}</p>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-emerald-300/70">{reportData.summary.acceptedOrders} orders</span>
                                    <span className="text-emerald-300/70">Avg: {formatCurrency(reportData.summary.averageOrderValue)}</span>
                                </div>
                            </div>

                            {/* Total Cost */}
                            <div className="group bg-gradient-to-br from-rose-900/50 to-rose-800/30 border border-rose-700/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-rose-300 text-sm font-semibold uppercase tracking-wide">COGS</h3>
                                    <TrendingDown className="w-6 h-6 text-rose-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(reportData.summary.totalCost)}</p>
                                <p className="text-rose-300/70 text-xs">
                                    {reportData.summary.hasStockData ? 'Actual stock prices' : '70% estimation'}
                                </p>
                            </div>

                            {/* Gross Profit */}
                            <div className={`group bg-gradient-to-br ${reportData.summary.grossProfit >= 0 ? 'from-blue-900/50 to-blue-800/30 border-blue-700/50' : 'from-red-900/50 to-red-800/30 border-red-700/50'} border rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.02]`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`${reportData.summary.grossProfit >= 0 ? 'text-blue-300' : 'text-red-300'} text-sm font-semibold uppercase tracking-wide`}>
                                        Gross Profit
                                    </h3>
                                    <TrendingUp className={`w-6 h-6 ${reportData.summary.grossProfit >= 0 ? 'text-blue-400' : 'text-red-400'} group-hover:scale-110 transition-transform`} />
                                </div>
                                <p className="text-3xl font-bold text-white mb-2">{formatCurrency(reportData.summary.grossProfit)}</p>
                                <p className={`${reportData.summary.grossProfit >= 0 ? 'text-blue-300/70' : 'text-red-300/70'} text-xs`}>
                                    Margin: {formatPercentage(reportData.summary.profitMargin)}
                                </p>
                            </div>

                            {/* Total Orders */}
                            <div className="group bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02]">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-purple-300 text-sm font-semibold uppercase tracking-wide">Orders</h3>
                                    <Package className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <p className="text-3xl font-bold text-white mb-2">{reportData.summary.totalOrders}</p>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-green-400">{reportData.summary.acceptedOrders} ✓</span>
                                    <span className="text-yellow-400">{reportData.summary.pendingOrders} ⏳</span>
                                    <span className="text-red-400">{reportData.summary.cancelledOrders} ✕</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Breakdown & Payment Methods */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Financial Breakdown */}
                            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                                    <DollarSign className="w-6 h-6 text-emerald-400" />
                                    Financial Breakdown
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                                        <span className="text-slate-300 font-medium">Product Subtotal</span>
                                        <span className="text-white font-semibold text-lg">{formatCurrency(reportData.summary.totalSubtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                                        <span className="text-slate-300 font-medium">Discounts Applied</span>
                                        <span className="text-rose-400 font-semibold text-lg">-{formatCurrency(reportData.summary.totalDiscounts)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 bg-slate-800/50 rounded-xl px-4 mt-4">
                                        <span className="text-white font-bold text-lg">Net Revenue</span>
                                        <span className="text-emerald-400 font-bold text-2xl">{formatCurrency(reportData.summary.totalRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
                                        <span className="text-slate-300 font-medium text-sm">Shipping (Paid to Courier)</span>
                                        <span className="text-slate-400 font-medium">৳{reportData.summary.totalShipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-slate-700/50 mt-6">
                                        <span className="text-slate-300 font-medium">Cost of Goods Sold</span>
                                        <span className="text-rose-400 font-semibold text-lg">-{formatCurrency(reportData.summary.totalCost)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-900/30 to-emerald-900/30 rounded-xl px-4 mt-4 border border-blue-700/30">
                                        <span className="text-white font-bold text-lg">Gross Profit</span>
                                        <span className={`${reportData.summary.grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold text-2xl`}>
                                            {formatCurrency(reportData.summary.grossProfit)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                                <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                                    <DollarSign className="w-6 h-6 text-emerald-400" />
                                    Payment Methods
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(reportData.paymentMethods).map(([method, data]) => {
                                        const percentage = reportData.summary.acceptedOrders > 0 
                                            ? (data.count / reportData.summary.acceptedOrders * 100) 
                                            : 0;
                                        return (
                                            <div key={method} className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-semibold">{method}</span>
                                                    <span className="text-emerald-400 font-bold">{formatCurrency(data.revenue)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400">{data.count} orders</span>
                                                    <span className="text-slate-400">{percentage.toFixed(1)}% of total</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                                Top Selling Products
                            </h3>
                            <div className="space-y-3">
                                {reportData.topProducts.length > 0 ? (
                                    reportData.topProducts.map((product, idx) => (
                                        <div key={product.id} className="bg-slate-800/50 rounded-xl overflow-hidden hover:bg-slate-800/70 transition-all">
                                            <div 
                                                className="p-4 cursor-pointer"
                                                onClick={() => setExpandedProduct(expandedProduct === idx ? null : idx)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                                        <span className="text-white text-sm font-bold">#{idx + 1}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-white font-semibold truncate">{product.name}</p>
                                                            {expandedProduct === idx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm">
                                                            <span className="text-slate-400">{product.quantity} units</span>
                                                            <span className="text-emerald-400 font-semibold">{formatCurrency(product.revenue)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {expandedProduct === idx && (
                                                <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Units Sold:</span>
                                                        <span className="text-white font-medium">{product.quantity}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Revenue:</span>
                                                        <span className="text-emerald-400 font-semibold">{formatCurrency(product.revenue)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Cost (COGS):</span>
                                                        <span className="text-rose-400 font-semibold">{formatCurrency(product.cost)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Gross Profit:</span>
                                                        <span className={`${product.profit >= 0 ? 'text-blue-400' : 'text-red-400'} font-semibold`}>
                                                            {formatCurrency(product.profit)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-400">Profit Margin:</span>
                                                        <span className={`${product.profitMargin >= 0 ? 'text-blue-400' : 'text-red-400'} font-semibold`}>
                                                            {formatPercentage(product.profitMargin)}
                                                        </span>
                                                    </div>
                                                    {!product.hasActualCost && (
                                                        <p className="text-amber-400 text-xs mt-2 italic">* Cost estimated at 70%</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 text-center py-8">No product data available</p>
                                )}
                            </div>
                        </div>

                        {/* Download Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleDownloadCSV}
                                className="px-10 h-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl font-bold text-lg hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/30 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Download className="w-6 h-6" />
                                Download Comprehensive Report (CSV)
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!reportData && !isPending && (
                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-16 text-center shadow-2xl">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-semibold text-slate-300 mb-3">No Report Generated</h3>
                        <p className="text-slate-500 text-lg max-w-md mx-auto">
                            Select a date range above and click "Generate Report" to view comprehensive sales analytics and profit analysis
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reports;