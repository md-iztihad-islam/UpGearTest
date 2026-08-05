import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import addExpenseApi from "@/services/dashboard/expense/addExpenseApi";

function AddExpense() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        date: new Date(),
        description: "",
        amount: "",
    });
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateSelect = (date) => {
        if (!date) return;
        handleFieldChange("date", date);
        setIsCalendarOpen(false);
    };

    const { mutate: addExpense, isPending: isSaving } = useMutation({
        mutationFn: (payload) => addExpenseApi(payload),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Expense added successfully.", "success");
                navigate(-1);
            } else {
                window.showToast("Failed to add the expense.", "error");
            }
        },
        onError: (error) => {
            console.error("Error adding expense:", error);
            window.showToast("An error occurred while adding the expense.", "error");
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

        addExpense({
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
                        Add Expense
                    </h1>
                    <p className="text-gray-400">Log a new expense</p>
                </div>

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
                            placeholder="e.g. Office supplies for Gulshan branch"
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
                            placeholder="0.00"
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
                                Add Expense
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddExpense;