import { Check } from "lucide-react";

function ProductKeyFeatures({ features }) {
    if (!features || features.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-base font-bold text-white mb-4">Key Features</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                        </span>
                        <span className="text-sm text-gray-300 leading-relaxed">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductKeyFeatures;