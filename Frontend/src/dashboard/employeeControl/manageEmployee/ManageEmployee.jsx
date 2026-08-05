import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Edit, Trash2, Loader2, Users, Plus } from "lucide-react";
import getAllEmployeesApi from "@/services/dashboard/employee/getAllEmployeeApi";
import deleteEmployeeApi from "@/services/dashboard/employee/deleteEmployeeApi";

function ManageEmployee() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: employeesRes, isLoading, error, refetch } = useQuery({
        queryKey: ["employees"],
        queryFn: getAllEmployeesApi,
    });

    const allEmployees = employeesRes?.data || [];

    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) return allEmployees;
        const query = searchQuery.toLowerCase();
        return allEmployees.filter((emp) =>
            emp.name?.toLowerCase().includes(query) ||
            emp.email?.toLowerCase().includes(query) ||
            emp.phone?.toLowerCase().includes(query) ||
            emp.role?.toLowerCase().includes(query) ||
            emp.status?.toLowerCase().includes(query) ||
            emp.store?.title?.toLowerCase().includes(query)
        );
    }, [allEmployees, searchQuery]);

    const { mutate: deleteEmployee, isPending: isDeleting } = useMutation({
        mutationFn: (employeeId) => deleteEmployeeApi(employeeId),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Employee deleted successfully.", "success");
                refetch();
            } else {
                window.showToast("Failed to delete employee.", "error");
            }
        },
        onError: () => {
            window.showToast("An error occurred while deleting.", "error");
        },
    });

    const handleDelete = (emp) => {
        if (window.confirm(`Are you sure you want to delete "${emp.name}"? This cannot be undone.`)) {
            deleteEmployee(emp.employeeId);
        }
    };

    const roleColor = (role) => {
        switch (role) {
            case "Admin": return "bg-red-600/20 text-red-400";
            case "Accountant": return "bg-blue-600/20 text-blue-400";
            case "SalesAssociate": return "bg-green-600/20 text-green-400";
            default: return "bg-gray-600/20 text-gray-400";
        }
    };

    const statusColor = (status) => {
        switch (status) {
            case "active": return "bg-green-600/20 text-green-400";
            case "inactive": return "bg-gray-600/20 text-gray-400";
            case "suspended": return "bg-red-600/20 text-red-400";
            default: return "bg-gray-600/20 text-gray-400";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back</span>
                    </button>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Manage Employees
                            </h1>
                            <p className="text-gray-400">Search and manage your team</p>
                        </div>
                        <button
                            onClick={() => navigate("../add-employee")}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 w-full relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, role, store..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                            />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400 whitespace-nowrap">
                            <Users className="w-5 h-5" />
                            <span>{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""} found</span>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400">Loading employees...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
                        <p className="text-red-400">Error fetching employees: {error.message}</p>
                    </div>
                )}

                {/* List */}
                {!isLoading && !error && filteredEmployees.length > 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden mb-6">

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/50 border-b border-gray-600">
                                    <tr>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Employee</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Store</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Role</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                        <th className="p-4 text-left text-sm font-semibold text-gray-300">Hire Date</th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.employeeId} className="border-b border-gray-700 hover:bg-gray-700/30 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {emp.imageURL ? (
                                                        <img
                                                            src={emp.imageURL}
                                                            alt={emp.name}
                                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white font-bold text-sm">
                                                                {emp.name?.[0]?.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{emp.name}</p>
                                                        <p className="text-xs text-gray-500">#{emp.employeeId.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-300">{emp.email}</p>
                                                <p className="text-xs text-gray-500">{emp.phone}</p>
                                            </td>
                                            <td className="p-4 text-sm text-gray-300">
                                                {emp.store?.title || "—"}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor(emp.role)}`}>
                                                    {emp.role === "SalesAssociate" ? "Sales Associate" : emp.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(emp.status)}`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-400">
                                                {new Date(emp.hireDate).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`edit-employee/${emp.employeeId}`)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors text-sm"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(emp)}
                                                        disabled={isDeleting}
                                                        className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                                                    >
                                                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden">
                            {filteredEmployees.map((emp) => (
                                <div key={emp.employeeId} className="p-6 border-b border-gray-700 last:border-b-0">
                                    <div className="flex items-start gap-4 mb-4">
                                        {emp.imageURL ? (
                                            <img src={emp.imageURL} alt={emp.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-bold text-xl">{emp.name?.[0]?.toUpperCase()}</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white">{emp.name}</p>
                                            <p className="text-sm text-gray-400">{emp.email}</p>
                                            <p className="text-xs text-gray-500">{emp.phone}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(emp.status)}`}>
                                            {emp.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 mb-1">Store</p>
                                            <p className="text-white">{emp.store?.title || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Role</p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor(emp.role)}`}>
                                                {emp.role === "SalesAssociate" ? "Sales Associate" : emp.role}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Hire Date</p>
                                            <p className="text-white">{new Date(emp.hireDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate(`edit-employee/${emp.employeeId}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(emp)}
                                            disabled={isDeleting}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting...</> : <><Trash2 className="w-4 h-4" />Delete</>}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {!isLoading && !error && filteredEmployees.length === 0 && searchQuery && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-lg">No employees found for "{searchQuery}"</p>
                        <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && allEmployees.length === 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-300 text-lg mb-2">No employees yet</p>
                        <p className="text-gray-500 text-sm mb-4">Start by adding your first employee</p>
                        <button
                            onClick={() => navigate("../add-employee")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200"
                        >
                            Add Employee
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageEmployee;