function ProductSpecifications({ specifications }) {
    if (!specifications || specifications.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-base font-bold text-white mb-5">Specifications</h3>
            <dl className="rounded-xl border border-[#2a2a2a] overflow-hidden divide-y divide-[#2a2a2a]">
                {specifications.map((spec, index) => (
                    <div
                        key={index}
                        className={`grid grid-cols-5 gap-4 px-4 sm:px-6 py-3.5 text-sm transition-colors ${
                            index % 2 === 0 ? "bg-[#0f0f0f]" : "bg-[#141414]"
                        } hover:bg-[#1f1f1f]`}
                    >
                        <dt className="col-span-2 font-medium text-gray-500 self-center">
                            {spec.specification?.title}
                        </dt>
                        <dd className="col-span-3 text-gray-200 self-center">
                            {spec.value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

export default ProductSpecifications;