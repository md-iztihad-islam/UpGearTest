import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Minus, Trash2, ShoppingCart, User, Phone,
    Mail, MapPin, CreditCard, Package, Tag, CheckCircle,
    AlertCircle, Loader2, ChevronDown, Store, Percent,
    ChevronRight, Building2, X, BadgePercent, Wallet,
} from 'lucide-react';
import getAllStoresApi from '@/services/dashboard/store/getAllStoresApi';
import addOrderFromDashboardApi from '@/services/clientPart/order/addOrderFromDashboardApi';
import quoteOrderApi from '@/services/clientPart/order/quoteOrderApi';
import { apiErrorMessage } from '@/lib/apiError';
import SearchForSale from './SearchForSale';

const INPUT = "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm";
const SELECT = `${INPUT} appearance-none cursor-pointer`;
const CARD = "bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6";

const money = (value) => `৳${Number(value || 0).toLocaleString('en-BD')}`;

function Field({ label, icon: Icon, children, error }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {Icon && <Icon className="w-3.5 h-3.5" />} {label}
            </label>
            {children}
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

const getAvailableQty = (product) => {
    if (!product?.stocks?.length) return 0;
    return product.stocks.reduce((sum, s) => sum + Math.max(0, (s.remaining || 0) - (s.reserved || 0)), 0);
};

const normalizePhone = (value) => {
    let v = value.replace(/[\s-]/g, '');
    if (v.startsWith('+880')) v = '0' + v.slice(4);
    else if (v.startsWith('880')) v = '0' + v.slice(3);
    return v;
};

// Value that only updates once typing has paused, so the live quote isn't
// re-requested on every keystroke.
function useDebouncedValue(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

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
                    <div className={`${CARD} p-10 flex flex-col items-center gap-4 text-center`}>
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
                                        <p className="text-white font-bold text-base">{store.title}</p>
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
// Serials are reserved and assigned by the backend when the sale is placed.
function ProductSearch({ onAdd, quantityInCart }) {
    const [selected, setSelected] = useState(null);
    const [qty, setQty] = useState(1);

    const availableQty = selected ? getAvailableQty(selected) - quantityInCart(selected.productId) : 0;
    const qtyExceedsStock = selected && qty > availableQty;
    const image = selected?.bannerImageURL || selected?.images?.[0]?.imageURL;

    const handleProductSelect = (product) => {
        setSelected(product);
        setQty(1);
    };

    const handleAdd = () => {
        if (!selected || qtyExceedsStock || availableQty <= 0) return;
        onAdd({
            productId: selected.productId,
            title: selected.title,
            subTitle: selected.subTitle,
            unitPrice: Number(selected.price) || 0,
            available: getAvailableQty(selected),
            quantity: qty,
        });
        setSelected(null);
        setQty(1);
    };

    return (
        <div className={`${CARD} space-y-4`}>
            <h3 className="font-bold text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" /> Add Product
            </h3>

            <SearchForSale
                placeholder="Search by name, brand or product ID..."
                onSelectProduct={handleProductSelect}
                className="w-full"
            />

            {selected && (
                <div className="space-y-4 pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        {image && <img src={image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">
                                {selected.title} {selected.subTitle}
                            </p>
                            <p className="text-blue-400 text-xs mt-0.5">
                                {money(selected.price)} per unit • {Math.max(0, availableQty)} available
                            </p>
                        </div>
                        <button
                            onClick={() => setSelected(null)}
                            aria-label="Clear selected product"
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {availableQty <= 0 ? (
                        <p className="text-sm text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> No more units of this product are available.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Quantity" icon={Package} error={qtyExceedsStock ? `Only ${availableQty} available.` : ""}>
                                <input
                                    type="number"
                                    min={1}
                                    max={availableQty}
                                    value={qty}
                                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                                    className={INPUT}
                                />
                            </Field>
                            <Field label="Line Total" icon={Tag}>
                                <input
                                    type="text"
                                    readOnly
                                    value={money((Number(selected.price) || 0) * qty)}
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
                        <Plus className="w-4 h-4" /> Add to Sale
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Custom discount ───────────────────────────────────────────
const DISCOUNT_PRESETS = [
    { type: 'percent', value: '5', label: '5%' },
    { type: 'percent', value: '10', label: '10%' },
    { type: 'amount', value: '100', label: '৳100' },
    { type: 'amount', value: '500', label: '৳500' },
];

function CustomDiscount({ value, onChange, appliedAmount, error }) {
    const set = (changes) => onChange({ ...value, ...changes });

    return (
        <Field label="Custom Discount" icon={BadgePercent} error={error}>
            <div className="flex gap-2">
                <div className="flex shrink-0 rounded-lg border border-gray-700 overflow-hidden">
                    {[
                        { type: 'amount', label: '৳' },
                        { type: 'percent', label: '%' },
                    ].map((option) => (
                        <button
                            key={option.type}
                            type="button"
                            onClick={() => set({ type: option.type })}
                            aria-pressed={value.type === option.type}
                            className={`w-10 text-sm font-semibold transition-colors ${
                                value.type === option.type ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <input
                    type="number"
                    min={0}
                    max={value.type === 'percent' ? 100 : undefined}
                    value={value.value}
                    onChange={e => set({ value: e.target.value })}
                    placeholder={value.type === 'percent' ? 'e.g. 10' : 'e.g. 200'}
                    className={INPUT}
                />
                {value.value !== '' && (
                    <button
                        type="button"
                        onClick={() => onChange({ type: value.type, value: '', reason: '' })}
                        aria-label="Remove custom discount"
                        className="px-2 text-gray-500 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
                {DISCOUNT_PRESETS.map((preset) => (
                    <button
                        key={preset.label}
                        type="button"
                        onClick={() => set({ type: preset.type, value: preset.value })}
                        className="px-2.5 py-1 text-xs rounded-full bg-gray-800 border border-gray-700 text-gray-300 hover:border-blue-500 hover:text-white transition-colors"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
            {value.value !== '' && (
                <input
                    value={value.reason}
                    onChange={e => set({ reason: e.target.value })}
                    placeholder="Reason (optional) — e.g. regular customer"
                    maxLength={200}
                    className={`${INPUT} mt-2`}
                />
            )}
            {appliedAmount > 0 && (
                <p className="text-xs text-green-400 pt-1">Takes {money(appliedAmount)} off this sale.</p>
            )}
        </Field>
    );
}

// ── Main Sell Component ───────────────────────────────────────
const EMPTY_DISCOUNT = { type: 'amount', value: '', reason: '' };

function Sell() {
    const [selectedStore, setSelectedStore] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [insideDhaka, setInsideDhaka] = useState(true);
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [deliveryCharge, setDeliveryCharge] = useState('0');
    const [paidAmount, setPaidAmount] = useState('');
    const [sellerNote, setSellerNote] = useState('');
    const [items, setItems] = useState([]);
    const [customDiscount, setCustomDiscount] = useState(EMPTY_DISCOUNT);
    const [couponInput, setCouponInput] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [isCouponApplying, setIsCouponApplying] = useState(false);
    const [formError, setFormError] = useState('');
    const [lastSale, setLastSale] = useState(null);

    const quantityInCart = (productId) => items.find((i) => i.productId === productId)?.quantity || 0;

    // ── Live quote from the server (same maths as placing the sale) ──
    const debouncedDelivery = useDebouncedValue(deliveryCharge);
    const debouncedDiscount = useDebouncedValue(customDiscount);
    const quoteInput = useMemo(() => ({
        channel: 'POS',
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        insideDhaka,
        deliveryCharge: Number(debouncedDelivery) || 0,
        couponCode: couponCode || undefined,
        customDiscount: debouncedDiscount.value === ''
            ? undefined
            : { type: debouncedDiscount.type, value: debouncedDiscount.value, reason: debouncedDiscount.reason },
    }), [items, insideDhaka, debouncedDelivery, couponCode, debouncedDiscount]);

    const { data: quoteRes, error: quoteError, isFetching: isQuoting } = useQuery({
        queryKey: ['posQuote', quoteInput],
        queryFn: () => quoteOrderApi(quoteInput),
        enabled: items.length > 0,
        placeholderData: keepPreviousData,
        retry: false,
    });
    const quote = items.length > 0 ? quoteRes?.data : null;
    const quoteErrorField = quoteError?.response?.data?.field;
    const quoteErrorMessage = quoteError ? apiErrorMessage(quoteError) : '';

    const subTotal = quote?.subTotal ?? items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const totalAmount = quote?.totalBill ?? subTotal;
    const paidNumber = paidAmount === '' ? totalAmount : Math.min(Math.max(0, Number(paidAmount) || 0), totalAmount);
    const dueAmount = Math.max(0, totalAmount - paidNumber);

    // ── Items ──
    const handleAddProduct = (line) => {
        setItems(prev => {
            const existing = prev.find(i => i.productId === line.productId);
            if (!existing) return [...prev, line];
            return prev.map(i => i.productId === line.productId
                ? { ...i, quantity: Math.min(i.available, i.quantity + line.quantity) }
                : i);
        });
        setFormError('');
    };

    const changeQuantity = (productId, delta) =>
        setItems(prev => prev.map(i => i.productId === productId
            ? { ...i, quantity: Math.min(i.available, Math.max(1, i.quantity + delta)) }
            : i));

    const removeItem = (productId) => setItems(prev => prev.filter(i => i.productId !== productId));

    // ── Coupon ──
    const removeCoupon = () => {
        setCouponCode('');
        setCouponInput('');
        setCouponError('');
    };

    const applyCoupon = async () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) return setCouponError('Please enter a coupon code');
        if (items.length === 0) return setCouponError('Add products first');
        setIsCouponApplying(true);
        setCouponError('');
        try {
            await quoteOrderApi({ ...quoteInput, couponCode: code });
            setCouponCode(code);
        } catch (error) {
            setCouponError(apiErrorMessage(error, "Couldn't apply this coupon"));
        } finally {
            setIsCouponApplying(false);
        }
    };

    const resetSale = () => {
        setCustomerName(''); setCustomerEmail(''); setCustomerPhone('');
        setDeliveryAddress(''); setPaymentMethod('cash'); setDeliveryCharge('0');
        setPaidAmount(''); setSellerNote(''); setItems([]);
        setCustomDiscount(EMPTY_DISCOUNT); removeCoupon(); setFormError('');
    };

    const { mutate: placeSale, isPending } = useMutation({
        mutationFn: (orderData) => addOrderFromDashboardApi(orderData),
        onSuccess: (response) => {
            setLastSale(response.data);
            resetSale();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        onError: (error) => {
            const message = apiErrorMessage(error, 'Failed to record the sale. Try again.');
            if (error?.response?.data?.field === 'coupon') {
                setCouponCode('');
                setCouponError(message);
            }
            setFormError(message);
        },
    });

    const handleSubmit = () => {
        setLastSale(null);
        if (!customerName.trim()) return setFormError('Customer name is required.');
        if (!/^01[3-9]\d{8}$/.test(customerPhone)) return setFormError('Enter a valid 11-digit customer phone number.');
        if (items.length === 0) return setFormError('Add at least one product.');
        if (quoteErrorMessage) return setFormError(quoteErrorMessage);

        placeSale({
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim() || null,
            customerPhone,
            insideDhaka,
            deliveryAddress: deliveryAddress.trim(),
            paymentMethod,
            deliveryCharge: Number(deliveryCharge) || 0,
            couponCode: couponCode || undefined,
            customDiscount: customDiscount.value === '' ? undefined : customDiscount,
            paidAmount: paidAmount === '' ? undefined : Number(paidAmount),
            sellerNote: sellerNote.trim() || undefined,
            storeId: selectedStore.storeId,
            items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        });
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
                            <span className="text-blue-400 font-semibold">{selectedStore.title}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedStore(null)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-all"
                    >
                        <Store className="w-4 h-4" /> Change Store
                    </button>
                </div>

                {lastSale && (
                    <div className="p-4 rounded-xl border bg-green-900/30 border-green-700 flex flex-wrap items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <p className="text-green-300 flex-1">
                            Sale <span className="font-mono font-semibold">#{lastSale.orderId}</span> recorded — {money(lastSale.totalBill)}
                            {Number(lastSale.dueAmount) > 0 && ` (${money(lastSale.dueAmount)} due)`}.
                        </p>
                        <Link
                            to={`/dashboard/searchorder/order/${lastSale.orderId}`}
                            className="text-sm font-semibold text-green-300 hover:text-white underline-offset-2 hover:underline"
                        >
                            View order
                        </Link>
                        <button onClick={() => setLastSale(null)} aria-label="Dismiss" className="text-green-600 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">

                        <div className={`${CARD} space-y-5`}>
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-500" /> Customer Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Full Name" icon={User}>
                                    <input className={INPUT} placeholder="John Doe" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                                </Field>
                                <Field label="Phone Number" icon={Phone}>
                                    <input className={INPUT} placeholder="017XXXXXXXX" inputMode="tel" value={customerPhone} onChange={e => setCustomerPhone(normalizePhone(e.target.value).slice(0, 11))} />
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
                                    <Field label="Delivery Address (leave empty for in-store pickup)" icon={MapPin}>
                                        <input className={INPUT} placeholder="House, Road, Area..." value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        <ProductSearch onAdd={handleAddProduct} quantityInCart={quantityInCart} />

                        {items.length > 0 && (
                            <div className={CARD}>
                                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-blue-500" /> Sale Items
                                    <span className="ml-auto text-sm text-gray-500 font-normal">
                                        {items.reduce((n, i) => n + i.quantity, 0)} unit(s)
                                    </span>
                                </h2>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-800/60 border border-gray-700 rounded-xl">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-semibold text-sm truncate">{item.title} {item.subTitle}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {money(item.unitPrice)} each · <span className="text-blue-400 font-semibold">{money(item.unitPrice * item.quantity)}</span>
                                                </p>
                                            </div>
                                            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shrink-0">
                                                <button onClick={() => changeQuantity(item.productId, -1)} disabled={item.quantity <= 1} aria-label="Decrease quantity" className="h-8 w-8 flex items-center justify-center hover:bg-gray-700 disabled:opacity-30">
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                                <button onClick={() => changeQuantity(item.productId, 1)} disabled={item.quantity >= item.available} aria-label="Increase quantity" className="h-8 w-8 flex items-center justify-center hover:bg-gray-700 disabled:opacity-30">
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <button onClick={() => removeItem(item.productId)} aria-label="Remove item" className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0">
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
                            <div className={`${CARD} space-y-4`}>
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
                                <Field label="Amount Paid Now (৳)" icon={Wallet}>
                                    <input
                                        type="number"
                                        min={0}
                                        value={paidAmount}
                                        onChange={e => setPaidAmount(e.target.value)}
                                        placeholder={`Full amount — ${money(totalAmount)}`}
                                        className={INPUT}
                                    />
                                </Field>
                            </div>

                            <div className={`${CARD} space-y-4`}>
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-blue-500" /> Pricing
                                </h2>
                                <Field label="Delivery Charge (৳)" icon={MapPin} error={quoteErrorField === 'deliveryCharge' ? quoteErrorMessage : ''}>
                                    <input type="number" min={0} value={deliveryCharge} onChange={e => setDeliveryCharge(e.target.value)} className={INPUT} placeholder="0" />
                                </Field>

                                <CustomDiscount
                                    value={customDiscount}
                                    onChange={setCustomDiscount}
                                    appliedAmount={quote?.customDiscount || 0}
                                    error={quoteErrorField === 'customDiscount' ? quoteErrorMessage : ''}
                                />

                                {!couponCode ? (
                                    <Field label="Coupon Code" icon={Percent} error={couponError}>
                                        <div className="flex gap-2">
                                            <input
                                                className={INPUT}
                                                placeholder="Enter code"
                                                value={couponInput}
                                                onChange={e => setCouponInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                            />
                                            <button
                                                onClick={applyCoupon}
                                                disabled={isCouponApplying}
                                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
                                            >
                                                {isCouponApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                            </button>
                                        </div>
                                    </Field>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-xs bg-green-500/10 border border-green-500/30 p-2.5 rounded-lg">
                                            <span className="text-green-500 font-bold">{couponCode} applied</span>
                                            <button onClick={removeCoupon} aria-label="Remove coupon" className="text-gray-500 hover:text-white">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {quoteErrorField === 'coupon' && <p className="text-xs text-red-400">{quoteErrorMessage}</p>}
                                    </div>
                                )}

                                <div className={`border-t border-gray-700 pt-4 space-y-2 text-sm transition-opacity ${isQuoting ? 'opacity-60' : ''}`}>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="text-white">{money(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Delivery</span>
                                        <span className="text-white">{money(quote?.deliveryCharge ?? deliveryCharge)}</span>
                                    </div>
                                    {quote?.couponDiscount > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Coupon ({quote.coupon?.code})</span>
                                            <span>-{money(quote.couponDiscount)}</span>
                                        </div>
                                    )}
                                    {quote?.customDiscount > 0 && (
                                        <div className="flex justify-between text-green-400">
                                            <span>Custom discount{quote.customDiscountLabel ? ` (${quote.customDiscountLabel})` : ''}</span>
                                            <span>-{money(quote.customDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base border-t border-gray-700 pt-3">
                                        <span className="text-white">Total</span>
                                        <span className="text-blue-400 text-lg">{money(totalAmount)}</span>
                                    </div>
                                    {dueAmount > 0 && (
                                        <div className="flex justify-between text-amber-400">
                                            <span>Due after this payment</span>
                                            <span>{money(dueAmount)}</span>
                                        </div>
                                    )}
                                </div>

                                <Field label="Note (optional)" icon={Tag}>
                                    <input className={INPUT} value={sellerNote} onChange={e => setSellerNote(e.target.value)} placeholder="Internal note for this sale" maxLength={300} />
                                </Field>
                            </div>

                            {(formError || (quoteErrorMessage && !['coupon', 'customDiscount', 'deliveryCharge'].includes(quoteErrorField))) && (
                                <div className="p-3 rounded-xl border bg-red-900/30 border-red-700 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-300">{formError || quoteErrorMessage}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={isPending || items.length === 0 || !quote}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isPending
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Recording Sale...</>
                                    : <><ShoppingCart className="w-5 h-5" /> Complete Sale · {money(totalAmount)}</>
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
