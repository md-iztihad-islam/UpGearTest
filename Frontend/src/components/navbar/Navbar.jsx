import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, BoxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";
import cartStore from "@/state/clientPart/cartStore";
import Cart from "../clientPart/cart/Cart";
import SearchInput from "@/clientPart/search/SearchInput";
import upgearLogo from "@/assets/upgearlogo.png";
import userStore from "@/state/clientPart/userStore";

function Navbar() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = userStore();

    // console.log("User in Navbar:", user);
    
    const { isOpen, toggleCart, cartItems } = cartStore();
    const cartCount = cartItems?.length || 0;

    const { data: subCategoryData } = useQuery({
        queryKey: ["subcategories"],
        queryFn: () => getAllSubCategoriesApi(),
    });

    const subCategories = subCategoryData?.data || [];

    const handleRedirect = () => {
        if(user) {
            navigate("/customer/dashboard");
        }else if(!user) {
            navigate("/customer/signin");
        }
    }

    return (
        <nav className="sticky top-0 z-50 w-full bg-black backdrop-blur-md border-b border-gray-800">
            {/* Main Navigation Bar */}
            <div className="container mx-auto px-2 sm:px-4">
                <div className="flex h-15 sm:h-18 items-center justify-between gap-2 sm:gap-4">
                    {/* Logo */}
                    <div
                        className="flex items-center cursor-pointer group shrink-0"
                        onClick={() => navigate("/")}
                    >
                        <img src={upgearLogo} alt="UpGear" className="h-5 sm:h-6 md:h-10" />
                    </div>

                    {/* Search Input - Full Width on Mobile, Constrained on Desktop */}
                    <div className="flex-1 max-w-2xl">
                        <SearchInput
                            placeholder="Search products..."
                            className="w-full"
                        />
                    </div>

                    {/* Desktop Navigation Items */}
                    <div className="hidden lg:flex items-center gap-2 shrink-0">
                        {
                            user?.role === 'Admin' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/dashboard")}
                                    className="text-white hover:bg-gray-800 hover:text-white text-sm"
                                >
                                    Dashboard
                                </Button>
                            )
                        }
                        <Button
                            variant="default"
                            size="sm"
                            onClick={toggleCart}
                            className="
                                relative gap-2 ml-2 w-[120px] text-sm
                                bg-white/10 text-white
                                border border-white/20
                                shadow-sm backdrop-blur-sm
                                transition-all duration-200 ease-out
                                hover:bg-white hover:text-black hover:border-white hover:shadow-md hover:scale-[1.03]
                                active:scale-[0.97] active:shadow-none
                                group
                            "
                        >
                            <ShoppingCart className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                            <span className="hidden xl:inline">Cart</span>
                            {cartCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="
                                        ml-1 px-1.5 min-w-[20px] h-5 text-xs
                                        bg-white text-black
                                        transition-colors duration-200
                                        group-hover:bg-black group-hover:text-white
                                    "
                                >
                                    {cartCount}
                                </Badge>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRedirect}
                            className="
                                relative gap-2 w-[120px] text-sm
                                text-white bg-transparent
                                border border-white/30
                                shadow-sm
                                transition-all duration-200 ease-out
                                hover:bg-white hover:text-black hover:border-white hover:shadow-md hover:scale-[1.03]
                                active:scale-[0.97] active:shadow-none
                                group
                            "
                        >
                            <BoxIcon className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
                            <span className="hidden xl:inline">Track Order</span>
                        </Button>
                    </div>

                    {/* Mobile Actions */}
                    <div className="flex lg:hidden items-center gap-1 sm:gap-2 shrink-0">
                        {/* Cart Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCart}
                            className="relative text-white hover:bg-gray-800 h-8 w-8 sm:h-9 sm:w-9"
                        >
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                            {cartCount > 0 && (
                                <Badge 
                                    variant="default" 
                                    className="absolute -top-1 -right-1 px-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] text-[10px] sm:text-xs bg-white text-black flex items-center justify-center"
                                >
                                    {cartCount}
                                </Badge>
                            )}
                        </Button>

                        {/* Mobile Menu */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 h-8 w-8 sm:h-9 sm:w-9">
                                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0 bg-black border-l border-gray-800">
                                <MobileMenuContent
                                    subCategories={subCategories}
                                    navigate={navigate}
                                    onClose={() => setMobileMenuOpen(false)}
                                    cartCount={cartCount}
                                    toggleCart={toggleCart}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            {/* Secondary Navigation - Desktop Only */}
            <div className="hidden lg:block border-t border-gray-800 bg-gray-900/30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-1 h-12 overflow-x-auto scrollbar-hide">
                        {subCategories.map((subCategory) => (
                            <Button
                                key={subCategory.slug}
                                variant="ghost"
                                size="sm"
                                className="h-10 text-white hover:bg-gray-800 hover:text-white whitespace-nowrap text-sm"
                                onClick={() => navigate(`/products/sub-category/${subCategory.slug}`)}
                            >
                                {subCategory.title}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Sidebar */}
            {isOpen && <Cart />}
        </nav>
    );
}

// Mobile Menu Component
const MobileMenuContent = ({ 
    subCategories, 
    navigate, 
    onClose,
    cartCount,
    toggleCart
}) => {
    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    const { user } = userStore();

    const handleRedirect = () => {
        // console.log("Redirecting to dashboard or signin based on user role...");
        if(user) {
            navigate("/customer/dashboard");
        }else if(!user) {
            navigate("/customer/signin");
        }
    }

    return (
        <div className="flex flex-col h-screen">
            <SheetHeader className="p-4 border-b border-gray-800">
                <SheetTitle className="text-white text-left text-base">Menu</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Dashboard Link */}
                {
                    user?.role === 'Admin' && (
                        <div className="space-y-1">
                            <Button
                                variant="ghost"
                                className="w-full justify-start h-11 text-white hover:bg-gray-800 text-sm"
                                onClick={() => handleNavigation("/dashboard")}
                            >
                                Dashboard
                            </Button>
                        </div>
                    )
                }

                {/* Categories */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 px-3 uppercase tracking-wide">Categories</h3>
                    <div className="space-y-1">
                        {subCategories.map((subCategory) => (
                            <Button
                                key={subCategory._id}
                                variant="ghost"
                                className="w-full justify-start h-10 text-white hover:bg-gray-800 text-sm"
                                onClick={() => handleNavigation(`/products/sub-category/${subCategory.slug}`)}
                            >
                                {subCategory.title}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Button */}
            <div className="p-3 border-t border-gray-800">
                <Button
                    className="w-full gap-2 bg-white text-black hover:bg-gray-200 h-11 text-sm font-medium"
                    onClick={handleRedirect}
                >
                    <BoxIcon className="h-4 w-4" />
                    Track Order
                </Button>
            </div>

            <div className="p-3 border-t border-gray-800">
                <Button
                    className="w-full gap-2 bg-white text-black hover:bg-gray-200 h-11 text-sm font-medium"
                    onClick={() => {
                        onClose();
                        toggleCart();
                    }}
                >
                    <ShoppingCart className="h-4 w-4" />
                    View Cart
                    {cartCount > 0 && (
                        <Badge variant="secondary" className="ml-auto bg-black text-white text-xs px-2">
                            {cartCount}
                        </Badge>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default Navbar;