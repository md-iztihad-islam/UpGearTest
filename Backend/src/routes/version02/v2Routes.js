import express from 'express';
import bannerRoutes from '../../modules/banner/bannerRoutes.js';
import brandRoutes from '../../modules/brand/brandRoutes.js';
import couponRoutes from '../../modules/coupon/couponRoutes.js';
import categoryRoutes from '../../modules/category/categoryRoutes.js';
import subCategoryRoutes from '../../modules/subcategory/subcategoryRoutes.js';
import filterRoutes from '../../modules/filter/filterRoutes.js';
import filterItemRoutes from '../../modules/filterItem/filterItemRoutes.js';
import specificationRoutes from '../../modules/specification/specificationRoutes.js';
import warrantyRoutes from '../../modules/warranty/warrantyRoutes.js';
import groupRoutes from '../../modules/group/groupRoutes.js';
import productRoutes from '../../modules/product/productRoutes.js';
import storeRoutes from '../../modules/store/storeRoutes.js';
import employeeRoutes from '../../modules/employee/employeeRoutes.js';
import expenseRoutes from '../../modules/expense/expenseRoutes.js';
import stockRoutes from '../../modules/stock/stockRoutes.js';
import orderRoutes from '../../modules/order/orderRoutes.js';

const router = express.Router();

router.use('/banner', bannerRoutes);
router.use('/brand', brandRoutes);
router.use('/coupon', couponRoutes);
router.use('/warranty', warrantyRoutes);
router.use('/category', categoryRoutes);
router.use('/sub-category', subCategoryRoutes);
router.use('/filter', filterRoutes);
router.use('/filter-item', filterItemRoutes);
router.use('/specification', specificationRoutes);
router.use('/group', groupRoutes);
router.use('/product', productRoutes);
router.use('/store', storeRoutes);
router.use('/employee', employeeRoutes);
router.use('/expense', expenseRoutes);
router.use('/stock', stockRoutes);
router.use('/order', orderRoutes);



export default router;