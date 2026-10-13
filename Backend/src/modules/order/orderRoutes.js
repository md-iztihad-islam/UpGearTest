import express from 'express';
import isAuthenticated from '../../utils/isAuthenticated.js';
import {
    acceptMultiplePendingOrdersController,
    acceptOrderController,
    addDashboardOrderController,
    addOrderController,
    cancelMultipleAcceptedOrdersController,
    cancelMultiplePendingOrdersController,
    cancelMultipleShippedOrdersController,
    cancelOrderController,
    deleteMultipleShippedOrdersController,
    deleteShippedOrderController,
    downloadInvoiceController,
    downloadInvoicesController,
    getAllAcceptedOrdersController,
    getAllCanceledOrdersController,
    getAllPendingOrdersController,
    getAllShippedOrdersController,
    getOrderByIdController,
    getOrderSummaryController,
    getOrdersInRangeController,
    quoteOrderController,
    searchOrdersController,
    shipMultipleAcceptedOrdersController,
    shipOrderController,
    trackOrderController,
} from './orderControllers.js';

const router = express.Router();

// ── Public (storefront) ──────────────────────────────────────────────────────
router.post('/quote', quoteOrderController)
router.post('/add-order', addOrderController)
router.post('/track-order', trackOrderController)

// ── Dashboard (signed-in staff only) ─────────────────────────────────────────
router.post('/dashboard/add', isAuthenticated, addDashboardOrderController)

router.get('/get-all-pending-orders', isAuthenticated, getAllPendingOrdersController)
router.get('/get-all-accepted-orders', isAuthenticated, getAllAcceptedOrdersController)
router.get('/get-all-shipped-orders', isAuthenticated, getAllShippedOrdersController)
router.get('/get-all-canceled-orders', isAuthenticated, getAllCanceledOrdersController)
router.get('/search-orders', isAuthenticated, searchOrdersController)
router.get('/summary', isAuthenticated, getOrderSummaryController)
router.get('/date-range', isAuthenticated, getOrdersInRangeController)
router.get('/get-order/:orderId', isAuthenticated, getOrderByIdController)

// Invoices — generated on request, never stored
router.get('/invoice/:orderId', isAuthenticated, downloadInvoiceController)
router.post('/invoices', isAuthenticated, downloadInvoicesController)

router.patch('/accept-order/:orderId', isAuthenticated, acceptOrderController)
router.patch('/ship-order/:orderId', isAuthenticated, shipOrderController)
router.patch('/cancel-order/:orderId', isAuthenticated, cancelOrderController)
// Deleting shipped orders — removes the order record only, stock is untouched
router.delete('/delete-shipped-order/:orderId', isAuthenticated, deleteShippedOrderController)

// Bulk actions — each order is processed on its own; the response lists failures
router.patch('/accept-multiple-pending-orders', isAuthenticated, acceptMultiplePendingOrdersController)
router.patch('/cancel-multiple-pending-orders', isAuthenticated, cancelMultiplePendingOrdersController)
router.patch('/ship-multiple-accepted-orders', isAuthenticated, shipMultipleAcceptedOrdersController)
router.patch('/cancel-multiple-accepted-orders', isAuthenticated, cancelMultipleAcceptedOrdersController)
router.patch('/cancel-multiple-shipped-orders', isAuthenticated, cancelMultipleShippedOrdersController)
router.post('/delete-multiple-shipped-orders', isAuthenticated, deleteMultipleShippedOrdersController)

export default router;
