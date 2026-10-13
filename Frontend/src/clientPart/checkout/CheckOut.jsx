import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
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
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import addOrderApi from "@/services/clientPart/order/addOrderApi";
import quoteOrderApi from "@/services/clientPart/order/quoteOrderApi";
import { apiErrorMessage } from "@/lib/apiError";

// Only "cod" is actually offered in the UI right now, but the schema
// keeps "bkash" reserved for when it's re-enabled.
const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  // Email is optional — blank is fine, but anything typed must be a valid address.
  customerEmail: z.string().trim()
    .refine((value) => value === "" || z.string().email().safeParse(value).success, "Invalid email address")
    .optional(),
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
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [isCouponApplying, setIsCouponApplying] = useState(false);
  const [orderError, setOrderError] = useState("");

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

  // What the server needs: just product ids and quantities. Prices, delivery
  // and coupon discount are all worked out on the server.
  const items = useMemo(
    () =>
      (cartItems || [])
        .map((item) => ({ productId: item.productId || item.id, quantity: item.quantity || 1 }))
        .filter((item) => item.productId),
    [cartItems]
  );

  // Live price breakdown from the server — the exact numbers that will be
  // charged. If the applied coupon stops being valid (e.g. the cart drops
  // below its minimum), the cart is re-priced without it and the reason shown.
  const {
    data: quoteResult,
    error: quoteError,
    isFetching: isQuoting,
  } = useQuery({
    queryKey: ["checkoutQuote", items, insideDhaka, appliedCouponCode],
    queryFn: async () => {
      const input = { channel: "ONLINE", items, insideDhaka };
      try {
        const response = await quoteOrderApi({ ...input, couponCode: appliedCouponCode || undefined });
        return { quote: response.data, couponProblem: "" };
      } catch (error) {
        if (!appliedCouponCode || error?.response?.data?.field !== "coupon") throw error;
        const response = await quoteOrderApi(input);
        return { quote: response.data, couponProblem: apiErrorMessage(error) };
      }
    },
    enabled: items.length > 0,
    placeholderData: keepPreviousData,
    retry: false,
  });
  const quote = quoteResult?.quote;
  const activeCoupon = quote?.coupon;
  const blockingQuoteError = quoteError ? apiErrorMessage(quoteError) : "";

  const localSubtotal = (cartItems || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const subtotal = quote?.subTotal ?? localSubtotal;
  const shippingCost = quote?.deliveryCharge ?? 0;
  const couponDiscount = quote?.couponDiscount ?? 0;
  const total = quote?.totalBill ?? localSubtotal;
  const lineByProduct = new Map((quote?.lines || []).map((line) => [line.productId, line]));
  const stockProblems = (quote?.lines || []).filter((line) => line.quantity > line.available);

  const handleRemoveCoupon = () => {
    setAppliedCouponCode("");
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
      // Validate against the server with the current cart before applying.
      const response = await quoteOrderApi({ channel: "ONLINE", items, insideDhaka, couponCode: code });
      setAppliedCouponCode(code);
      window.showToast?.(`Coupon applied — you save ৳${response.data.couponDiscount.toLocaleString()}`, "success");
    } catch (error) {
      setCouponError(apiErrorMessage(error, "Couldn't apply this coupon"));
    } finally {
      setIsCouponApplying(false);
    }
  };

  const { mutate: placeOrder, isPending: isPlacingOrder } = useMutation({
    mutationFn: (orderData) => addOrderApi(orderData),
    onSuccess: (response, orderData) => {
      const orderId = response?.data?.orderId;
      // Lets the confirmation page show the order without asking for the phone again.
      try {
        sessionStorage.setItem("lastOrder", JSON.stringify({ orderId, phone: orderData.customerPhone }));
      } catch {
        // storage unavailable — the confirmation page will ask for the phone
      }
      clearCart();
      navigate(`/order-confirmation/${orderId}`, { state: { phone: orderData.customerPhone } });
    },
    onError: (error) => {
      const message = apiErrorMessage(error, "Failed to place order, please try again");
      if (error?.response?.data?.field === "coupon") handleRemoveCoupon();
      setOrderError(message);
      window.showToast?.(message, "error");
    },
  });

  const onSubmit = (data) => {
    setOrderError("");
    placeOrder({
      customerName: data.customerName.trim(),
      customerEmail: data.customerEmail?.trim() || null,
      customerPhone: data.customerPhone,
      deliveryAddress: data.deliverAddress.trim(),
      insideDhaka: data.insideDhaka,
      paymentMethod: data.paymentMethod,
      transactionId: data.paymentMethod === "bkash" ? data.bkashTransactionId?.trim() : null,
      deliveryNote: data.deliveryNote?.trim() || null,
      sellerNote: data.sellerNote?.trim() || null,
      couponCode: activeCoupon?.code,
      items,
    });
  };

  if (!items.length) {
    return (
      <div className="min-h-screen bg-black text-gray-100 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <ShoppingBag className="h-12 w-12 text-gray-600 mx-auto" />
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="text-gray-400">Add something to your cart to check out.</p>
          <Button onClick={() => navigate("/all-products")} className="bg-white text-black hover:bg-gray-200">
            Browse products
          </Button>
        </div>
      </div>
    );
  }

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
                          <FormLabel>Email <span className="text-gray-500 font-normal">(optional)</span></FormLabel>
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
                {cartItems.map((item) => {
                  const line = lineByProduct.get(item.productId || item.id);
                  const short = line && line.quantity > line.available;
                  return (
                    <div key={item.productId || item.id} className="flex gap-3 text-sm">
                      <img src={item.image} className="h-12 w-12 rounded object-cover bg-gray-800" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="line-clamp-1 font-medium">{item.title}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                        {short && (
                          <p className="text-xs text-red-400">
                            {line.available > 0 ? `Only ${line.available} left` : "Out of stock"}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold">
                        ৳{(line?.lineTotal ?? (item.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 mb-6">
                {!activeCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="bg-gray-800 border-gray-700 h-9"
                    />
                    <Button size="sm" onClick={handleApplyCoupon} disabled={isCouponApplying} className="bg-blue-600">
                      {isCouponApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-xs bg-green-500/10 border border-green-500/30 p-2 rounded">
                    <span className="text-green-500 font-bold">{activeCoupon.code} Applied!</span>
                    <X className="h-4 w-4 cursor-pointer text-gray-500" onClick={handleRemoveCoupon} />
                  </div>
                )}
                {(couponError || quoteResult?.couponProblem) && (
                  <p className="text-xs text-red-400">{couponError || quoteResult.couponProblem}</p>
                )}
              </div>

              <div className={`space-y-2 border-t border-gray-800 pt-4 text-sm transition-opacity ${isQuoting ? "opacity-60" : ""}`}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({insideDhaka ? "inside" : "outside"} Dhaka)</span>
                  <span>{quote ? `৳${shippingCost.toLocaleString()}` : "—"}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Coupon discount</span>
                    <span>-৳{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-800 pt-2 text-white">
                  <span>Total</span>
                  <span className="text-blue-500">৳{total.toLocaleString()}</span>
                </div>
              </div>

              {(blockingQuoteError || orderError || stockProblems.length > 0) && (
                <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  {blockingQuoteError ||
                    orderError ||
                    "Some items don't have enough stock. Reduce the quantity in your cart to continue."}
                </p>
              )}

              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isPlacingOrder || !quote || !!blockingQuoteError || stockProblems.length > 0}
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