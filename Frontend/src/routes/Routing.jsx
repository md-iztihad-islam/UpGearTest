import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

// Layouts - Load immediately as they're needed on every page
import DashboardLayout from "@/layout/DashboardLayout";
import MainLayout from "@/layout/MainLayout";
import UpGearLoader from "@/components/loader/Loader";
import Login from "@/dashboard/registerEmployee/Login";
import Warranty from "@/clientPart/warranty/Warranty";
import ProtectedRoute from "@/helpers/dashboard/protectedRoute";
import Category from "@/dashboard/categoryControl/category/Category";
import SearchOrder from "@/dashboard/search/SearchOrder";
import SigninSignUp from "@/clientPart/trackOrder/SigninSignup";
import CutomerDashboard from "@/clientPart/trackOrder/CustmerDashboard";
import Details from "@/clientPart/trackOrder/Details";
import Sell from "@/dashboard/sellControl/Sell";
// import StoreControl from "@/dashboard/storeControl/storeControl";
// import AddStore from "@/dashboard/storeControl/addStore/addStore";
import WarrantyDetails from "@/clientPart/warranty/WarrantyDetails";
import CancelledOrders from "@/dashboard/orderControl/receivedOrders/CancelledOrders";

// Client-facing pages - Lazy loaded
const Home = lazy(() => import("@/clientPart/home/Home"));
const ProductDetails = lazy(() => import("@/clientPart/productDetails/ProductDetails"));
const Checkout = lazy(() => import("@/clientPart/checkout/CheckOut"));
const OrderConfirmation = lazy(() => import("@/clientPart/checkout/orderConfirmPage"));
const AllProducts = lazy(() => import("@/clientPart/productList/allProducts/AllProducts"));
const ProductsBySubcategory = lazy(() => import("@/clientPart/productList/subCategory/ProductsBySubcategory"));
const ProductsByNewArraivals = lazy(() => import("@/clientPart/productList/newArraivals/ProductsByNewArraivals"));
const ProductsByHotDeals = lazy(() => import("@/clientPart/productList/hotDeals/ProductsByHotDeals"));
const ProductsByDiscounted = lazy(() => import("@/clientPart/productList/discounted/ProductsByDiscounted"));
const SearchResultsPage = lazy(() => import("@/clientPart/search/SearchResultsPage"));

// Dashboard - Main
const Dashboard = lazy(() => import("@/dashboard/dashboard"));

// Dashboard - Employee Control
const Employees = lazy(() => import("@/dashboard/employeeControl/Employees"));
const AddEmployee = lazy(() => import("@/dashboard/employeeControl/addEmployee/AddEmployee"));
const ManageEmployee = lazy(() => import("@/dashboard/employeeControl/manageEmployee/ManageEmployee"));
const EditEmployee = lazy(() => import("@/dashboard/employeeControl/manageEmployee/EditEmployee"));

// Dashboard - Expense Control
const Expense = lazy(() => import("@/dashboard/expensesControl/Expense"));
const AddExpense = lazy(() => import("@/dashboard/expensesControl/addExpense/AddExpense"));
const ManageExpense = lazy(() => import("@/dashboard/expensesControl/manageExpense/ManageExpense"));
const EditExpense = lazy(() => import("@/dashboard/expensesControl/manageExpense/EditExpense"));

// Dashboard - Store Control
import AddStore from "@/dashboard/storeControl/addStore/addStore";
import StoreControl from "@/dashboard/storeControl/storeControl";
import ManageStore from "@/dashboard/storeControl/manageStore/ManageStore";
import EditStore from "@/dashboard/storeControl/manageStore/UpdateStore";
import ShippedOrders from "@/dashboard/orderControl/receivedOrders/ShippedOrders";

// Dashboard - Banner Control
const Banner = lazy(() => import("@/dashboard/bannerControl/Banner"));
const AddBanner = lazy(() => import("@/dashboard/bannerControl/addBanner/AddBanner"));

// Dashboard - Brand Control
const Brand = lazy(() => import("@/dashboard/brandControl/Brand"));

// Dashboard - Coupon Control
const Coupon = lazy(() => import("@/dashboard/couponControl/Coupon"));
// const AddCoupon = lazy(() => import("@/dashboard/couponControl/addCoupon/AddCoupon"));
// const ActiveCoupon = lazy(() => import("@/dashboard/couponControl/manageCoupon/ActiveCoupon"));
// const DeactiveCoupon = lazy(() => import("@/dashboard/couponControl/manageCoupon/DeactivateCoupon"));
// const ExpireCoupon = lazy(() => import("@/dashboard/couponControl/manageCoupon/ExpireCoupon"));

// Dashboard - Report Control
const Reports = lazy(() => import("@/dashboard/reportControl/Report"));

// Dashboard - Category Control
const CategoryControl = lazy(() => import("@/dashboard/categoryControl/categoryControl"));
const AddCategory = lazy(() => import("@/dashboard/categoryControl/category/addCategory/AddCategory"));
const ManageCategory = lazy(() => import("@/dashboard/categoryControl/category/manageCategory/ManageCategory"));
const EditCategory = lazy(() => import("@/dashboard/categoryControl/category/manageCategory/EditCategory"));

// Dashboard - Sub-Category Control
const SubCategory = lazy(() => import("@/dashboard/categoryControl/subCategory/SubCategory"));
const AddSubCategory = lazy(() => import("@/dashboard/categoryControl/subCategory/addSubCategory/AddSubCategory"));
const ManageSubCategory = lazy(() => import("@/dashboard/categoryControl/subCategory/manageSubCategory/ManageSubCategory"));
const EditSubCategory = lazy(() => import("@/dashboard/categoryControl/subCategory/manageSubCategory/EditSubCategory"));

// Dashboard - Filter Control
const Filter = lazy(() => import("@/dashboard/categoryControl/filter/filter"));
const AddFilter = lazy(() => import("@/dashboard/categoryControl/filter/addFilter/AddFilter"));
const FilterItem = lazy(() => import("@/dashboard/categoryControl/filterItem/FilterItem"));
const AddFilterItem = lazy(() => import("@/dashboard/categoryControl/filterItem/addFilterItem/AddFilterItem"));

// Dashboard - Stock Control
const Stock = lazy(() => import("@/dashboard/stockControl/Stock"));
const AddStock = lazy(() => import("@/dashboard/stockControl/addStock/AddStock"));
const ManageStock = lazy(() => import("@/dashboard/stockControl/manageStock/ManageStock"));

// Dashboard - Product Control
const Product = lazy(() => import("@/dashboard/productControl/Product"));
const AddProduct = lazy(() => import("@/dashboard/productControl/addProduct/AddProduct"));
const ManageProduct = lazy(() => import("@/dashboard/productControl/manageProduct/MangeProduct"));
const UpdateProduct = lazy(() => import("@/dashboard/productControl/manageProduct/UpdateProduct"));
const AddGroup = lazy(() => import("@/dashboard/productControl/addGroup/AddGroup"));
const ManageGroup = lazy(() => import("@/dashboard/productControl/manageGroup/ManageGroup"));
const EditGroup = lazy(() => import("@/dashboard/productControl/manageGroup/UpdateGroup"));

// Dashboard - Specification Control
const Specification = lazy(() => import("@/dashboard/specificationControl/Specification"));
const AddSpecification = lazy(() => import("@/dashboard/specificationControl/addSpecification/AddSpecification"));
const ManageSpecification = lazy(() => import("@/dashboard/specificationControl/manageSpecification/ManageSpecification"));
const EditSpecification = lazy(() => import("@/dashboard/specificationControl/manageSpecification/EditSpecification"));

// Dashboard - New Arrivals Control
const NewArraivals = lazy(() => import("@/dashboard/newArraivalControl/NewArraivals"));
const AddNewArraivals = lazy(() => import("@/dashboard/newArraivalControl/addToNewArraivals/AddNewArraivals"));
const ManageNewArraivals = lazy(() => import("@/dashboard/newArraivalControl/manageNewArraivals/ManageNewArraivals"));

// Dashboard - Hot Deals Control
const HotDeals = lazy(() => import("@/dashboard/hotDealsControl/HotDeals"));
const AddHotDeals = lazy(() => import("@/dashboard/hotDealsControl/addHotDeals/AddHotDeals"));
const ManageHotDeals = lazy(() => import("@/dashboard/hotDealsControl/manageHotDeals/ManageHotDeals"));

// Dashboard - Discount Control
const Discounted = lazy(() => import("@/dashboard/discountControl/Discounted"));
const AddDiscounted = lazy(() => import("@/dashboard/discountControl/addDiscount/AddDiscounted"));
const ManageDiscounted = lazy(() => import("@/dashboard/discountControl/manageDiscount/ManageDiscounted"));

// Dashboard - Warranty Control
const DashboardWarranty = lazy(() => import("@/dashboard/warrantyControl/Warranty"));

// Dashboard - Order Control
const Orders = lazy(() => import("@/dashboard/orderControl/Orders"));
const PendingOrders = lazy(() => import("@/dashboard/orderControl/receivedOrders/PendingOrders"));
const AcceptedOrders = lazy(() => import("@/dashboard/orderControl/receivedOrders/AccpetedOrders"));
const OrderDetails = lazy(() => import("@/dashboard/orderControl/receivedOrders/OrderDetails"));
const shippedOrders = lazy(() => import("@/dashboard/orderControl/receivedOrders/ShippedOrders"));
const cancelledOrders = lazy(() => import("@/dashboard/orderControl/receivedOrders/CancelledOrders"));

const CustomerControl = lazy(() => import("@/dashboard/customerControl/CustomerControl"));
const CustomerDetails = lazy(() => import("@/dashboard/customerControl/CustomerDetails"));

// 404 Page
const NotFound = () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-600">Page Not Found</p>
    </div>
);

function Routing() {
    return (
        <Routes>
            {/* Client-facing routes */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Suspense fallback={<UpGearLoader />}><Home /></Suspense>} />
                <Route path="signin" element={<Suspense fallback={<UpGearLoader />}><Login /></Suspense>} />
                <Route path="customer/signin" element={<Suspense fallback={<UpGearLoader />}><SigninSignUp /></Suspense>} />
                <Route path="customer/dashboard" element={<Suspense fallback={<UpGearLoader />}><CutomerDashboard /></Suspense>} />
                <Route path="customer/dashbaord/:orderId" element={<Suspense fallback={<UpGearLoader />}><Details /></Suspense>} />
                <Route path="warranty" element={<Suspense fallback={<UpGearLoader />}><Warranty /></Suspense>} />
                <Route path="warranty/:warrantyId" element={<Suspense fallback={<UpGearLoader />}><WarrantyDetails /></Suspense>} />
                <Route path="products/:productSlug" element={<Suspense fallback={<UpGearLoader />}><ProductDetails /></Suspense>} />
                <Route path="checkout" element={<Suspense fallback={<UpGearLoader />}><Checkout /></Suspense>} />
                <Route path="order-confirmation/:orderId" element={<Suspense fallback={<UpGearLoader />}><OrderConfirmation /></Suspense>} />
                <Route path="all-products" element={<Suspense fallback={<UpGearLoader />}><AllProducts /></Suspense>} />
                <Route path="products/sub-category/:subcategorySlug" element={<Suspense fallback={<UpGearLoader />}><ProductsBySubcategory /></Suspense>} />
                <Route path="new-arraivals" element={<Suspense fallback={<UpGearLoader />}><ProductsByNewArraivals /></Suspense>} />
                <Route path="hot-deals" element={<Suspense fallback={<UpGearLoader />}><ProductsByHotDeals /></Suspense>} />
                <Route path="discounted" element={<Suspense fallback={<UpGearLoader />}><ProductsByDiscounted /></Suspense>} />
                <Route path="search" element={<Suspense fallback={<UpGearLoader />}><SearchResultsPage /></Suspense>} />
            </Route>

            {/* Dashboard routes */}
            <Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Suspense fallback={<UpGearLoader />}><Dashboard /></Suspense>} />

                {/* Sell Control */}
                <Route path="sellcontrol" element={<Suspense fallback={<UpGearLoader />}><Sell /></Suspense>} />

                {/* Store Control */}
                <Route path="storecontrol" element={<Suspense fallback={<UpGearLoader />}><StoreControl /></Suspense>} />
                <Route path="storecontrol/add-store" element={<Suspense fallback={<UpGearLoader />}><AddStore /></Suspense>} />
                <Route path="storecontrol/manage-store" element={<Suspense fallback={<UpGearLoader />}><ManageStore /></Suspense>} />
                <Route path="storecontrol/manage-store/edit-store/:storeId" element={<Suspense fallback={<UpGearLoader />}><EditStore /></Suspense>} />

                {/* Banner Control */}
                <Route path="bannercontrol" element={<Suspense fallback={<UpGearLoader />}><Banner /></Suspense>} />
                <Route path="bannercontrol/add-banner" element={<Suspense fallback={<UpGearLoader />}><AddBanner /></Suspense>} />

                {/* Brand Control */}
                <Route path="brandcontrol" element={<Suspense fallback={<UpGearLoader />}><Brand /></Suspense>} />

                {/* Customer Control */}
                <Route path="customercontrol" element={<Suspense fallback={<UpGearLoader />}><CustomerControl /></Suspense>} />
                <Route path="customercontrol/customers/:customerId" element={<Suspense fallback={<UpGearLoader />}><CustomerDetails /></Suspense>} />

                {/* Search Order */}
                <Route path="searchorder" element={<Suspense fallback={<UpGearLoader />}><SearchOrder /></Suspense>} />
                <Route path="searchorder/order/:orderId" element={<Suspense fallback={<UpGearLoader />}><OrderDetails /></Suspense>} />

                {/* Coupon Control */}
                <Route path="couponcontrol" element={<Suspense fallback={<UpGearLoader />}><Coupon /></Suspense>} />
                {/* <Route path="couponcontrol/add-coupon" element={<Suspense fallback={<UpGearLoader />}><AddCoupon /></Suspense>} />
                <Route path="couponcontrol/active-coupon" element={<Suspense fallback={<UpGearLoader />}><ActiveCoupon /></Suspense>} />
                <Route path="couponcontrol/deactivated-coupon" element={<Suspense fallback={<UpGearLoader />}><DeactiveCoupon /></Suspense>} />
                <Route path="couponcontrol/expired-coupon" element={<Suspense fallback={<UpGearLoader />}><ExpireCoupon /></Suspense>} /> */}

                {/* Report Control */}
                <Route path="reportcontrol" element={<Suspense fallback={<UpGearLoader />}><Reports /></Suspense>} />

                {/* Category Control */}
                <Route path="categorycontrol" element={<Suspense fallback={<UpGearLoader />}><CategoryControl /></Suspense>} />
                <Route path="categorycontrol/category" element={<Suspense fallback={<UpGearLoader />}><Category /></Suspense>} />
                <Route path="categorycontrol/category/add-category" element={<Suspense fallback={<UpGearLoader />}><AddCategory /></Suspense>} />
                <Route path="categorycontrol/category/manage-category" element={<Suspense fallback={<UpGearLoader />}><ManageCategory /></Suspense>} />
                <Route path="categorycontrol/category/manage-category/edit-category/:categoryId" element={<Suspense fallback={<UpGearLoader />}><EditCategory /></Suspense>} />

                {/* Sub-Category Control */}
                <Route path="categorycontrol/sub-category" element={<Suspense fallback={<UpGearLoader />}><SubCategory /></Suspense>} />
                <Route path="categorycontrol/sub-category/add-sub-category" element={<Suspense fallback={<UpGearLoader />}><AddSubCategory /></Suspense>} />
                <Route path="categorycontrol/sub-category/manage-sub-category" element={<Suspense fallback={<UpGearLoader />}><ManageSubCategory /></Suspense>} />
                <Route path="categorycontrol/sub-category/manage-sub-category/edit-sub-category/:subcategoryId" element={<Suspense fallback={<UpGearLoader />}><EditSubCategory /></Suspense>} />

                {/* Filter Control */}
                <Route path="categorycontrol/filter" element={<Suspense fallback={<UpGearLoader />}><Filter /></Suspense>} />
                <Route path="categorycontrol/filter/add-filter" element={<Suspense fallback={<UpGearLoader />}><AddFilter /></Suspense>} />
                <Route path="categorycontrol/filter-item" element={<Suspense fallback={<UpGearLoader />}><FilterItem /></Suspense>} />
                <Route path="categorycontrol/filter-item/add-filter-item" element={<Suspense fallback={<UpGearLoader />}><AddFilterItem /></Suspense>} />

                {/* Stock Control */}
                <Route path="stockcontrol" element={<Suspense fallback={<UpGearLoader />}><Stock /></Suspense>} />
                <Route path="stockcontrol/add-stock" element={<Suspense fallback={<UpGearLoader />}><AddStock /></Suspense>} />
                <Route path="stockcontrol/manage-stock" element={<Suspense fallback={<UpGearLoader />}><ManageStock /></Suspense>} />

                {/* Product Control */}
                <Route path="productcontrol" element={<Suspense fallback={<UpGearLoader />}><Product /></Suspense>} />
                <Route path="productcontrol/add-product" element={<Suspense fallback={<UpGearLoader />}><AddProduct /></Suspense>} />
                <Route path="productcontrol/manage-product" element={<Suspense fallback={<UpGearLoader />}><ManageProduct /></Suspense>} />
                <Route path="productcontrol/manage-product/edit-product/:productId" element={<Suspense fallback={<UpGearLoader />}><UpdateProduct /></Suspense>} />
                <Route path="productcontrol/add-group" element={<Suspense fallback={<UpGearLoader />}><AddGroup /></Suspense>} />
                <Route path="productcontrol/manage-group" element={<Suspense fallback={<UpGearLoader />}><ManageGroup /></Suspense>} />
                <Route path="productcontrol/manage-group/edit-group/:groupId" element={<Suspense fallback={<UpGearLoader />}><EditGroup /></Suspense>} />

                {/* Specification Control */}
                <Route path="specificationcontrol" element={<Suspense fallback={<UpGearLoader />}><Specification /></Suspense>} />
                <Route path="specificationcontrol/add-specification" element={<Suspense fallback={<UpGearLoader />}><AddSpecification /></Suspense>} />
                <Route path="specificationcontrol/manage-specification" element={<Suspense fallback={<UpGearLoader />}><ManageSpecification /></Suspense>} />
                <Route path="specificationcontrol/manage-specification/edit-specification/:specificationId" element={<Suspense fallback={<UpGearLoader />}><EditSpecification /></Suspense>} />

                {/* New Arrivals Control */}
                <Route path="newarraivalcontrol" element={<Suspense fallback={<UpGearLoader />}><NewArraivals /></Suspense>} />
                <Route path="newarraivalcontrol/add-to-new-arraivals" element={<Suspense fallback={<UpGearLoader />}><AddNewArraivals /></Suspense>} />
                <Route path="newarraivalcontrol/new-arraivals" element={<Suspense fallback={<UpGearLoader />}><ManageNewArraivals /></Suspense>} />

                {/* Hot Deals Control */}
                <Route path="hotdealscontrol" element={<Suspense fallback={<UpGearLoader />}><HotDeals /></Suspense>} />
                <Route path="hotdealscontrol/add-hot-deals" element={<Suspense fallback={<UpGearLoader />}><AddHotDeals /></Suspense>} />
                <Route path="hotdealscontrol/hot-deals" element={<Suspense fallback={<UpGearLoader />}><ManageHotDeals /></Suspense>} />

                {/* Discount Control */}
                <Route path="discountcontrol" element={<Suspense fallback={<UpGearLoader />}><Discounted /></Suspense>} />
                <Route path="discountcontrol/add-discounted" element={<Suspense fallback={<UpGearLoader />}><AddDiscounted /></Suspense>} />
                <Route path="discountcontrol/discounted" element={<Suspense fallback={<UpGearLoader />}><ManageDiscounted /></Suspense>} />

                {/* Warranty Control */}
                <Route path="warrantycontrol" element={<Suspense fallback={<UpGearLoader />}><DashboardWarranty /></Suspense>} />

                {/* Order Control */}
                <Route path="ordercontrol" element={<Suspense fallback={<UpGearLoader />}><Orders /></Suspense>} />
                <Route path="ordercontrol/pending-orders" element={<Suspense fallback={<UpGearLoader />}><PendingOrders /></Suspense>} />
                <Route path="ordercontrol/pending-orders/details/:orderId" element={<Suspense fallback={<UpGearLoader />}><OrderDetails /></Suspense>} />
                <Route path="ordercontrol/accepted-orders" element={<Suspense fallback={<UpGearLoader />}><AcceptedOrders /></Suspense>} />
                <Route path="ordercontrol/accepted-orders/details/:orderId" element={<Suspense fallback={<UpGearLoader />}><OrderDetails /></Suspense>} />
                <Route path="ordercontrol/cancelled-orders" element={<Suspense fallback={<UpGearLoader />}><CancelledOrders /></Suspense>} />
                <Route path="ordercontrol/cancelled-orders/details/:orderId" element={<Suspense fallback={<UpGearLoader />}><OrderDetails /></Suspense>} />
                <Route path="ordercontrol/shipped-orders" element={<Suspense fallback={<UpGearLoader />}><ShippedOrders /></Suspense>} />
                <Route path="ordercontrol/shipped-orders/details/:orderId" element={<Suspense fallback={<UpGearLoader />}><OrderDetails /></Suspense>} />

                {/* Employee Control */}
                <Route path="employeecontrol" element={<Suspense fallback={<UpGearLoader />}><Employees /></Suspense>} />
                <Route path="employeecontrol/add-employee" element={<Suspense fallback={<UpGearLoader />}><AddEmployee /></Suspense>} />
                <Route path="employeecontrol/manage-employees" element={<Suspense fallback={<UpGearLoader />}><ManageEmployee /></Suspense>} />
                <Route path="employeecontrol/manage-employees/edit-employee/:employeeId" element={<Suspense fallback={<UpGearLoader />}><EditEmployee /></Suspense>} />

                {/* Expense Control */}
                <Route path="expensecontrol" element={<Suspense fallback={<UpGearLoader />}><Expense /></Suspense>} />
                <Route path="expensecontrol/add-expense" element={<Suspense fallback={<UpGearLoader />}><AddExpense /></Suspense>} />
                <Route path="expensecontrol/manage-expenses" element={<Suspense fallback={<UpGearLoader />}><ManageExpense /></Suspense>} />
                <Route path="expensecontrol/manage-expenses/edit-expense/:expenseId" element={<Suspense fallback={<UpGearLoader />}><EditExpense /></Suspense>} />

                {/* 404 for dashboard */}
                <Route path="*" element={<NotFound />} />
            </Route>

            {/* Global 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default Routing;