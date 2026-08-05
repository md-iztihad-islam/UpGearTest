import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/navbar/Navbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
    return (
        <div className="min-h-screen bg-black">
            {/* Navbar */}
            <Navbar />

            {/* Main Layout Container */}
            <div className="flex">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 min-h-screen lg:ml-0">
                    {/* Content Wrapper with padding and max-width */}
                    <div className="w-full h-full p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;