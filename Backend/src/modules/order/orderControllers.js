import { streamInvoicesPdf } from "../../utils/invoicePdf.js";
import {
    ORDER_CHANNEL,
    ORDER_STATUS,
    OrderError,
    acceptOrderService,
    cancelOrderService,
    createOrderService,
    deleteShippedOrderService,
    getOrderByIdService,
    getOrderSummaryService,
    getOrdersForInvoiceService,
    getOrdersByStatusService,
    getOrdersInRangeService,
    quoteOrderService,
    runForOrders,
    searchOrdersService,
    shipOrderService,
    trackOrderService,
} from "./orderServices.js";

// Known problems (bad input, out of stock, wrong status…) go back to the
// client as-is; anything else is logged and reported as a server error.
const sendError = (res, error, label) => {
    if (error instanceof OrderError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            ...(error.field ? { field: error.field } : {}),
        });
    }
    console.error(`Error ${label}:`, error);
    return res.status(500).json({ success: false, message: "Something went wrong, please try again" });
};

// ── Placing orders ───────────────────────────────────────────────────────────

// Storefront checkout
export const addOrderController = async (req, res) => {
    try {
        const order = await createOrderService(req.body, { channel: ORDER_CHANNEL.ONLINE });
        return res.status(201).json({ success: true, message: "Order placed successfully", data: order });
    } catch (error) {
        return sendError(res, error, "placing online order");
    }
};

// Dashboard Sell (POS)
export const addDashboardOrderController = async (req, res) => {
    try {
        const order = await createOrderService(req.body, {
            channel: ORDER_CHANNEL.POS,
            employeeId: req.userId,
        });
        return res.status(201).json({ success: true, message: "Sale recorded successfully", data: order });
    } catch (error) {
        return sendError(res, error, "placing POS order");
    }
};

// Live price breakdown for checkout / Sell — same maths as placing the order.
export const quoteOrderController = async (req, res) => {
    try {
        const channel = req.body?.channel === ORDER_CHANNEL.POS ? ORDER_CHANNEL.POS : ORDER_CHANNEL.ONLINE;
        const quote = await quoteOrderService(req.body, channel);
        return res.status(200).json({ success: true, data: quote });
    } catch (error) {
        return sendError(res, error, "quoting order");
    }
};

// ── Customer tracking ────────────────────────────────────────────────────────

export const trackOrderController = async (req, res) => {
    try {
        const order = await trackOrderService(req.body?.orderId, req.body?.phone);
        return res.status(200).json({ success: true, data: order });
    } catch (error) {
        return sendError(res, error, "tracking order");
    }
};

// ── Dashboard reads ──────────────────────────────────────────────────────────

const listByStatus = (status, label) => async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const orders = await getOrdersByStatusService(status, { startDate, endDate });
        return res.status(200).json({ success: true, message: `${label} orders fetched successfully`, orders });
    } catch (error) {
        return sendError(res, error, `fetching ${label.toLowerCase()} orders`);
    }
};

export const getAllPendingOrdersController = listByStatus(ORDER_STATUS.PENDING, "Pending");
export const getAllAcceptedOrdersController = listByStatus(ORDER_STATUS.ACCEPTED, "Accepted");
export const getAllShippedOrdersController = listByStatus(ORDER_STATUS.SHIPPED, "Shipped");
export const getAllCanceledOrdersController = listByStatus(ORDER_STATUS.CANCELED, "Canceled");

export const getOrderByIdController = async (req, res) => {
    try {
        const order = await getOrderByIdService(req.params.orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        return res.status(200).json({ success: true, message: "Order fetched successfully", data: order });
    } catch (error) {
        return sendError(res, error, "fetching order");
    }
};

// Every order placed in the range (reports)
export const getOrdersInRangeController = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const orders = await getOrdersInRangeService({ startDate, endDate });
        return res.status(200).json({ success: true, data: orders });
    } catch (error) {
        return sendError(res, error, "fetching orders for report");
    }
};

// Invoices are generated on request and streamed straight to the browser —
// nothing is stored. One order → invoice_<id>.pdf; several → one combined PDF.
const sendInvoices = async (res, orderIds) => {
    try {
        const orders = await getOrdersForInvoiceService(orderIds);
        const filename = orders.length === 1
            ? `invoice_${orders[0].orderId}.pdf`
            : `invoices_${new Date().toISOString().slice(0, 10)}_${orders.length}-orders.pdf`;
        streamInvoicesPdf(res, orders, filename);
    } catch (error) {
        if (res.headersSent) {
            console.error("Error while streaming invoice PDF:", error);
            return res.end();
        }
        return sendError(res, error, "generating invoices");
    }
};

export const downloadInvoiceController = (req, res) => sendInvoices(res, [req.params.orderId]);

export const downloadInvoicesController = (req, res) => sendInvoices(res, req.body?.orderIds);

// Dashboard home cards
export const getOrderSummaryController = async (req, res) => {
    try {
        const summary = await getOrderSummaryService();
        return res.status(200).json({ success: true, data: summary });
    } catch (error) {
        return sendError(res, error, "fetching order summary");
    }
};

export const searchOrdersController = async (req, res) => {
    try {
        const orders = await searchOrdersService(req.query.query);
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        return sendError(res, error, "searching orders");
    }
};

// ── Dashboard status changes ─────────────────────────────────────────────────

const singleAction = (service, doneMessage, label) => async (req, res) => {
    try {
        const order = await service(req.params.orderId);
        return res.status(200).json({ success: true, message: doneMessage, order });
    } catch (error) {
        return sendError(res, error, label);
    }
};

// Bulk actions run per order; the response says which ones failed and why.
const bulkAction = (service, verb) => async (req, res) => {
    try {
        const { succeeded, failed } = await runForOrders(req.body?.orderIds, service);
        const message = failed.length
            ? `${succeeded.length} order(s) ${verb}, ${failed.length} failed`
            : `${succeeded.length} order(s) ${verb}`;
        return res.status(200).json({ success: failed.length === 0, message, succeeded, failed });
    } catch (error) {
        return sendError(res, error, `bulk ${verb}`);
    }
};

export const acceptOrderController = singleAction(acceptOrderService, "Order accepted successfully", "accepting order");
export const shipOrderController = singleAction(shipOrderService, "Order shipped successfully", "shipping order");
export const cancelOrderController = singleAction(cancelOrderService, "Order canceled successfully", "canceling order");
export const deleteShippedOrderController = singleAction(deleteShippedOrderService, "Order deleted successfully", "deleting shipped order");

export const acceptMultiplePendingOrdersController = bulkAction(acceptOrderService, "accepted");
export const shipMultipleAcceptedOrdersController = bulkAction(shipOrderService, "shipped");
// Cancel works from any open status; the service decides whether stock is
// released (pending) or put back (accepted / shipped).
export const cancelMultiplePendingOrdersController = bulkAction(cancelOrderService, "canceled");
export const cancelMultipleAcceptedOrdersController = bulkAction(cancelOrderService, "canceled");
export const cancelMultipleShippedOrdersController = bulkAction(cancelOrderService, "canceled");
export const deleteMultipleShippedOrdersController = bulkAction(deleteShippedOrderService, "deleted");
