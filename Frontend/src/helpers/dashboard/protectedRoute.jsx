import { Navigate, useLocation } from "react-router-dom";
import userStore from "@/state/clientPart/userStore";
import { useEffect } from "react";
import { getStoredAuthToken } from "@/helpers/dashboard/axiosInstance";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, isLoading, logout } = userStore();
    const location = useLocation();
    const token = getStoredAuthToken();

    useEffect(() => {
        // Clean up if token exists but user failed to load
        if (token && !isLoading && !user) {
            logout();
        }
    }, [token, user, isLoading, logout]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
        );
    }

    // Check authentication
    if (!token || !user) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // Check admin access if required
    if (requireAdmin && user?.role !== "admin") {
        window.showToast?.("Access denied. Admin privileges required.", "error");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;