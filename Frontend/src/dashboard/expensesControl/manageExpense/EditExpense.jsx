import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import getExpenseByIdApi from "@/services/dashboard/expense/getExpenseByIdApi";
import updateExpenseApi from "@/services/dashboard/expense/updateExpenseApi";

function EditExpense() {
    const navigate = useNavigate();
    const { expenseId } = useParams();

    const [formData, setFormData] = useState({
        date: null,
        description: "",
        amount: "",
    });
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [hasHydrated, setHasHydrated] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const { data: expenseRes, isLoading, error } = useQuery({
        queryKey: ["expense", expenseId],
        queryFn: () => getExpenseByIdApi(expenseId),
        enabled: !!expenseId,
    });

    useEffect(() => {
        const expense = expenseRes?.data;
        if (!expense || hasHydrated) return;

        setFormData({
            date: new Date(expense.date),
            description: expense.description || "",
            amount: expense.amount?.toString() || "",
        });
        setEmployeeInfo(expense.employee || null);
        setHasHydrated(true);
    }, [expenseRes, hasHydrated]);

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateSelect = (date) => {
        if (!date) return;
        handleFieldChange("date", date);
        setIsCalendarOpen(false);
    };

    const { mutate: updateExpense, isPending: isSaving } = useMutation({
        mutationFn: (payload) => updateExpenseApi(expenseId, payload),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Expense updated successfully.", "success");
                navigate(-1);
            } else {
                window.showToast("Failed to update the expense.", "error");
            }
        },
        onError: (error) => {
            console.error("Error updating expense:", error);
            window.showToast("An error occurred while updating the expense.", "error");
        },
    });

    const handleSubmit = () => {
        if (!formData.date) {
            window.showToast("Date is required.", "error");
            return;
        }
        if (!formData.description.trim()) {
            window.showToast("Description is required.", "error");
            return;
        }
        if (!formData.amount || Number(formData.amount) <= 0) {
            window.showToast("Amount must be a valid positive number.", "error");
            return;
        }

        updateExpense({
            date: formData.date.toISOString(),
            description: formData.description.trim(),
            amount: formData.amount,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Edit Expense
                    </h1>
                    <p className="text-gray-400 font-mono text-sm">{expenseId}</p>
                </div>

                {/* Loading / Error */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-400">Loading expense...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
                        <p className="text-red-400">Error fetching expense: {error.message}</p>
                    </div>
                )}

                {!isLoading && !error && hasHydrated && (
                    <>
                        {employeeInfo && (
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-5 sm:p-6 mb-6">
                                <p className="text-xs text-gray-500 mb-1">Filed by</p>
                                <p className="text-sm text-white font-medium">{employeeInfo.name}</p>
                                <p className="text-xs text-gray-400">
                                    {employeeInfo.email}
                                    {employeeInfo.store?.title ? ` • ${employeeInfo.store.title}` : ""}
                                </p>
                            </div>
                        )}

                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8 space-y-5">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Date</label>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-left focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                        >
                                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                                            <span>{formData.date ? format(formData.date, "PPP") : "Select a date"}</span>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                                        <Calendar
                                            mode="single"
                                            selected={formData.date}
                                            onSelect={handleDateSelect}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleFieldChange("description", e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition resize-y"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Amount (৳)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => handleFieldChange("amount", e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
                                />
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 mt-6 pb-10">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default EditExpense;