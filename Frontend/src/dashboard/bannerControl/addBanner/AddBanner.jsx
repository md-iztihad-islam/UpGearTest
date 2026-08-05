import addBannerApi from "@/services/dashboard/banner/addBannerApi";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
    Image,
    Link as LinkIcon,
    Type,
    Upload,
    CheckCircle,
    AlertCircle,
    Loader2,
    AlignLeft,
    MousePointer,
    Hash,
    Calendar,
    ToggleLeft,
    X,
    Monitor,
} from "lucide-react";

const STATUS_OPTIONS = ["active", "inactive"];
const DISPLAY_TYPE_OPTIONS = ["desktop", "mobile", "tablet"];

function FieldCard({ icon: Icon, label, children, error }) {
    return (
        <div
            className={`rounded-2xl border p-6 sm:p-8 transition-all duration-200 ${
                error
                    ? "border-red-600 bg-red-950/20"
                    : "border-gray-800 bg-gray-900/60"
            }`}
        >
            <label className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-widest text-gray-400 mb-5">
                <Icon className="w-4 h-4 text-blue-500" />
                {label}
            </label>
            {children}
            {error && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-red-400">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}

function InputField({ value, onChange, type = "text", placeholder, className = "", ...rest }) {
    return (
        <input
            value={value}
            onChange={onChange}
            type={type}
            placeholder={placeholder}
            className={`w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm ${className}`}
            {...rest}
        />
    );
}

function validate(fields) {
    const errors = {};

    if (!fields.title.trim()) {
        errors.title = "Title is required.";
    } else if (fields.title.trim().length < 3) {
        errors.title = "Title must be at least 3 characters.";
    } else if (fields.title.trim().length > 120) {
        errors.title = "Title must be 120 characters or fewer.";
    }

    if (fields.subTitle && fields.subTitle.length > 200) {
        errors.subTitle = "Subtitle must be 200 characters or fewer.";
    }

    if (fields.link && !/^https?:\/\/.+/.test(fields.link)) {
        errors.link = "Must be a valid URL starting with http:// or https://.";
    }

    if (fields.buttonText && fields.buttonText.length > 40) {
        errors.buttonText = "Button text must be 40 characters or fewer.";
    }

    if (!fields.imageURL) {
        errors.imageURL = "An image is required.";
    }

    if (!fields.status) {
        errors.status = "Status is required.";
    }

    if (fields.orderIndex === "" || isNaN(Number(fields.orderIndex)) || Number(fields.orderIndex) < 0) {
        errors.orderIndex = "Order index must be a non-negative number.";
    }

    if (!fields.displayType) {
        errors.displayType = "Display type is required.";
    }

    if (fields.startAt && fields.endAt) {
        if (new Date(fields.endAt) <= new Date(fields.startAt)) {
            errors.endAt = "End date must be after the start date.";
        }
    }

    return errors;
}

function AddBanner() {
    const [title, setTitle] = useState("");
    const [subTitle, setSubTitle] = useState("");
    const [link, setLink] = useState("");
    const [buttonText, setButtonText] = useState("");
    const [imageURL, setImageURL] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [status, setStatus] = useState("active");
    const [orderIndex, setOrderIndex] = useState("0");
    const [displayType, setDisplayType] = useState("desktop");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const fileInputRef = useRef(null);

    const fields = {
        title, subTitle, link, buttonText, imageURL,
        status, orderIndex, displayType, startAt, endAt,
    };

    const { mutate, isPending, isSuccess, isError, reset } = useMutation({
        mutationFn: (newBanner) => addBannerApi(newBanner),
        onSuccess: () => {
            setTitle("");
            setSubTitle("");
            setLink("");
            setButtonText("");
            setImageURL(null);
            setImagePreview(null);
            setStatus("active");
            setOrderIndex("0");
            setDisplayType("desktop");
            setStartAt("");
            setEndAt("");
            setErrors({});
            setTouched({});
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
    });

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const errs = validate({ ...fields, [field]: fields[field] });
        setErrors((prev) => ({ ...prev, [field]: errs[field] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        reset();
        const allTouched = Object.fromEntries(Object.keys(fields).map((k) => [k, true]));
        setTouched(allTouched);

        const errs = validate(fields);
        setErrors(errs);

        if (Object.keys(errs).length > 0) return;

        const formData = new FormData();
        formData.append("title", title.trim());
        if (subTitle.trim()) formData.append("subTitle", subTitle.trim());
        if (link.trim()) formData.append("link", link.trim());
        if (buttonText.trim()) formData.append("buttonText", buttonText.trim());
        formData.append("imageURL", imageURL);
        formData.append("status", status);
        formData.append("orderIndex", String(Number(orderIndex)));
        formData.append("displayType", displayType);
        if (startAt) formData.append("startAt", new Date(startAt + "T00:00:00.000Z").toISOString());
        if (endAt) formData.append("endAt", new Date(endAt + "T00:00:00.000Z").toISOString());

        mutate(formData);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            setErrors((prev) => ({ ...prev, imageURL: "Only JPG, PNG, WebP, or GIF images are allowed." }));
            setTouched((prev) => ({ ...prev, imageURL: true }));
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrors((prev) => ({ ...prev, imageURL: "Image must be under 10 MB." }));
            setTouched((prev) => ({ ...prev, imageURL: true }));
            return;
        }

        setImageURL(file);
        setErrors((prev) => ({ ...prev, imageURL: undefined }));
        setTouched((prev) => ({ ...prev, imageURL: true }));

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setImageURL(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const fieldError = (name) => (touched[name] ? errors[name] : undefined);

    const DISPLAY_TYPE_ICONS = {
        desktop: "🖥️",
        mobile: "📱",
        tablet: "📟",
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

                {/* Header */}
                <div className="mb-10 border-b border-gray-800 pb-8">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-3">
                        Dashboard / Banners
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                        Add Banner
                    </h1>
                    <p className="mt-2 text-gray-500 text-sm">
                        Fill in the details below to publish a new banner. Fields marked with{" "}
                        <span className="text-red-400">*</span> are required.
                    </p>
                </div>

                {/* Global feedback */}
                {isSuccess && (
                    <div className="mb-6 p-4 bg-green-950/40 border border-green-800 rounded-xl flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-green-400 font-medium text-sm">Banner published</p>
                            <p className="text-green-600 text-xs mt-0.5">The banner is now live and visible on your website.</p>
                        </div>
                    </div>
                )}
                {isError && (
                    <div className="mb-6 p-4 bg-red-950/40 border border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-400 font-medium text-sm">Something went wrong</p>
                            <p className="text-red-600 text-xs mt-0.5">The banner could not be saved. Check your connection and try again.</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                    {/* Title */}
                    <FieldCard icon={Type} label="Title *" error={fieldError("title")}>
                        <InputField
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => handleBlur("title")}
                            placeholder="e.g. Summer Sale — Up to 50% Off"
                            maxLength={120}
                        />
                        <p className="mt-1.5 text-xs text-gray-600 text-right">{title.length}/120</p>
                    </FieldCard>

                    {/* Subtitle */}
                    <FieldCard icon={AlignLeft} label="Subtitle" error={fieldError("subTitle")}>
                        <InputField
                            value={subTitle}
                            onChange={(e) => setSubTitle(e.target.value)}
                            onBlur={() => handleBlur("subTitle")}
                            placeholder="A short supporting line (optional)"
                            maxLength={200}
                        />
                        <p className="mt-1.5 text-xs text-gray-600 text-right">{subTitle.length}/200</p>
                    </FieldCard>

                    {/* Image Upload */}
                    <FieldCard icon={Image} label="Banner Image *" error={fieldError("imageURL")}>
                        {!imagePreview ? (
                            <label
                                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                                    fieldError("imageURL")
                                        ? "border-red-700 hover:border-red-500"
                                        : "border-gray-700 hover:border-blue-600 hover:bg-gray-800/40"
                                }`}
                            >
                                <Upload className="w-7 h-7 text-gray-500 mb-2" />
                                <span className="text-sm text-gray-400">Click to upload</span>
                                <span className="text-xs text-gray-600 mt-1">JPG, PNG, WebP, GIF — max 10 MB</span>
                                <input
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                />
                            </label>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-gray-700 group">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                                    <label className="flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                        <Upload className="w-3.5 h-3.5" />
                                        Replace
                                        <input
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif"
                                            className="hidden"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Remove
                                    </button>
                                </div>
                                <div className="absolute top-2.5 left-2.5 bg-green-600/90 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    {imageURL?.name}
                                </div>
                            </div>
                        )}
                    </FieldCard>

                    {/* Link */}
                    <FieldCard icon={LinkIcon} label="Link URL" error={fieldError("link")}>
                        <InputField
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            onBlur={() => handleBlur("link")}
                            type="url"
                            placeholder="https://example.com/sale"
                        />
                    </FieldCard>

                    {/* Button Text */}
                    <FieldCard icon={MousePointer} label="Button Text" error={fieldError("buttonText")}>
                        <InputField
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            onBlur={() => handleBlur("buttonText")}
                            placeholder="e.g. Shop Now"
                            maxLength={40}
                        />
                        <p className="mt-1.5 text-xs text-gray-600 text-right">{buttonText.length}/40</p>
                    </FieldCard>

                    {/* Status & Order — 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FieldCard icon={ToggleLeft} label="Status *" error={fieldError("status")}>
                            <div className="flex gap-2 flex-wrap">
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => { setStatus(s); handleBlur("status"); }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                            status === s
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </FieldCard>

                        <FieldCard icon={Hash} label="Order Index *" error={fieldError("orderIndex")}>
                            <InputField
                                value={orderIndex}
                                onChange={(e) => setOrderIndex(e.target.value)}
                                onBlur={() => handleBlur("orderIndex")}
                                type="number"
                                min="0"
                                placeholder="0"
                            />
                            <p className="mt-1.5 text-xs text-gray-600">Lower numbers appear first.</p>
                        </FieldCard>
                    </div>

                    {/* Display Type */}
                    <FieldCard icon={Monitor} label="Display Type *" error={fieldError("displayType")}>
                        <div className="flex gap-3 flex-wrap">
                            {DISPLAY_TYPE_OPTIONS.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => { setDisplayType(type); handleBlur("displayType"); }}
                                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium capitalize transition-all border ${
                                        displayType === type
                                            ? "bg-blue-600 border-blue-500 text-white"
                                            : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white hover:border-gray-600"
                                    }`}
                                >
                                    <span className="text-base leading-none">{DISPLAY_TYPE_ICONS[type]}</span>
                                    {type}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                            Controls which device breakpoint this banner is shown on.
                        </p>
                    </FieldCard>

                    {/* Scheduling — 2 columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FieldCard icon={Calendar} label="Start Date" error={fieldError("startAt")}>
                            <InputField
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                                onBlur={() => handleBlur("startAt")}
                                type="date"
                                className="[color-scheme:dark]"
                            />
                        </FieldCard>

                        <FieldCard icon={Calendar} label="End Date" error={fieldError("endAt")}>
                            <InputField
                                value={endAt}
                                onChange={(e) => setEndAt(e.target.value)}
                                onBlur={() => handleBlur("endAt")}
                                type="date"
                                min={startAt || undefined}
                                className="[color-scheme:dark]"
                            />
                        </FieldCard>
                    </div>

                    {/* Validation summary */}
                    {Object.keys(errors).some((k) => touched[k] && errors[k]) && (
                        <div className="p-4 bg-red-950/30 border border-red-900 rounded-xl">
                            <p className="text-red-400 text-sm font-medium mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Please fix the following before submitting:
                            </p>
                            <ul className="space-y-1">
                                {Object.entries(errors).map(([key, msg]) =>
                                    touched[key] && msg ? (
                                        <li key={key} className="text-red-500 text-xs pl-2 border-l border-red-800">
                                            {msg}
                                        </li>
                                    ) : null
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-w-[160px] justify-center"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Publishing…
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Publish Banner
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddBanner;