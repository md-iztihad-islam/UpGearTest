import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import getEmployeeByIdApi from "@/services/dashboard/employee/getEmployeeByIdApi";
import updateEmployeeApi from "@/services/dashboard/employee/updateEmployeeApi";
import deleteEmployeeApi from "@/services/dashboard/employee/deleteEmployeeApi";
import getAllStoresApi from "@/services/dashboard/store/getAllStoresApi";

function EditEmployee() {
    const navigate = useNavigate();
    const { employeeId } = useParams();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [hireDate, setHireDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [storeId, setStoreId] = useState("");
    const [status, setStatus] = useState("");
    const [role, setRole] = useState("");
    // const [orderIndex, setOrderIndex] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const [existingImageURL, setExistingImageURL] = useState("");

    // Fetch employee
    const { data: employeeRes, isLoading: isFetching } = useQuery({
        queryKey: ["employee", employeeId],
        queryFn: () => getEmployeeByIdApi(employeeId),
        enabled: !!employeeId,
    });

    // Fetch stores
    const { data: storesRes } = useQuery({
        queryKey: ["stores"],
        queryFn: getAllStoresApi,
    });
    const allStores = storesRes?.data || [];

    // Populate form
    useEffect(() => {
        const emp = employeeRes?.data;
        if (!emp) return;
        setName(emp.name || "");
        setPhone(emp.phone || "");
        setEmail(emp.email || "");
        setAddress(emp.address || "");
        setHireDate(emp.hireDate ? emp.hireDate.split("T")[0] : "");
        setEndDate(emp.endDate ? emp.endDate.split("T")[0] : "");
        setStoreId(emp.storeId || "");
        setStatus(emp.status || "");
        setRole(emp.role || "");
        setExistingImageURL(emp.imageURL || "");
    }, [employeeRes]);

    const { mutate: updateEmployee, isPending: isUpdating } = useMutation({
        mutationFn: (formData) => updateEmployeeApi(employeeId, formData),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Employee updated successfully.", "success");
                navigate(-1);
            } else {
                window.showToast(data?.message || "Failed to update employee.", "error");
            }
        },
        onError: (error) => {
            window.showToast(error?.response?.data?.message || "An error occurred.", "error");
        },
    });

    const { mutate: deleteEmployee, isPending: isDeleting } = useMutation({
        mutationFn: () => deleteEmployeeApi(employeeId),
        onSuccess: (data) => {
            if (data?.success) {
                window.showToast("Employee deleted successfully.", "success");
                navigate(-1);
            } else {
                window.showToast("Failed to delete employee.", "error");
            }
        },
        onError: () => {
            window.showToast("An error occurred while deleting.", "error");
        },
    });

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("phone", phone);
        formData.append("email", email);
        formData.append("address", address);
        if (password) formData.append("password", password);
        formData.append("hireDate", hireDate);
        if (endDate) formData.append("endDate", endDate);
        formData.append("storeId", storeId);
        formData.append("status", status);
        formData.append("role", role);
        if (imageFile) formData.append("imageURL", imageFile);
        updateEmployee(formData);
    };

    const handleDelete = () => {
        const emp = employeeRes?.data;
        if (window.confirm(`Are you sure you want to delete "${emp?.name}"? This cannot be undone.`)) {
            deleteEmployee();
        }
    };

    const previewImage = imageFile ? URL.createObjectURL(imageFile) : existingImageURL;

    if (isFetching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                    <p className="text-gray-400">Loading employee...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back</span>
                    </button>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Edit Employee
                            </h1>
                            <p className="text-gray-400">Update employee details</p>
                        </div>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 border border-red-600/50 hover:border-red-600 text-red-400 hover:text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Delete Employee
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8 space-y-8">

                    {/* Personal Info */}
                    <Section title="Personal Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputRow label="Full Name" value={name} setValue={setName} required />
                            <InputRow label="Phone" value={phone} setValue={setPhone} required />
                            <InputRow label="Email" type="email" value={email} setValue={setEmail} required />
                            <InputRow label="Address" value={address} setValue={setAddress} />
                        </div>
                    </Section>

                    {/* Profile Image */}
                    <Section title="Profile Image">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-500 text-3xl font-bold">
                                        {name ? name[0].toUpperCase() : "?"}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-300 mb-2 block">
                                    Upload New Photo (optional — leave empty to keep current)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700 transition"
                                />
                                <p className="text-xs text-gray-500 mt-2">JPEG, PNG, WebP up to 15MB</p>
                            </div>
                        </div>
                    </Section>

                    {/* Password */}
                    <Section title="Account Security">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputRow
                                label="New Password"
                                type="password"
                                value={password}
                                setValue={setPassword}
                                placeholder="Leave empty to keep current"
                            />
                        </div>
                    </Section>

                    {/* Employment */}
                    <Section title="Employment Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectRow
                                label="Store"
                                value={storeId}
                                setValue={setStoreId}
                                required
                                options={allStores}
                                idKey="storeId"
                                labelKey="title"
                            />
                            <SelectRow
                                label="Role"
                                value={role}
                                setValue={setRole}
                                required
                                options={[
                                    { value: "Admin", label: "Admin" },
                                    { value: "Accountant", label: "Accountant" },
                                    { value: "SalesAssociate", label: "Sales Associate" },
                                ]}
                                idKey="value"
                                labelKey="label"
                            />
                            <SelectRow
                                label="Status"
                                value={status}
                                setValue={setStatus}
                                required
                                options={[
                                    { value: "active", label: "Active" },
                                    { value: "inactive", label: "Inactive" },
                                    { value: "suspended", label: "Suspended" },
                                ]}
                                idKey="value"
                                labelKey="label"
                            />
                            <InputRow
                                label="Hire Date"
                                type="date"
                                value={hireDate}
                                setValue={setHireDate}
                                required
                            />
                            <InputRow
                                label="End Date (optional)"
                                type="date"
                                value={endDate}
                                setValue={setEndDate}
                            />
                        </div>
                    </Section>

                    {/* Submit */}
                    <div className="flex justify-end pt-6 border-t border-gray-700">
                        <button
                            onClick={handleSubmit}
                            disabled={isUpdating}
                            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditEmployee;

// ── Reusable Components ───────────────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2">{title}</h2>
            {children}
        </div>
    );
}

function InputRow({ label, value, setValue, type = "text", required = false, placeholder }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => setValue(type === "number" ? Number(e.target.value) : e.target.value)}
                required={required}
                placeholder={placeholder}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
        </div>
    );
}

function SelectRow({ label, value, setValue, options = [], idKey = "id", labelKey = "title", required = false }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            >
                <option value="">Select {label}</option>
                {options.map((opt) => (
                    <option key={opt[idKey]} value={opt[idKey]}>
                        {opt[labelKey]}
                    </option>
                ))}
            </select>
        </div>
    );
}