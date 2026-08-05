import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Truck, ShoppingBag, Loader2, X, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import cartStore from "@/state/clientPart/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import addOrderApi from "@/services/clientPart/order/addOrderApi";
import getCouponByCodeApi from "@/services/dashboard/coupon/getCouponByCodeApi";
import updateCouponApi from "@/services/dashboard/coupon/updateCouponApi";

// Only "cod" is actually offered in the UI right now, but the schema
// keeps "bkash" reserved for when it's re-enabled.
const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string()
    .min(11, "Phone number must be 11 digits")
    .max(11, "Phone number must be 11 digits")
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number"),
  deliverAddress: z.string().min(5, "Address must be at least 5 characters"),
  paymentMethod: z.enum(["cod", "bkash"]),
  insideDhaka: z.boolean(),
  deliveryNote: z.string().max(300, "Keep it under 300 characters").optional(),
  sellerNote: z.string().max(300, "Keep it under 300 characters").optional(),
  bkashTransactionId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "bkash" && !data.bkashTransactionId?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["bkashTransactionId"],
      message: "Enter the bKash transaction ID",
    });
  }
});

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = cartStore();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [isCouponApplying, setIsCouponApplying] = useState(false);

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      deliverAddress: "",
      paymentMethod: "cod",
      insideDhaka: true,
      deliveryNote: "",
      sellerNote: "",
      bkashTransactionId: "",
    },
  });

  const insideDhaka = form.watch("insideDhaka");
  const paymentMethod = form.watch("paymentMethod");

  const subtotal =
    cartItems?.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0;

  // Shipping is the HIGHEST per-product charge in the cart, not a sum —
  // matches how the backend has no shipping-calculation logic of its own;
  // whatever we send as deliveryCharge is trusted as-is by addOrderService.
  const calculateShippingCost = () => {
    if (!cartItems?.length) return 0;
    const shippingCosts = cartItems.map((item) =>
      insideDhaka ? item.insideDhakaCharge : item.outsideDhakaCharge
    );
    return Math.max(...shippingCosts);
  };

  const shippingCost = calculateShippingCost();
  const couponDiscount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - couponDiscount + shippingCost);

  const { mutate: applyCouponMutation } = useMutation({
    mutationFn: ({ couponId, updatedData }) => updateCouponApi(couponId, updatedData),
  });

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsCouponApplying(true);
    setCouponError("");

    try {
      const response = await getCouponByCodeApi(code);
      const coupon = response?.data;

      if (!coupon) throw new Error("Coupon not found");
      if (!coupon.isActive) throw new Error("Coupon is inactive");
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date())
        throw new Error("Coupon has expired");
      if (coupon.maxUsageLimit && coupon.usedCount >= coupon.maxUsageLimit)
        throw new Error("Coupon usage limit reached");
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount)
        throw new Error(`Minimum order amount of ৳${coupon.minOrderAmount} required`);

      let discount = coupon.discountPCT ? (subtotal * coupon.discountPCT) / 100 : coupon.discountAMT;
      if (coupon.maxDiscountAmt) discount = Math.min(discount, coupon.maxDiscountAmt);
      discount = Math.round(Math.min(discount, subtotal));

      setAppliedCoupon({ code: coupon.code, discount, couponId: coupon.couponId });
      window.alert(`Saved ৳${discount.toLocaleString()}`, "success");
    } catch (error) {
      setCouponError(error.message);
      setAppliedCoupon(null);
      window.alert(error.message, "error");
    } finally {
      setIsCouponApplying(false);
    }
  };

  const { mutate: placeOrder, isPending: isPlacingOrder } = useMutation({
    mutationFn: (orderData) => addOrderApi(orderData),
    onSuccess: (response) => {
      // Controller shape: { message, order: { orderData, products } }
      const orderPayload = response?.data?.order;

      if (appliedCoupon?.couponId) {
        applyCouponMutation({
          couponId: appliedCoupon.couponId,
          updatedData: {
            usedCount: (appliedCoupon.usedCount || 0) + 1,
          },
        });
      }

      const orderId = orderPayload?.orderData?.orderId;
      window.alert("Order placed successfully!", "success");
      clearCart();
      setTimeout(() => navigate(`/order-confirmation/${orderId}`), 1500);
    },
    onError: (error) => {
      window.alert(error.response?.data?.message || "Failed to place order", "error");
    },
  });

  const onSubmit = (data) => {
    // Backend reserves stock/serial numbers one unit at a time
    // (reserveStockQuantityRepository(productId, 1, tx)), so quantity > 1
    // must be flattened into one OrderProduct row per unit.
    const products = [];
    cartItems.forEach((item) => {
      const qty = item.quantity || 1;
      for (let i = 0; i < qty; i++) {
        products.push({
          productId: item._id || item.id,
          serialNumber: null, // let the backend assign a reserved serial
          originalPrice: item.mainPrice || item.price,
          discountAmount: item.discountAmount || 0,
          purchasePrice: item.price,
        });
      }
    });

    // Maps 1:1 onto orderReqData consumed by addOrderService.
    // storeId / employeeId / invoiceURL are still omitted since this is an
    // ONLINE customer-facing order, not a POS/dashboard one. transactionId
    // is only meaningful for bKash; deliveryNote/sellerNote are free text
    // the customer can leave for the courier / seller.
    const orderData = {
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      insideDhaka: data.insideDhaka,
      deliveryAddress: data.deliverAddress,
      paymentMethod: data.paymentMethod,
      subTotal: subtotal,
      deliveryCharge: shippingCost,
      discount: couponDiscount,
      totalBill: total,
      orderStatus: "PENDING",
      couponId: appliedCoupon?.couponId || null,
      paymentStatus: "UNPAID",
      paidAmount: 0,
      dueAmount: total,
      orderType: "ONLINE",
      transactionId: data.paymentMethod === "bkash" ? data.bkashTransactionId?.trim() : null,
      deliveryNote: data.deliveryNote?.trim() || null,
      sellerNote: data.sellerNote?.trim() || null,
      products,
    };

    placeOrder(orderData);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              Checkout
            </h1>
            <p className="text-gray-400">Complete your details to finish your order</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="bg-gray-900 border-gray-700">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Form {...form}>
              <form className="space-y-6">
                <section className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-400">
                    <Truck className="h-5 w-5" /> Shipping Details
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" className="bg-gray-800 border-gray-700" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" className="bg-gray-800 border-gray-700" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="017XXXXXXXX"
                              className="bg-gray-800 border-gray-700"
                              {...field}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\s+/g, "");
                                if (value.startsWith("+880")) value = "0" + value.slice(4);
                                else if (value.startsWith("880")) value = "0" + value.slice(3);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliverAddress"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Full Address</FormLabel>
                          <FormControl>
                            <Input placeholder="House #, Street, Area" className="bg-gray-800 border-gray-700" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-8">
                    <FormField
                      control={form.control}
                      name="insideDhaka"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" /> Delivery Region
                          </FormLabel>
                          <div className="grid gap-4 sm:grid-cols-2 mt-2">
                            {[
                              { value: true, id: "in", label: "Inside Dhaka Metro", sub: "Standard delivery" },
                              { value: false, id: "out", label: "Outside Dhaka Metro", sub: "Standard delivery" },
                            ].map((option) => (
                              <div
                                key={option.id}
                                onClick={() => field.onChange(option.value)}
                                className={`flex items-center space-x-3 rounded-xl border p-4 cursor-pointer transition-all ${
                                  field.value === option.value ? "border-blue-500 bg-blue-500/10" : "border-gray-800"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    field.value === option.value ? "border-blue-500" : "border-gray-500"
                                  }`}
                                >
                                  {field.value === option.value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{option.label}</p>
                                  <p className="text-xs text-gray-500">{option.sub}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-purple-400">
                    <CreditCard className="h-5 w-5" /> Payment Method
                  </h2>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {[
                            { value: "cod", label: "Cash on Delivery" },
                            { value: "bkash", label: "bKash (Send Money)" },
                          ].map((option) => (
                            <div
                              key={option.value}
                              onClick={() => field.onChange(option.value)}
                              className={`flex items-center space-x-3 rounded-xl border p-4 cursor-pointer transition-all ${
                                field.value === option.value ? "border-purple-500 bg-purple-500/10" : "border-gray-800"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  field.value === option.value ? "border-purple-500" : "border-gray-500"
                                }`}
                              >
                                {field.value === option.value && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                              </div>
                              <p className="flex-1 text-sm font-medium">{option.label}</p>
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  {paymentMethod === "bkash" && (
                    <div className="mt-4 space-y-3">
                      <div className="text-xs text-gray-400 bg-purple-500/5 border border-purple-500/20 p-4 rounded-lg">
                        <p className="font-bold mb-1 text-purple-300">bKash Instructions:</p>
                        1. Send money to 01XXXXXXXXX <br />
                        2. Enter the transaction ID below <br />
                        3. We will verify your payment manually before shipping.
                      </div>
                      <FormField
                        control={form.control}
                        name="bkashTransactionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>bKash Transaction ID</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 8N7A2K9XYZ" className="bg-gray-800 border-gray-700" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
                  <h2 className="text-xl font-semibold mb-6 text-gray-300">Order Notes (optional)</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="deliveryNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note for the courier</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Call before delivery, leave at gate"
                              className="bg-gray-800 border-gray-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellerNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note for the seller</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Gift wrap this order"
                              className="bg-gray-800 border-gray-700"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </form>
            </Form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" /> Order Summary
              </h2>
              <div className="max-h-60 overflow-y-auto space-y-4 mb-6 pr-2">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-3 text-sm">
                    <img src={item.image} className="h-12 w-12 rounded object-cover bg-gray-800" alt="" />
                    <div className="flex-1">
                      <p className="line-clamp-1 font-medium">{item.title}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="bg-gray-800 border-gray-700 h-9"
                    />
                    <Button size="sm" onClick={handleApplyCoupon} disabled={isCouponApplying} className="bg-blue-600">
                      {isCouponApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-xs bg-green-500/10 border border-green-500/30 p-2 rounded">
                    <span className="text-green-500 font-bold">{appliedCoupon.code} Applied!</span>
                    <X className="h-4 w-4 cursor-pointer text-gray-500" onClick={handleRemoveCoupon} />
                  </div>
                )}
                {couponError && <p className="text-xs text-red-400">{couponError}</p>}
              </div>

              <div className="space-y-2 border-t border-gray-800 pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>৳{shippingCost.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-৳{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-800 pt-2 text-white">
                  <span>Total</span>
                  <span className="text-blue-500">৳{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isPlacingOrder}
                className="w-full mt-6 h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold"
              >
                {isPlacingOrder ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;