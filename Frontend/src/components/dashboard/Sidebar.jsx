import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
    LayoutDashboard, 
    Tag, 
    FolderTree, 
    Package, 
    FileText, 
    ShoppingBag, 
    ClipboardList, 
    BarChart3, 
    Shield, 
    Megaphone, 
    Sparkles, 
    Percent, 
    Flame,
    Menu,
    X,
    ShieldCheck,
    Users,
    Search
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import signoutApi from "@/services/dashboard/authentication/signout";
import userStore from "@/state/clientPart/userStore";

const menuItems = [
    { path: "sellcontrol", label: "Sell Control", icon: LayoutDashboard },
    { path: "customercontrol", label: "Customer Control", icon: Users },
    { path: "searchorder", label: "Search Order", icon: Search },
    { path: "bannercontrol", label: "Banner Control", icon: LayoutDashboard },
    { path: "brandcontrol", label: "Brand Control", icon: LayoutDashboard },
    { path: "couponcontrol", label: "Coupon Control", icon: Tag },
    { path: "categorycontrol", label: "Categories Control", icon: FolderTree },
    { path: "stockcontrol", label: "Stock Control", icon: Package },
    { path: "specificationcontrol", label: "Specification Control", icon: FileText },
    { path: "productcontrol", label: "Product Control", icon: ShoppingBag },
    { path: "ordercontrol", label: "Order Control", icon: ClipboardList },
    { path: "reportcontrol", label: "Report Control", icon: BarChart3 },
    { path: "warrantycontrol", label: "Warranty Control", icon: Shield },
    // { path: "campaigncontrol", label: "Campaign Control", icon: Megaphone },
    // { path: "newarraivalcontrol", label: "New Arrivals Control", icon: Sparkles },
    // { path: "discountcontrol", label: "Discount Control", icon: Percent },
    // { path: "hotdealscontrol", label: "Hot Deals Control", icon: Flame },
    { path: "storecontrol", label: "Store Control", icon: LayoutDashboard },
    { path: "employeecontrol", label: "Employee Control", icon: ShieldCheck },
    { path: "expensecontrol", label: "Expense Control", icon: Flame }
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const { clearUser } = userStore();

    const isActive = (path) => location.pathname.includes(path);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const { mutate } = useMutation({
        mutationFn: () => signoutApi(),
        onSuccess: () => {
            localStorage.removeItem("token");
            clearUser();
            alert("Signed out successfully");
            navigate("/signin");
        },
        onError: () => {
            // console.log("Error during signout:", error);
            alert("Error signing out. Please try again.");
        }
    })

    const handleSignout = () => {
        mutate();
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-black shadow-lg border border-gray-200 hover:bg-gray-50"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-10 left-0 z-40
                    w-64 lg:w-72 h-screen
                    bg-black border-r border-gray-200
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    flex flex-col
                `}
            >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 onClick={() => navigate("/dashboard")} className="text-2xl font-bold text-white cursor-pointer">Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">Admin Controls</p>
                </div>

                {/* Scrollable Menu Items */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsOpen(false); // Close sidebar on mobile after navigation
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                    text-left font-medium transition-all duration-200
                                    ${active
                                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                                        : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-white'}`} />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200">
                    <button onClick={() => handleSignout()} className="p-3 w-full bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200">
                        Signout
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;