function ProductSpecifications({ specifications }) {
    if (!specifications || specifications.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2.5 mb-5">
                <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <h3 className="text-base font-bold text-white">Specifications</h3>
            </div>
            <div className="rounded-xl border border-gray-700/50 overflow-hidden">
                {specifications.map((spec, index) => (
                    <div
                        key={index}
                        className={`grid grid-cols-5 gap-4 px-4 sm:px-6 py-3.5 text-sm transition-colors ${
                            index % 2 === 0 ? "bg-gray-900/40" : "bg-gray-800/30"
                        } hover:bg-gray-700/30`}
                    >
                        <dt className="col-span-2 font-medium text-gray-400 self-center">
                            {spec.specification?.title}
                        </dt>
                        <dd className="col-span-3 text-gray-200 self-center">
                            {spec.value}
                        </dd>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductSpecifications;