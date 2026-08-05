import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Calendar, 
  ArrowRight, 
  Printer, 
  ShoppingBag,
  MapPin,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import axios from "axios"; // or your custom api instance
import getOrderByOrderIdApi from "@/services/dashboard/order/getOrderByOrderIdApi";

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

//   // Replace this with your actual API call to fetch order by ID
//   const { data: order, isLoading, isError } = useQuery({
//     queryKey: ["order", orderId],
//     queryFn: async () => {
//       const response = await axios.get(`/api/orders/${orderId}`);
//       return response.data;
//     },
//     enabled: !!orderId,
//   });
    const { data: order, isLoading, isError } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => getOrderByOrderIdApi(orderId),
        enabled: !!orderId,
    });

    const orderData = order?.data;



    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 animate-pulse">Confirming your order...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
                    <p className="text-gray-400 mb-6">We couldn't find the order details you're looking for.</p>
                    <Button onClick={() => navigate("/")}>Return to Shop</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-gray-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6"
                    >
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold mb-2"
                    >
                        Thank You for Your Order!
                    </motion.h1>
                    <p className="text-gray-400">
                        Order <span className="text-blue-400 font-mono">#{orderData.orderId}</span> has been placed successfully.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Order Details Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-500" /> Order Summary
                        </h3>
                        <div className="space-y-4">
                            {orderData?.products?.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-400">
                                        {item.productName} <span className="text-xs text-gray-600">x{item.productQuantity}</span>
                                    </span>
                                    <span className="font-medium">৳{(item.productPrice * item.productQuantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <Separator className="bg-gray-800" />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>৳{orderData?.subTotal?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Shipping</span>
                                    <span>৳{orderData?.shippingCost?.toLocaleString()}</span>
                                </div>
                                {orderData?.discount > 0 && (
                                    <div className="flex justify-between text-green-500">
                                        <span>Discount</span>
                                        <span>-৳{orderData?.discount?.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-white pt-2">
                                    <span>Total</span>
                                    <span className="text-blue-500">৳{orderData?.totalAmount?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Shipping & Delivery Card */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-purple-500" /> Shipping Info
                            </h3>
                            <div className="text-sm space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                                    <div>
                                        <p className="font-medium">{orderData?.customerName}</p>
                                        <p className="text-gray-400">{orderData?.deliverAddress}</p>
                                        <p className="text-gray-400">{orderData?.city}, {orderData?.postalCode}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-4 h-4 text-gray-500" />
                                    <p className="text-gray-400 uppercase">{orderData?.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-3 text-blue-400 mb-2">
                                <Calendar className="w-5 h-5" />
                                <h4 className="font-semibold">Estimated Delivery</h4>
                            </div>
                            <p className="text-sm text-gray-300">
                                {orderData?.insideDhaka ? "24 - 48 Hours" : "3 - 5 Business Days"}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                        onClick={() => navigate("/")}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;