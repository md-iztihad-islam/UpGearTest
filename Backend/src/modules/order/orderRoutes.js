import express from 'express';
import { acceptMultiplePendingOrdersController, acceptOrderController, addOrderController, cancelMultipleAcceptedOrdersController, cancelMultiplePendingOrdersController, cancelMultipleShippedOrdersController, cancelOrderController, getAllAcceptedOrdersController, getAllCanceledOrdersController, getAllPendingOrdersController, getAllShippedOrdersController, getOrderByIdController, shipMultipleAcceptedOrdersController, shipOrderController } from './orderControllers.js';

const router = express.Router();

router.post('/add-order', addOrderController)
router.get('/get-all-pending-orders', getAllPendingOrdersController)
router.get('/get-all-accepted-orders', getAllAcceptedOrdersController)
router.get('/get-all-shipped-orders', getAllShippedOrdersController)
router.get('/get-all-canceled-orders', getAllCanceledOrdersController)
router.get('/get-order/:orderId', getOrderByIdController)
router.patch('/accept-order/:orderId', acceptOrderController)
router.patch('/ship-order/:orderId', shipOrderController)
router.patch('/cancel-order/:orderId', cancelOrderController)

//Routes for multiple orders

router.patch('/accept-multiple-pending-orders', acceptMultiplePendingOrdersController)
router.patch('/cancel-multiple-pending-orders', cancelMultiplePendingOrdersController)
router.patch('/ship-multiple-accepted-orders', shipMultipleAcceptedOrdersController)
router.patch('/cancel-multiple-accepted-orders', cancelMultipleAcceptedOrdersController)
router.patch('/cancel-multiple-shipped-orders', cancelMultipleShippedOrdersController)

export default router;