import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, Search, User, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import getAllSubCategoriesApi from "@/services/dashboard/category/getAllSubCategoriesApi";
import { getBrandsBySubCategoryApi } from "@/services/dashboard/brand/getBrandsBySubCategoryApi";
import cartStore from "@/state/clientPart/cartStore";
import Cart from "../clientPart/cart/Cart";
import SearchInput from "@/clientPart/search/SearchInput";
import upgearLogo from "@/assets/upgearlogo.png";
import userStore from "@/state/clientPart/userStore";

const BG = "#0F0F0F";

// Accepts either a bare array (`[...]`) or a `{ data: [...] }` envelope,
// so the UI doesn't break if the backend response shape changes.
function normalizeBrands(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

/* ─── Divider ───────────────────────────────────────────────────── */
function IconDivider() {
    return <span className="h-5 w-px bg-white/15 mx-2.5 shrink-0" />;
}

/* ─── Brand dropdown panel content (positioning handled by the portal wrapper) ── */
function BrandDropdownContent({ subCategory, navigate, onNavigate, style, onMouseEnter, onMouseLeave }) {
    const { data, isLoading } = useQuery({
        queryKey: ["brands-by-subcategory", subCategory.subCategoryId],
        queryFn: () => getBrandsBySubCategoryApi(subCategory.subCategoryId),
        staleTime: 5 * 60 * 1000,
    });

    const brands = normalizeBrands(data);

    const goToBrand = (brand) => {
        navigate(`/products/sub-category/${subCategory.slug}/brand/${brand.slug}`);
        onNavigate?.();
    };

    return (
        <div
            style={style}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="min-w-[180px] rounded-lg border border-white/10 bg-[#171717] shadow-xl shadow-black/40 py-1.5 overflow-hidden"
        >
            {isLoading ? (
                <div className="px-4 py-2.5 text-xs text-gray-500">Loading…</div>
            ) : brands.length === 0 ? (
                <div className="px-4 py-2.5 text-xs text-gray-500">No brands yet</div>
            ) : (
                brands.map((brand) => (
                    <button
                        key={brand.brandId}
                        onClick={() => goToBrand(brand)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        {brand.title}
                    </button>
                ))
            )}
        </div>
    );
}

/* ─── Desktop subcategory nav item (hover = floating brand dropdown) ── */
function SubCategoryNavItem({ subCategory, navigate }) {
    const [hovered, setHovered] = useState(false);
    const [coords, setCoords] = useState(null);
    const triggerRef = useRef(null);
    const closeTimeout = useRef(null);

    const clearCloseTimeout = () => {
        if (closeTimeout.current) {
            clearTimeout(closeTimeout.current);
            closeTimeout.current = null;
        }
    };

    const openDropdown = () => {
        clearCloseTimeout();
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({ top: rect.bottom + 6, left: rect.left });
        }
        setHovered(true);
    };

    // small delay so moving the cursor from the trigger into the portal
    // (a physically separate DOM node) doesn't close the dropdown
    const scheduleClose = () => {
        clearCloseTimeout();
        closeTimeout.current = setTimeout(() => setHovered(false), 150);
    };

    // close (rather than try to keep repositioning) if the page/nav scrolls or resizes
    useEffect(() => {
        if (!hovered) return;
        const close = () => setHovered(false);
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
        return () => {
            window.removeEventListener("scroll", close, true);
            window.removeEventListener("resize", close);
        };
    }, [hovered]);

    useEffect(() => () => clearCloseTimeout(), []);

    return (
        <div ref={triggerRef} onMouseEnter={openDropdown} onMouseLeave={scheduleClose}>
            <button
                onClick={() => navigate(`/products/sub-category/${subCategory.slug}`)}
                className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors whitespace-nowrap"
            >
                {subCategory.title}
            </button>
            {hovered && coords &&
                createPortal(
                    <BrandDropdownContent
                        subCategory={subCategory}
                        navigate={navigate}
                        style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 9999 }}
                        onMouseEnter={clearCloseTimeout}
                        onMouseLeave={scheduleClose}
                    />,
                    document.body
                )}
        </div>
    );
}

/* ─── Expanding search (shared shape for desktop + mobile) ─────────── */
function ExpandingSearch({ open, onToggle, className = "" }) {
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                onToggle(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onToggle]);

    return (
        <div ref={wrapperRef} className={`flex items-center ${className}`}>
            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                    open ? "w-56 sm:w-72 opacity-100" : "w-0 opacity-0"
                }`}
            >
                <SearchInput placeholder="Search products..." className="w-full" autoFocus={open} />
            </div>
            <button
                onClick={() => onToggle(!open)}
                className="text-white/90 hover:text-white transition-colors p-1.5 shrink-0"
                aria-label="Toggle search"
            >
                {open ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
            </button>
        </div>
    );
}

function Navbar() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const { user } = userStore();

    const { isOpen, toggleCart, cartItems } = cartStore();
    const cartCount = cartItems?.length || 0;

    const { data: subCategoryData } = useQuery({
        queryKey: ["subcategories"],
        queryFn: () => getAllSubCategoriesApi(),
    });

    const subCategories = subCategoryData?.data || [];

    const handleAccountClick = () => {
        if (user) {
            navigate("/customer/dashboard");
        } else {
            navigate("/customer/signin");
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-white/10" style={{ backgroundColor: BG }}>
            <div className="container mx-auto px-3 sm:px-4">

                {/* ── Mobile search overlay row ── */}
                {mobileSearchOpen ? (
                    <div className="flex lg:hidden items-center gap-2 h-14">
                        <div className="flex-1">
                            <SearchInput placeholder="Search products..." className="w-full" autoFocus />
                        </div>
                        <button
                            onClick={() => setMobileSearchOpen(false)}
                            className="text-white/90 hover:text-white p-1.5 shrink-0"
                            aria-label="Close search"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex lg:hidden h-14 items-center justify-between gap-2">
                        <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate("/")}>
                            <img src={upgearLogo} alt="UpGear" className="h-5 sm:h-6" />
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMobileSearchOpen(true)}
                                className="text-white/90 hover:text-white p-2"
                                aria-label="Open search"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0 border-l border-white/10" style={{ backgroundColor: BG }}>
                                    <MobileMenuContent
                                        subCategories={subCategories}
                                        navigate={navigate}
                                        onClose={() => setMobileMenuOpen(false)}
                                        cartCount={cartCount}
                                        toggleCart={toggleCart}
                                        onAccountClick={handleAccountClick}
                                        user={user}
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                )}

                {/* ── Desktop row ── */}
                <div className="hidden lg:flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center cursor-pointer shrink-0" onClick={() => navigate("/")}>
                        <img src={upgearLogo} alt="UpGear" className="h-8" />
                    </div>

                    {/* Subcategory nav with brand hover dropdowns */}
                    <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
                        {subCategories.map((subCategory) => (
                            <SubCategoryNavItem
                                key={subCategory.subCategoryId}
                                subCategory={subCategory}
                                navigate={navigate}
                            />
                        ))}
                    </div>

                    {/* Right cluster: search, cart, wishlist, account */}
                    <div className="flex items-center shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5">
                        <ExpandingSearch open={searchOpen} onToggle={setSearchOpen} />

                        <IconDivider />

                        <button
                            onClick={toggleCart}
                            className="relative flex items-center gap-1.5 text-white/90 hover:text-white transition-colors p-1"
                            aria-label="Cart"
                        >
                            <ShoppingCart className="h-[18px] w-[18px]" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 text-[10px] bg-white text-black flex items-center justify-center">
                                    {cartCount}
                                </Badge>
                            )}
                        </button>

                        <IconDivider />

                        <button
                            onClick={handleAccountClick}
                            className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors p-1 whitespace-nowrap"
                        >
                            <User className="h-[18px] w-[18px]" />
                            <span className="text-sm font-medium">{user ? "Account" : "Sign Up"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Cart Sidebar */}
            {isOpen && <Cart />}
        </nav>
    );
}

/* ─── Mobile menu (inside hamburger sheet) ─────────────────────────── */
const MobileMenuContent = ({
    subCategories,
    navigate,
    onClose,
    cartCount,
    toggleCart,
    onAccountClick,
    user,
}) => {
    const [openSubCategoryId, setOpenSubCategoryId] = useState(null);

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    const { data, isFetching } = useQuery({
        queryKey: ["brands-by-subcategory", openSubCategoryId],
        queryFn: () => getBrandsBySubCategoryApi(openSubCategoryId),
        enabled: !!openSubCategoryId,
        staleTime: 5 * 60 * 1000,
    });
    const brands = normalizeBrands(data);

    return (
        <div className="flex flex-col h-screen">
            <SheetHeader className="p-4 border-b border-white/10">
                <SheetTitle className="text-white text-left text-base">Menu</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {user?.role === "Admin" && (
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-11 text-white hover:bg-white/10 text-sm"
                        onClick={() => handleNavigation("/dashboard")}
                    >
                        Dashboard
                    </Button>
                )}

                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 px-3 uppercase tracking-wide">
                        Categories
                    </h3>
                    <div className="space-y-1">
                        {subCategories.map((subCategory) => {
                            const isOpen = openSubCategoryId === subCategory.subCategoryId;
                            return (
                                <div key={subCategory.subCategoryId}>
                                    <div className="flex items-center">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 justify-start h-10 text-white hover:bg-white/10 text-sm"
                                            onClick={() => handleNavigation(`/products/sub-category/${subCategory.slug}`)}
                                        >
                                            {subCategory.title}
                                        </Button>
                                        <button
                                            onClick={() =>
                                                setOpenSubCategoryId(isOpen ? null : subCategory.subCategoryId)
                                            }
                                            className="px-3 h-10 text-gray-500 hover:text-white transition-colors"
                                            aria-label="Show brands"
                                        >
                                            {isOpen ? "−" : "+"}
                                        </button>
                                    </div>
                                    {isOpen && (
                                        <div className="pl-4 py-1 space-y-0.5">
                                            {isFetching ? (
                                                <p className="px-3 py-1.5 text-xs text-gray-500">Loading…</p>
                                            ) : brands.length === 0 ? (
                                                <p className="px-3 py-1.5 text-xs text-gray-500">No brands yet</p>
                                            ) : (
                                                brands.map((brand) => (
                                                    <Button
                                                        key={brand.brandId}
                                                        variant="ghost"
                                                        className="w-full justify-start h-9 text-gray-300 hover:bg-white/10 hover:text-white text-xs"
                                                        onClick={() =>
                                                            handleNavigation(
                                                                `/products/sub-category/${subCategory.slug}/brand/${brand.slug}`
                                                            )
                                                        }
                                                    >
                                                        {brand.title}
                                                    </Button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-3 border-t border-white/10">
                <Button
                    className="w-full gap-2 bg-white text-black hover:bg-gray-200 h-11 text-sm font-medium"
                    onClick={() => { onAccountClick(); onClose(); }}
                >
                    <User className="h-4 w-4" />
                    {user ? "Account" : "Sign Up"}
                </Button>
            </div>

            <div className="p-3 border-t border-white/10">
                <Button
                    className="w-full gap-2 bg-white text-black hover:bg-gray-200 h-11 text-sm font-medium"
                    onClick={() => { onClose(); toggleCart(); }}
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