import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
    Plus, Trash2, ShoppingCart, User, Phone,
    Mail, MapPin, CreditCard, Package, Tag, CheckCircle,
    AlertCircle, Loader2, ChevronDown, Store,
    ChevronRight, Building2, X
} from 'lucide-react';
import getAllStoresApi from '@/services/dashboard/store/getAllStoresApi';
import getCouponByCodeApi from '@/services/dashboard/coupon/getCouponByCodeApi';
import updateCouponApi from '@/services/dashboard/coupon/updateCouponApi';
import addOrderFromDashboardApi from '@/services/clientPart/order/addOrderFromDashboardApi';
import SearchForSale from './SearchForSale';

const INPUT = "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm";
const SELECT = `${INPUT} appearance-none cursor-pointer`;

function Field({ label, icon: Icon, children }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {Icon && <Icon className="w-3.5 h-3.5" />} {label}
            </label>
            {children}
        </div>
    );
}

const getAvailableQty = (product) => {
    if (!product?.stocks?.length) return 0;
    return product.stocks.reduce((sum, s) => sum + Math.max(0, (s.remaining || 0) - (s.reserved || 0)), 0);
};

// ── Store Selection Gate ──────────────────────────────────────
function StoreSelector({ onSelect }) {
    const { data: storeData, isLoading, isError } = useQuery({
        queryKey: ['stores'],
        queryFn: () => getAllStoresApi(),
    });

    const stores = storeData?.data || storeData?.stores || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-gray-400 text-sm">Loading stores...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-red-900/30 border border-red-700 rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm text-center">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                    <p className="text-red-400 font-semibold">Failed to load stores</p>
                    <p className="text-gray-500 text-sm">Please refresh the page and try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg">
                <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Select Store
                    </h1>
                    <p className="text-gray-400 mt-2">Choose the outlet you are selling from</p>
                </div>

                {stores.length === 0 ? (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
                        <Building2 className="w-12 h-12 text-gray-600" />
                        <p className="text-gray-400 font-semibold">No stores available</p>
                        <p className="text-gray-600 text-sm">Please contact your administrator.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stores.map(store => (
                            <button
                                key={store.storeId}
                                onClick={() => onSelect(store)}
                                className="group w-full flex items-center justify-between p-5 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 hover:border-blue-500/60 rounded-2xl transition-all duration-200 text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 group-hover:bg-blue-500/20 rounded-xl transition-colors">
                                        <Store className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-base">{store.name}</p>
                                        {store.address && (
                                            <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {store.address}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors shrink-0" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Product Add Panel ─────────────────────────────────────────
// No more manual serial number entry — the backend reserves and assigns
// serials automatically at order time (reserveStockQuantityRepository).
function ProductSearch({ onAdd }) {
    const [selected, setSelected] = useState(null);
    const [qty, setQty] = useState(1);

    const availableQty = selected ? getAvailableQty(selected) : 0;
    const qtyExceedsStock = selected && qty > availableQty;

    const handleProductSelect = (product) => {
        setSelected(product);
        setQty(1);
    };

    const handleAdd = () => {
        if (!selected || qtyExceedsStock || availableQty <= 0) return;
        onAdd({
            productId: selected.productId,
            productName: selected.title,
            originalPrice: selected.mainPrice ?? selected.price,
            discountAmount: selected.discount || 0,
            purchasePrice: selected.price,
            productQuantity: qty,
        });
        setSelected(null);
        setQty(1);
    };

    const handleClearSelected = () => {
        setSelected(null);
        setQty(1);
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" /> Add Product
            </h3>

            <SearchForSale
                placeholder="Search product by name..."
                onSelectProduct={handleProductSelect}
                className="w-full"
            />

            {selected && (
                <div className="space-y-4 pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        {(selected.bannerImage || selected.images?.[0]?.url) && (
                            <img
                                src={selected.bannerImage || selected.images?.[0]?.url}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{selected.title}</p>
                            <p className="text-blue-400 text-xs mt-0.5">
                                ৳{(selected.price || 0).toLocaleString()} per unit • {availableQty} available
                            </p>
                        </div>
                        <button
                            onClick={handleClearSelected}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {availableQty <= 0 ? (
                        <p className="text-sm text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> This product is out of stock and can't be sold right now.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Quantity" icon={Package}>
                                <input
                                    type="number"
                                    min={1}
                                    max={availableQty}
                                    value={qty}
                                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                    className={INPUT}
                                />
                                {qtyExceedsStock && (
                                    <p className="text-xs text-red-400 mt-1">Only {availableQty} in stock.</p>
                                )}
                            </Field>
                            <Field label="Line Total" icon={Tag}>
                                <input
                                    type="text"
                                    readOnly
                                    value={`৳${((selected.price || 0) * qty).toLocaleString()}`}
                                    className={`${INPUT} opacity-60 cursor-not-allowed`}
                                />
                            </Field>
                        </div>
                    )}

                    <button
                        onClick={handleAdd}
                        disabled={availableQty <= 0 || qtyExceedsStock}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" /> Add to Order
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Main Sell Component ───────────────────────────────────────
function Sell() {
    const [selectedStore, setSelectedStore] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [insideDhaka, setInsideDhaka] = useState(true);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [shippingCost, setShippingCost] = useState(0);
    const [products, setProducts] = useState([]);
    const [feedback, setFeedback] = useState(null);

    // Coupon — mirrors Checkout.jsx exactly.
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isCouponApplying, setIsCouponApplying] = useState(false);

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 4000);
    };

    const normalizePhone = (value) => {
        let v = value.replace(/\s+/g, '');
        if (v.startsWith('+880')) v = '0' + v.slice(4);
        else if (v.startsWith('880')) v = '0' + v.slice(3);
        return v;
    };

    const subTotal = products.reduce((sum, p) => sum + (p.purchasePrice * p.productQuantity), 0);
    const couponDiscount = appliedCoupon?.discount || 0;
    const totalAmount = Math.max(0, subTotal + Number(shippingCost) - couponDiscount);

    const handleAddProduct = (product) => {
        const existing = products.findIndex(p => p.productId === product.productId);
        if (existing !== -1) {
            const updated = [...products];
            updated[existing].productQuantity += product.productQuantity;
            setProducts(updated);
        } else {
            setProducts(prev => [...prev, product]);
        }
        showFeedback(`${product.productName} added to order`, 'success');
    };

    const handleRemoveProduct = (index) =>
        setProducts(prev => prev.filter((_, i) => i !== index));

    const { mutate: applyCouponMutation } = useMutation({
        mutationFn: ({ couponId, updatedData }) => updateCouponApi(couponId, updatedData),
    });

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponInput('');
        setCouponError('');
    };

    const handleApplyCoupon = async () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) {
            setCouponError('Please enter a coupon code');
            return;
        }

        setIsCouponApplying(true);
        setCouponError('');

        try {
            const response = await getCouponByCodeApi(code);
            const coupon = response?.data;

            if (!coupon) throw new Error('Coupon not found');
            if (!coupon.isActive) throw new Error('Coupon is inactive');
            if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date())
                throw new Error('Coupon has expired');
            if (coupon.maxUsageLimit && coupon.usedCount >= coupon.maxUsageLimit)
                throw new Error('Coupon usage limit reached');
            if (coupon.minOrderAmount && subTotal < coupon.minOrderAmount)
                throw new Error(`Minimum order amount of ৳${coupon.minOrderAmount} required`);

            let discount = coupon.discountPCT ? (subTotal * coupon.discountPCT) / 100 : coupon.discountAMT;
            if (coupon.maxDiscountAmt) discount = Math.min(discount, coupon.maxDiscountAmt);
            discount = Math.round(Math.min(discount, subTotal));

            setAppliedCoupon({ code: coupon.code, discount, couponId: coupon.couponId });
            showFeedback(`Coupon applied — saved ৳${discount.toLocaleString()}`, 'success');
        } catch (error) {
            setCouponError(error.message);
            setAppliedCoupon(null);
        } finally {
            setIsCouponApplying(false);
        }
    };

    const { mutate: addOrder, isPending } = useMutation({
        mutationFn: (orderData) => addOrderFromDashboardApi(orderData),
        onSuccess: () => {
            if (appliedCoupon?.couponId) {
                applyCouponMutation({
                    couponId: appliedCoupon.couponId,
                    updatedData: { usedCount: (appliedCoupon.usedCount || 0) + 1 },
                });
            }
            showFeedback('Order placed successfully!', 'success');
            setCustomerName(''); setCustomerEmail(''); setCustomerPhone('');
            setDeliveryAddress(''); setPaymentMethod('cash'); setShippingCost(0);
            setProducts([]); handleRemoveCoupon();
        },
        onError: (err) => {
            showFeedback(err?.response?.data?.message || 'Failed to place order. Try again.', 'error');
        }
    });

    const handleSubmit = () => {
        if (!customerName || !customerPhone) return showFeedback('Customer name and phone are required.', 'error');
        if (products.length === 0) return showFeedback('Add at least one product.', 'error');

        // Backend reserves stock/serial numbers one unit at a time
        // (reserveStockQuantityRepository(productId, 1, tx)), so quantity > 1
        // must be flattened into one row per unit — same pattern as Checkout.jsx.
        // No serialNumber is sent; the backend assigns it during reservation.
        const flattenedProducts = [];
        products.forEach((p) => {
            for (let i = 0; i < p.productQuantity; i++) {
                flattenedProducts.push({
                    productId: p.productId,
                    serialNumber: null,
                    originalPrice: p.originalPrice,
                    discountAmount: p.discountAmount,
                    purchasePrice: p.purchasePrice,
                });
            }
        });

        // Field names now match orderReqData exactly, as consumed by addOrderService.
        const orderData = {
            customerName,
            customerEmail,
            customerPhone,
            insideDhaka,
            deliveryAddress,          // was "deliverAddress" — didn't match backend at all
            paymentMethod,
            subTotal,
            deliveryCharge: Number(shippingCost), // was "shippingCost" — backend field is deliveryCharge
            discount: couponDiscount,             // was a separate manual field — now driven by the coupon
            totalBill: totalAmount,               // was "totalAmount"
            orderStatus: 'ACCEPTED',              // in-store sale is fulfilled immediately; was "Accepted" (wrong enum case)
            couponId: appliedCoupon?.couponId || null,
            storeId: selectedStore.storeId,       // was "store": selectedStore._id
            paymentStatus: 'PAID',                // in-store sale — adjust if COD/partial payment is possible here
            paidAmount: totalAmount,
            dueAmount: 0,
            orderType: 'POS',                     // adjust to match your actual enum value
            products: flattenedProducts,
        };

        addOrder(orderData);
    };

    if (!selectedStore) return <StoreSelector onSelect={setSelectedStore} />;

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-10">
            <div className="max-w-6xl mx-auto space-y-8">

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            New Sale
                        </h1>
                        <p className="text-gray-400 mt-2 flex items-center gap-2">
                            <Store className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-semibold">{selectedStore.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedStore(null)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-all"
                    >
                        <Store className="w-4 h-4" /> Change Store
                    </button>
                </div>

                {feedback && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                        feedback.type === 'success' ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'
                    }`}>
                        {feedback.type === 'success'
                            ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        }
                        <p className={feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                            {feedback.message}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 space-y-5">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" /> Customer Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Full Name" icon={User}>
                                    <input className={INPUT} placeholder="John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                                </Field>
                                <Field label="Phone Number" icon={Phone}>
                                    <input className={INPUT} placeholder="017XXXXXXXX" maxLength={11} value={customerPhone} onChange={e => setCustomerPhone(normalizePhone(e.target.value))} />
                                </Field>
                                <Field label="Email (optional)" icon={Mail}>
                                    <input className={INPUT} placeholder="john@example.com" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} />
                                </Field>
                                <Field label="Delivery Region" icon={MapPin}>
                                    <div className="relative">
                                        <select value={insideDhaka ? 'true' : 'false'} onChange={e => setInsideDhaka(e.target.value === 'true')} className={SELECT}>
                                            <option value="true">Inside Dhaka</option>
                                            <option value="false">Outside Dhaka</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </Field>
                                <div className="sm:col-span-2">
                                    <Field label="Delivery Address" icon={MapPin}>
                                        <input className={INPUT} placeholder="House, Road, Area..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        <ProductSearch onAdd={handleAddProduct} />

                        {products.length > 0 && (
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6">
                                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-blue-500" /> Order Items
                                    <span className="ml-auto text-sm text-gray-500 font-normal">{products.length} item{products.length !== 1 ? 's' : ''}</span>
                                </h2>
                                <div className="space-y-3">
                                    {products.map((p, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 bg-gray-800/60 border border-gray-700 rounded-xl">
                                            <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                                                <Package className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-semibold text-sm truncate">{p.productName}</p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                    <span className="text-xs text-gray-400">Qty: <span className="text-white">{p.productQuantity}</span></span>
                                                    <span className="text-xs text-gray-400">Price: <span className="text-white">৳{p.purchasePrice.toLocaleString()}</span></span>
                                                    <span className="text-xs text-gray-400">Total: <span className="text-blue-400 font-semibold">৳{(p.purchasePrice * p.productQuantity).toLocaleString()}</span></span>
                                                </div>
                                                {/* Serial numbers are assigned by the backend at order time — not shown here. */}
                                            </div>
                                            <button onClick={() => handleRemoveProduct(i)} className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-6 space-y-4">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-500" /> Payment
                                </h2>
                                <Field label="Payment Method" icon={CreditCard}>
                                    <div className="relative">
                                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={SELECT}>
                                            <option value="cash">Cash</option>
                                            <option value="bkash">bKash</option>
                                            <option value="nagad">Nagad</option>
                                            <option value="card">Card</option>
                                            <option value="bank">Bank Transfer</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </Field>
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-blue-500" /> Pricing
                                </h2>
                                <Field label="Shipping Cost (৳)" icon={MapPin}>
                                    <input type="number" min={0} value={shippingCost} onChange={e => setShippingCost(e.target.value)} className={INPUT} placeholder="0" />
                                </Field>

                                {!appliedCoupon ? (
                                    <Field label="Coupon Code" icon={Tag}>
                                        <div className="flex gap-2">
                                            <input
                                                className={INPUT}
                                                placeholder="Enter code"
                                                value={couponInput}
                                                onChange={e => setCouponInput(e.target.value)}
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={isCouponApplying}
                                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
                                            >
                                                {isCouponApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                                            </button>
                                        </div>
                                        {couponError && <p className="text-xs text-red-400 mt-1">{couponError}</p>}
                                    </Field>
                                ) : (
                                    <div className="flex justify-between items-center text-xs bg-green-500/10 border border-green-500/30 p-2.5 rounded-lg">
                                        <span className="text-green-500 font-bold">{appliedCoupon.code} Applied!</span>
                                        <X className="h-4 w-4 cursor-pointer text-gray-500 hover:text-white" onClick={handleRemoveCoupon} />
                                    </div>
                                )}

                                <div className="border-t border-gray-700 pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="text-white">৳{subTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Shipping</span>
                                        <span className="text-white">৳{Number(shippingCost).toLocaleString()}</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Discount</span>
                                            <span>-৳{couponDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base border-t border-gray-700 pt-3">
                                        <span className="text-white">Total</span>
                                        <span className="text-blue-400 text-lg">৳{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isPending || products.length === 0}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isPending
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
                                    : <><ShoppingCart className="w-5 h-5" /> Place Order</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sell;