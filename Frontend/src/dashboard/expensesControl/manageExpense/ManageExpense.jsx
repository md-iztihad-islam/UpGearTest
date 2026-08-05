import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Search,
    Edit,
    Trash2,
    Loader2,
    Receipt,
    Plus,
    CalendarIcon,
    X,
} from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import getAllExpensesApi from "@/services/dashboard/expense/getAllExpensesApi";
import deleteExpenseApi from "@/services/dashboard/expense/deleteExpenseApi";

const EXPENSES_PER_PAGE = 10;

function ManageExpense() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isFromOpen, setIsFromOpen] = useState(false);
    const [isToOpen, setIsToOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: expensesRes, isLoading, error, refetch } = useQuery({
        queryKey: ["expenses"],
        queryFn: () => getAllExpensesApi(),
    });

    const allExpenses = expensesRes?.data || [];

    const filteredExpenses = useMemo(() => {
        let result = allExpenses;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((expense) =>
                expense.description?.toLowerCase().includes(query) ||
                expense.employee?.name?.toLowerCase().includes(query) ||
                expense.employee?.email?.toLowerCase().includes(query) ||
                expense.employee?.store?.title?.toLowerCase().includes(query)
            );
        }

        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            result = result.filter((expense) => new Date(expense.date) >= from);
        }

        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            result = result.filter((expense) => new Date(expense.date) <= to);
        }

        return result;
    }, [allExpenses, searchQuery, fromDate, toDate]);

    const totalAmount = useMemo(
        () => filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0),
        [filteredExpenses]
    );

    const totalPages = Math.ceil(filteredExpenses.length / EXPENSES_PER_PAGE);
    const startIndex = (currentPage - 1) * EXPENSES_PER_PAGE;
    const currentExpenses = filteredExpenses.slice(startIndex, startIndex + EXPENSES_PER_PAGE);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleClearDateFilters = () => {
        setFromDate(null);
        setToDate(null);
        setCurrentPage(1);
    };

    const { mutate: deleteExpense, isPending: isDeleting } = useMutation({
        mutationFn: (expenseId) => deleteExpenseApi(expenseId),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Expense deleted successfully.", "success");
                refetch();
            } else {
                window.showToast("Failed to delete the expense.", "error");
            }
        },
        onError: (error) => {
            console.error("Error deleting expense:", error);
            window.showToast("An error occurred while deleting the expense.", "error");
        },
    });

    const handleDelete = (expense) => {
        if (
            window.confirm(
                `Are you sure you want to delete this expense ("${expense.description}")? This action cannot be undone.`
            )
        ) {
            deleteExpense(expense.expenseId);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const formatAmount = (amount) =>
        Number(amount || 0).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
                                Manage Expenses
                            </h1>
                            <p className="text-gray-400">Track and manage employee expenses</p>
                        </div>
                        <button
                            onClick={() => navigate("../add-expense")}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Expense</span>
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-5 sm:p-6">
                        <p className="text-gray-400 text-sm mb-1">Total Expenses</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{filteredExpenses.length}</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-5 sm:p-6">
                        <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                        <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ৳{formatAmount(totalAmount)}
                        </p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8 mb-8">
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search by description, employee, or store..."
                                className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-600 transition-colors"
                                    >
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        {fromDate ? format(fromDate, "PP") : "From date"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                                    <Calendar
                                        mode="single"
                                        selected={fromDate}
                                        onSelect={(date) => {
                                            setFromDate(date || null);
                                            setCurrentPage(1);
                                            setIsFromOpen(false);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <Popover open={isToOpen} onOpenChange={setIsToOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-600 transition-colors"
                                    >
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        {toDate ? format(toDate, "PP") : "To date"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                                    <Calendar
                                        mode="single"
                                        selected={toDate}
                                        onSelect={(date) => {
                                            setToDate(date || null);
                                            setCurrentPage(1);
                                            setIsToOpen(false);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            {(fromDate || toDate) && (
                                <button
                                    type="button"
                                    onClick={handleClearDateFilters}
                                    className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Clear dates
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400">Loading expenses...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
                        <p className="text-red-400">Error fetching expenses: {error.message}</p>
                    </div>
                )}

                {/* Expenses List */}
                {!isLoading && !error && currentExpenses.length > 0 && (
                    <>
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden mb-6">

                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-700/50 border-b border-gray-600">
                                        <tr>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-300">Date</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-300">Description</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-300">Employee</th>
                                            <th className="p-4 text-left text-sm font-semibold text-gray-300">Store</th>
                                            <th className="p-4 text-right text-sm font-semibold text-gray-300">Amount</th>
                                            <th className="p-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentExpenses.map((expense) => (
                                            <tr
                                                key={expense.expenseId}
                                                className="border-b border-gray-700 hover:bg-gray-700/30 transition"
                                            >
                                                <td className="p-4 text-sm text-gray-300 whitespace-nowrap">
                                                    {format(new Date(expense.date), "PP")}
                                                </td>
                                                <td className="p-4 text-sm text-gray-300 max-w-xs">
                                                    <p className="line-clamp-2">{expense.description}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm text-white">{expense.employee?.name || "—"}</p>
                                                    <p className="text-xs text-gray-500">{expense.employee?.email}</p>
                                                </td>
                                                <td className="p-4 text-sm text-gray-300">
                                                    {expense.employee?.store?.title || "—"}
                                                </td>
                                                <td className="p-4 text-right text-sm font-medium text-white whitespace-nowrap">
                                                    ৳{formatAmount(expense.amount)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`edit-expense/${expense.expenseId}`)}
                                                            className="flex items-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors text-sm"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(expense)}
                                                            disabled={isDeleting}
                                                            className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                                                        >
                                                            {isDeleting ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
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
                                {currentExpenses.map((expense) => (
                                    <div
                                        key={expense.expenseId}
                                        className="p-6 border-b border-gray-700 last:border-b-0"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {format(new Date(expense.date), "PP")}
                                                </p>
                                                <p className="text-sm text-white font-medium">{expense.description}</p>
                                            </div>
                                            <p className="text-lg font-semibold text-white whitespace-nowrap">
                                                ৳{formatAmount(expense.amount)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                                            <span>{expense.employee?.name || "—"}</span>
                                            {expense.employee?.store?.title && (
                                                <>
                                                    <span className="text-gray-600">•</span>
                                                    <span>{expense.employee.store.title}</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => navigate(`edit-expense/${expense.expenseId}`)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense)}
                                                disabled={isDeleting}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 flex-wrap">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                <div className="flex gap-2">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                        currentPage === page
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <span key={page} className="px-2 text-gray-500">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* No Results */}
                {!isLoading && !error && filteredExpenses.length === 0 && allExpenses.length > 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-lg">No expenses match your filters</p>
                        <p className="text-gray-500 text-sm mt-2">Try a different search term or date range</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && allExpenses.length === 0 && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Receipt className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-gray-300 text-lg mb-2">No expenses yet</p>
                        <p className="text-gray-500 text-sm mb-4">Start by logging your first expense</p>
                        <button
                            onClick={() => navigate("../add-expense")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200"
                        >
                            Add Expense
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageExpense;