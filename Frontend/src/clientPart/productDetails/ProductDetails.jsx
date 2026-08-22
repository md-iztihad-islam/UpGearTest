import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
    ShoppingCart, AlertCircle, X, Minus, Plus, Check,
    Truck, Shield, Tag, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSpecifications from "@/components/clientPart/productDetails/ProductSpecifications";
import ProductDescription from "@/components/clientPart/productDetails/ProductDescription";
import ProductKeyFeatures from "@/components/clientPart/productDetails/ProductKeyFeatures";
import ProductImageGallery from "@/components/clientPart/productDetails/ProductImageGallery";
import GroupProduct from "@/components/clientPart/productDetails/GroupProduct";
import cartStore from "@/state/clientPart/cartStore";
import ProductLoadingState from "@/components/loader/ProductLoader";
import getProductBySlugApi from "@/services/clientPart/products/getProductBySlugApi";
import VariationsModal from "./VariationsModal";

function ProductDetails() {
    const { productSlug } = useParams();
    const [activeTab, setActiveTab] = useState("description");
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = cartStore();

    const { data: productData, isLoading, isError } = useQuery({
        queryKey: ["productDetails", productSlug],
        queryFn: () => getProductBySlugApi(productSlug),
        staleTime: 5 * 60 * 1000,
    });

    const product = productData?.data;

    console.log("Product Data:", productData);

    // Stock comes directly from the product relation
    const stock = product?.stocks?.reduce((acc, s) => acc + ((s.remaining - s.reserved) || 0), 0) || 0;

    console.log("Product Details:", product);
    console.log("Stock data: ", stock)

    // Combined list of this product + its group siblings, deduped by productId
    const allVariants = useMemo(() => {
        if (!product) return [];
        const list = [product, ...(product.groupProducts || [])];
        const seen = new Set();
        return list.filter((p) => {
            if (!p || seen.has(p.productId)) return false;
            seen.add(p.productId);
            return true;
        });
    }, [product]);

    const handleAddToCart = () => {
        if (!product) return;
        addToCart({
            id: product.productId,
            productId: product.productId,
            title: product.title,
            subTitle: product.subTitle,
            image: product.images?.[0]?.imageURL,
            mainPrice: Number(product.mainPrice),
            discountAmount: Number(product.discount) || 0,
            price: Number(product.price),
            quantity,
            insideDhakaCharge: Number(product.group?.insideDhakaCharge),
            outsideDhakaCharge: Number(product.group?.outsideDhakaCharge),
        });
        window.showToast?.(`${product.title} added to cart`, { type: "success" });
    };

    const handleAddVariationsToCart = (selected) => {
        if (!selected || selected.length === 0) return;

        selected.forEach(({ product: variant, quantity: qty }) => {
            addToCart({
                id: variant.productId,
                productId: variant.productId,
                title: variant.title,
                subTitle: variant.subTitle,
                image: variant.images?.[0]?.imageURL || variant.bannerImageURL,
                mainPrice: Number(variant.mainPrice),
                discountAmount: Number(variant.discount) || 0,
                price: Number(variant.price),
                quantity: qty,
                insideDhakaCharge: Number(product?.group?.insideDhakaCharge) || 0,
                outsideDhakaCharge: Number(product?.group?.outsideDhakaCharge) || 0,
            });
        });

        window.showToast?.(
            `${selected.length} item${selected.length > 1 ? "s" : ""} added to cart`,
            { type: "success" }
        );
    };

    if (isLoading) return <ProductLoadingState />;

    if (isError || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
                <div className="text-center space-y-6 max-w-md w-full">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Product Not Found</h1>
                    <p className="text-gray-400">This product doesn't exist or has been removed.</p>
                    <Button
                        onClick={() => window.history.back()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const mainPrice = Number(product.mainPrice) || 0;
    const discount = Number(product.discount) || 0;
    const price = Number(product.price) || 0;
    const discountPercent = discount > 0 ? Math.round((discount / mainPrice) * 100) : 0;
    const imageUrls = product.images?.map((img) => img.imageURL) || [];
    const groupProducts = product.groupProducts || [];
    const insideDhaka = Number(product.group?.insideDhakaCharge) || 0;
    const outsideDhaka = Number(product.group?.outsideDhakaCharge) || 0;

    const hasDescription = !!product.group?.description;
    const hasDescImages = (product.group?.descriptionImages?.length || 0) > 0;
    const hasSpecs = (product.group?.productSpecifications?.length || 0) > 0;
    const hasKeyFeatures = (product.group?.keyFeatures?.length || 0) > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <Helmet>
                <title>{`${product.title} | UpGear`}</title>
                <meta name="description" content={product.subTitle || `Buy ${product.title} at the best price in Bangladesh.`} />
                <meta property="og:title" content={`${product.title} | UpGear`} />
                <meta property="og:image" content={imageUrls[0]} />
                <meta property="og:type" content="product" />
                <meta property="og:url" content={window.location.href} />
                <link rel="canonical" href={window.location.href} />
            </Helmet>

            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 sm:mb-10">
                    <span className="hover:text-gray-300 cursor-pointer transition-colors">Home</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="hover:text-gray-300 cursor-pointer transition-colors">
                        {product.group?.category?.title || "Products"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="hover:text-gray-300 cursor-pointer transition-colors">
                        {product.group?.subCategory?.title}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-gray-300 truncate max-w-[120px] sm:max-w-xs">{product.title}</span>
                </nav>

                {/* Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 mb-12 sm:mb-16">

                    {/* Left — Image Gallery */}
                    <div className="lg:sticky lg:top-6 lg:self-start">
                        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-3 sm:p-5">
                            <ProductImageGallery images={imageUrls} title={product.title} />
                        </div>

                        {/* Shipping Info — desktop only below gallery */}
                        <div className="hidden lg:grid grid-cols-3 gap-3 mt-4">
                            {[
                                { icon: Truck, label: "Inside Dhaka", value: insideDhaka === 0 ? "Free" : `৳${insideDhaka}` },
                                { icon: Truck, label: "Outside Dhaka", value: `৳${outsideDhaka}` },
                                { icon: Shield, label: "Warranty", value: product.group?.warranty?.title || "N/A" },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3 flex flex-col items-center text-center gap-1.5">
                                    <Icon className="w-4 h-4 text-blue-400" />
                                    <p className="text-[10px] text-gray-500">{label}</p>
                                    <p className="text-xs font-semibold text-white">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — Product Info */}
                    <div className="space-y-5 sm:space-y-6">

                        {/* Category & Status Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs font-medium">
                                {product.group?.category?.title}
                            </Badge>
                            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs font-medium">
                                {product.group?.subCategory?.title}
                            </Badge>
                            {product.group?.brand?.name && (
                                <Badge className="bg-gray-700/60 text-gray-300 border-gray-600/50 text-xs font-medium">
                                    {product.group.brand.name}
                                </Badge>
                            )}
                            {stock > 0 ? (
                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                                    <Check className="h-3 w-3 mr-1" /> In Stock
                                </Badge>
                            ) : (
                                <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">
                                    <X className="h-3 w-3 mr-1" /> Out of Stock
                                </Badge>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white mb-2">
                                {product.title}
                            </h1>
                            {product.subTitle && (
                                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                                    {product.subTitle}
                                </p>
                            )}
                        </div>

                        {/* Price Card */}
                        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5 sm:p-6 space-y-5">
                            <div>
                                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-1">
                                    <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                                        ৳{price.toLocaleString()}
                                    </span>
                                    {discount > 0 && (
                                        <>
                                            <span className="text-xl sm:text-2xl text-gray-500 line-through">
                                                ৳{mainPrice.toLocaleString()}
                                            </span>
                                            <span className="px-2.5 py-1 bg-red-500/15 text-red-400 border border-red-500/20 rounded-lg text-sm font-semibold">
                                                -{discountPercent}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                                {discount > 0 && (
                                    <p className="text-sm text-green-400 font-medium">
                                        You save ৳{discount.toLocaleString()}
                                    </p>
                                )}
                            </div>

                            {/* Coupon */}
                            {product.coupon && (
                                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
                                    <Tag className="w-4 h-4 text-yellow-400 shrink-0" />
                                    <span className="text-sm text-yellow-300 font-medium">
                                        Coupon: <span className="font-mono">{product.coupon.code}</span>
                                    </span>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="pt-1 border-t border-gray-700/50">
                                <p className="text-sm font-medium text-gray-400 mb-3">Quantity</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-gray-900/60 border border-gray-700/50 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                            disabled={quantity <= 1}
                                            className="h-11 w-11 flex items-center justify-center hover:bg-gray-700/50 disabled:opacity-30 transition-colors"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-14 text-center font-bold text-lg select-none">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
                                            disabled={quantity >= stock || stock === 0}
                                            className="h-11 w-11 flex items-center justify-center hover:bg-gray-700/50 disabled:opacity-30 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-400">
                                        {stock > 0 ? `${stock} in stock` : "Out of stock"}
                                    </span>
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <button
                                onClick={handleAddToCart}
                                disabled={stock === 0}
                                className="w-full h-13 flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:shadow-none text-sm sm:text-base py-3.5"
                            >
                                <ShoppingCart className="h-5 w-5 shrink-0" />
                                {stock === 0 ? "Out of Stock" : "Add to Cart"}
                            </button>
                        </div>

                        {/* Key Features */}
                        {hasKeyFeatures && (
                            <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 sm:p-6">
                                <ProductKeyFeatures
                                    features={product.group.keyFeatures.map((kf) => kf.feature)}
                                />
                            </div>
                        )}

                        {/* Shipping — mobile only */}
                        <div className="grid grid-cols-3 gap-2 lg:hidden">
                            {[
                                { icon: Truck, label: "Inside Dhaka", value: insideDhaka === 0 ? "Free" : `৳${insideDhaka}` },
                                { icon: Truck, label: "Outside Dhaka", value: `৳${outsideDhaka}` },
                                { icon: Shield, label: "Warranty", value: product.group?.warranty?.title || "N/A" },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3 flex flex-col items-center text-center gap-1.5">
                                    <Icon className="w-4 h-4 text-blue-400" />
                                    <p className="text-[10px] text-gray-500">{label}</p>
                                    <p className="text-xs font-semibold text-white">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Group Products (thumbnail links to other variants) */}
                {groupProducts.length > 0 && (
                    <div className="mb-12 sm:mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-1 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                            <h2 className="text-xl sm:text-2xl font-bold">Other Variants</h2>
                        </div>
                        <GroupProduct groupProducts={groupProducts} />
                    </div>
                )}

                {/* Variations — always visible, pick quantities across all variants */}
                {allVariants.length > 0 && (
                    <div className="mb-12 sm:mb-16">
                        <VariationsModal
                            variants={allVariants}
                            onAddToCart={handleAddVariationsToCart}
                        />
                    </div>
                )}

                {/* Details Tabs */}
                {(hasDescription || hasDescImages || hasSpecs) && (
                    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 lg:p-8">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full bg-gray-900/50 border border-gray-700/50 p-1 rounded-xl mb-6 sm:mb-8 h-auto"
                                style={{ gridTemplateColumns: `repeat(${[hasDescription || hasDescImages, hasSpecs].filter(Boolean).length + 1 - 1}, 1fr)` }}
                            >
                                {(hasDescription || hasDescImages) && (
                                    <TabsTrigger
                                        value="description"
                                        className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm py-2.5"
                                    >
                                        Description
                                    </TabsTrigger>
                                )}
                                {hasSpecs && (
                                    <TabsTrigger
                                        value="specifications"
                                        className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transition-all text-xs sm:text-sm py-2.5"
                                    >
                                        Specifications
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {(hasDescription || hasDescImages) && (
                                <TabsContent value="description" className="mt-0">
                                    <ProductDescription
                                        productDetails={{
                                            details: product.group?.description,
                                            descImages: product.group?.descriptionImages?.map((img) => img.imageURL) || [],
                                        }}
                                    />
                                </TabsContent>
                            )}

                            {hasSpecs && (
                                <TabsContent value="specifications" className="mt-0">
                                    <ProductSpecifications specifications={product.group.productSpecifications} />
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetails;