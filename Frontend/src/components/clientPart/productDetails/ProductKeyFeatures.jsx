import { Check } from "lucide-react";

function ProductKeyFeatures({ features }) {
    if (!features || features.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <h3 className="text-base font-bold text-white">Key Features</h3>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-blue-400" />
                        </span>
                        <span className="text-sm text-gray-300 leading-relaxed">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductKeyFeatures;