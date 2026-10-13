import { useEffect, useMemo } from "react";
import { ImagePlus, X } from "lucide-react";

// Picks one image and previews it cropped to a square, the way the home page
// sub-category slider shows it.
//   existingUrl — image already saved (edit forms)
//   file        — newly chosen File, or null
//   onFileChange(file|null), onRemoveExisting()
function SquareImagePicker({ label = "Image", hint, existingUrl, file, onFileChange, onRemoveExisting }) {
    const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

    useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

    const shownUrl = previewUrl || existingUrl;

    const handleChange = (e) => {
        const chosen = e.target.files?.[0];
        e.target.value = "";
        if (chosen) onFileChange(chosen);
    };

    const handleRemove = () => {
        if (file) onFileChange(null);
        else onRemoveExisting?.();
    };

    return (
        <div className="space-y-3">
            <p className="text-lg font-semibold text-white">{label}</p>
            <div className="flex items-start gap-5">
                {shownUrl ? (
                    <div className="relative w-36 h-36 shrink-0 rounded-none rounded-tr-2xl rounded-bl-2xl overflow-hidden border-2 border-[#333333] bg-[#0a0a0a]">
                        <img src={shownUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={handleRemove}
                            aria-label="Remove image"
                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                        {file && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-green-600/90 rounded text-[10px] font-medium">
                                New
                            </span>
                        )}
                    </div>
                ) : (
                    <label className="w-36 h-36 shrink-0 flex flex-col items-center justify-center rounded-none rounded-tr-2xl rounded-bl-2xl border-2 border-dashed border-gray-600 cursor-pointer hover:border-blue-500 hover:bg-blue-600/5 transition">
                        <ImagePlus className="w-6 h-6 text-gray-500 mb-2" />
                        <span className="text-xs text-gray-500">Upload image</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="hidden" />
                    </label>
                )}

                <div className="text-sm text-gray-500 space-y-2 pt-1">
                    {hint && <p>{hint}</p>}
                    {shownUrl && (
                        <label className="inline-block px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 cursor-pointer transition-colors">
                            Replace
                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleChange} className="hidden" />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SquareImagePicker;
