import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
    ShoppingCart, AlertCircle, X, Minus, Plus, Check,
    Truck, Shield, Tag, ChevronRight, Layers
} from "lucide-react";
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

// Shared look with the product cards / listing pages
const PANEL = "bg-[#181818] border border-[#2a2a2a] rounded-none rounded-tr-2xl rounded-bl-2xl";

function SectionHeading({ children }) {
    return (
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 sm:mb-6">{children}</h2>
    );
}

function ShippingTiles({ insideDhaka, outsideDhaka, warranty, className = "" }) {
    return (
        <div className={`grid grid-cols-3 gap-2 sm:gap-3 ${className}`}>
            {[
                { icon: Truck, label: "Inside Dhaka", value: insideDhaka === 0 ? "Free" : `৳${insideDhaka}` },
                { icon: Truck, label: "Outside Dhaka", value: `৳${outsideDhaka}` },
                { icon: Shield, label: "Warranty", value: warranty || "N/A" },
            ].map((tile) => {
                const Icon = tile.icon;
                return (
                    <div key={tile.label} className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-3 flex flex-col items-center text-center gap-1.5">
                        <Icon className="w-4 h-4 text-gray-300" />
                        <p className="text-[10px] uppercase tracking-wide text-gray-500">{tile.label}</p>
                        <p className="text-xs font-semibold text-white">{tile.value}</p>
                    </div>
                );
            })}
        </div>
    );
}

function ProductDetails() {
    const { productSlug } = useParams();
    const [activeTab, setActiveTab] = useState("description");
    const [quantity, setQuantity] = useState(1);
    const [variationsOpen, setVariationsOpen] = useState(false);
    const { addToCart } = cartStore();

    const { data: productData, isLoading, isError } = useQuery({
        queryKey: ["productDetails", productSlug],
        queryFn: () => getProductBySlugApi(productSlug),
        staleTime: 5 * 60 * 1000,
    });

    const product = productData?.data;

    // Stock comes directly from the product relation
    const stock = product?.stocks?.reduce((acc, s) => acc + ((s.remaining - s.reserved) || 0), 0) || 0;

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
        const price = Number(product.price) || 0;
        const mainPrice = Number(product.mainPrice) || price;
        addToCart({
            id: product.productId,
            productId: product.productId,
            title: product.title,
            subTitle: product.subTitle,
            image: product.images?.[0]?.imageURL || product.bannerImageURL,
            mainPrice,
            discountAmount: Math.max(0, mainPrice - price),
            price,
            quantity,
            insideDhakaCharge: Number(product.group?.insideDhakaCharge),
            outsideDhakaCharge: Number(product.group?.outsideDhakaCharge),
        });
        window.showToast?.(`${product.title} added to cart`, { type: "success" });
    };

    const handleAddVariationsToCart = (selected) => {
        if (!selected || selected.length === 0) return;

        selected.forEach(({ product: variant, quantity: qty }) => {
            const price = Number(variant.price) || 0;
            const mainPrice = Number(variant.mainPrice) || price;
            addToCart({
                id: variant.productId,
                productId: variant.productId,
                title: variant.title,
                subTitle: variant.subTitle,
                image: variant.images?.[0]?.imageURL || variant.bannerImageURL,
                mainPrice,
                discountAmount: Math.max(0, mainPrice - price),
                price,
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
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
                <div className="text-center space-y-6 max-w-md w-full">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#181818] border border-[#2a2a2a] rounded-none rounded-tr-2xl rounded-bl-2xl">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Product Not Found</h1>
                    <p className="text-gray-400">This product doesn't exist or has been removed.</p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 h-11 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const price = Number(product.price) || 0;
    const mainPrice = Number(product.mainPrice) || price;
    const discount = Math.max(0, mainPrice - price);
    const discountPercent = discount > 0 ? Math.round((discount / mainPrice) * 100) : 0;
    const imageUrls = product.images?.length
        ? product.images.map((img) => img.imageURL)
        : [product.bannerImageURL].filter(Boolean);
    const groupProducts = product.groupProducts || [];
    const insideDhaka = Number(product.group?.insideDhakaCharge) || 0;
    const outsideDhaka = Number(product.group?.outsideDhakaCharge) || 0;
    const warranty = product.group?.warranty?.title;
    const subCategory = product.group?.subCategory;
    const brand = product.group?.brand;

    const hasDescription = !!product.group?.description;
    const hasDescImages = (product.group?.descriptionImages?.length || 0) > 0;
    const hasSpecs = (product.group?.productSpecifications?.length || 0) > 0;
    const hasKeyFeatures = (product.group?.keyFeatures?.length || 0) > 0;
    const tabCount = [hasDescription || hasDescImages, hasSpecs].filter(Boolean).length;
    // Fall back to specifications when the group has no description content.
    const selectedTab = hasDescription || hasDescImages ? activeTab : "specifications";

    const tabTriggerCls =
        "text-gray-400 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-none rounded-lg transition-colors text-xs sm:text-sm py-2.5";

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <Helmet>
                <title>{`${product.title} | UpGear`}</title>
                <meta name="description" content={product.subTitle || `Buy ${product.title} at the best price in Bangladesh.`} />
                <meta property="og:title" content={`${product.title} | UpGear`} />
                <meta property="og:image" content={imageUrls[0]} />
                <meta property="og:type" content="product" />
                <meta property="og:url" content={window.location.href} />
                <link rel="canonical" href={window.location.href} />
            </Helmet>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 sm:mb-8 overflow-hidden">
                    <Link to="/" className="hover:text-gray-300 transition-colors shrink-0">Home</Link>
                    {subCategory?.title && (
                        <>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                            {subCategory.slug ? (
                                <Link
                                    to={`/products/sub-category/${subCategory.slug}`}
                                    className="hover:text-gray-300 transition-colors shrink-0"
                                >
                                    {subCategory.title}
                                </Link>
                            ) : (
                                <span className="shrink-0">{subCategory.title}</span>
                            )}
                        </>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-gray-300 truncate">{product.title}</span>
                </nav>

                {/* Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-14 mb-12 sm:mb-16">

                    {/* Left — Image Gallery */}
                    <div className="lg:sticky lg:top-24 lg:self-start">
                        <div className={`${PANEL} bg-black p-3 sm:p-5`}>
                            <ProductImageGallery images={imageUrls} title={product.title} />
                        </div>

                        {/* Shipping Info — desktop only below gallery */}
                        <ShippingTiles
                            insideDhaka={insideDhaka}
                            outsideDhaka={outsideDhaka}
                            warranty={warranty}
                            className="hidden lg:grid mt-4"
                        />
                    </div>

                    {/* Right — Product Info */}
                    <div className="space-y-5 sm:space-y-6">

                        {/* Category & Status */}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                            {brand?.title && (
                                <span className="px-2.5 py-1 bg-[#181818] border border-[#2a2a2a] text-gray-300 rounded-full font-medium">
                                    {brand.title}
                                </span>
                            )}
                            {subCategory?.title && (
                                <span className="px-2.5 py-1 bg-[#181818] border border-[#2a2a2a] text-gray-400 rounded-full">
                                    {subCategory.title}
                                </span>
                            )}
                            {stock > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full">
                                    <Check className="h-3 w-3" /> In Stock
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
                                    <X className="h-3 w-3" /> Out of Stock
                                </span>
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
                        <div className={`${PANEL} p-5 sm:p-6 space-y-5`}>
                            <div>
                                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-1">
                                    <span className="text-3xl sm:text-4xl font-bold text-white">
                                        ৳{price.toLocaleString()}
                                    </span>
                                    {discount > 0 && (
                                        <span className="text-lg sm:text-xl text-gray-500 line-through">
                                            ৳{mainPrice.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {discount > 0 && (
                                    <p className="text-sm text-green-400 font-semibold">
                                        Save ৳{discount.toLocaleString()} ({discountPercent}%)
                                    </p>
                                )}
                            </div>

                            {/* Coupon */}
                            {product.coupon && (
                                <div className="flex items-center gap-2 bg-[#0f0f0f] border border-dashed border-[#333333] rounded-xl px-4 py-2.5">
                                    <Tag className="w-4 h-4 text-gray-300 shrink-0" />
                                    <span className="text-sm text-gray-300">
                                        Use coupon <span className="font-mono font-semibold text-white">{product.coupon.code}</span>
                                    </span>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="pt-5 border-t border-[#2a2a2a]">
                                <p className="text-sm font-medium text-gray-400 mb-3">Quantity</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-[#0f0f0f] border border-[#333333] rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                            disabled={quantity <= 1}
                                            aria-label="Decrease quantity"
                                            className="h-11 w-11 flex items-center justify-center hover:bg-[#242424] disabled:opacity-30 transition-colors"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-12 text-center font-bold text-lg select-none">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
                                            disabled={quantity >= stock || stock === 0}
                                            aria-label="Increase quantity"
                                            className="h-11 w-11 flex items-center justify-center hover:bg-[#242424] disabled:opacity-30 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {stock > 0 ? `${stock} in stock` : "Out of stock"}
                                    </span>
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <button
                                onClick={handleAddToCart}
                                disabled={stock === 0}
                                className="w-full flex items-center justify-center gap-2.5 bg-white text-black hover:bg-gray-200 disabled:bg-[#242424] disabled:text-gray-500 disabled:cursor-not-allowed font-semibold rounded-xl transition-colors text-sm sm:text-base py-3.5"
                            >
                                <ShoppingCart className="h-5 w-5 shrink-0" />
                                {stock === 0 ? "Out of Stock" : "Add to Cart"}
                            </button>

                            {/* Opens the multi-variant picker */}
                            {allVariants.length > 1 && (
                                <button
                                    onClick={() => setVariationsOpen(true)}
                                    className="w-full flex items-center justify-center gap-2.5 bg-[#1a1a1a] hover:bg-[#242424] border border-[#333333] text-white font-medium rounded-xl transition-colors text-sm sm:text-base py-3"
                                >
                                    <Layers className="h-4 w-4 shrink-0" />
                                    Buy Multiple Variations
                                </button>
                            )}
                        </div>

                        {/* Key Features */}
                        {hasKeyFeatures && (
                            <div className={`${PANEL} p-5 sm:p-6`}>
                                <ProductKeyFeatures
                                    features={product.group.keyFeatures.map((kf) => kf.feature)}
                                />
                            </div>
                        )}

                        {/* Shipping — mobile only */}
                        <ShippingTiles
                            insideDhaka={insideDhaka}
                            outsideDhaka={outsideDhaka}
                            warranty={warranty}
                            className="lg:hidden"
                        />
                    </div>
                </div>

                {/* Group Products (thumbnail links to other variants) */}
                {groupProducts.length > 0 && (
                    <div className="mb-12 sm:mb-16">
                        <SectionHeading>Other Variants</SectionHeading>
                        <GroupProduct groupProducts={groupProducts} />
                    </div>
                )}

                {/* Variations — hidden until "Buy Multiple Variations" is clicked */}
                <VariationsModal
                    open={variationsOpen}
                    onOpenChange={setVariationsOpen}
                    variants={allVariants}
                    onAddToCart={handleAddVariationsToCart}
                />

                {/* Details Tabs */}
                {tabCount > 0 && (
                    <div className={`${PANEL} p-4 sm:p-6 lg:p-8`}>
                        <Tabs value={selectedTab} onValueChange={setActiveTab}>
                            <TabsList
                                className="grid w-full sm:w-fit bg-[#0f0f0f] border border-[#2a2a2a] p-1 rounded-xl mb-6 sm:mb-8 h-auto"
                                style={{ gridTemplateColumns: `repeat(${tabCount}, minmax(0, 1fr))` }}
                            >
                                {(hasDescription || hasDescImages) && (
                                    <TabsTrigger value="description" className={`${tabTriggerCls} sm:px-6`}>
                                        Description
                                    </TabsTrigger>
                                )}
                                {hasSpecs && (
                                    <TabsTrigger value="specifications" className={`${tabTriggerCls} sm:px-6`}>
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
