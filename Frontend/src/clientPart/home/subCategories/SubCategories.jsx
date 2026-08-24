import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mouse, Keyboard, Gamepad2, Grip, ArrowUpRight } from "lucide-react";

// slug is used to link into /products/sub-category/:subcategorySlug — update to match
// your real SubCategory slugs from the backend once this is wired to live data.
const categories = [
    { id: 1, title: "Mouse", slug: "mouse", icon: Mouse },
    { id: 2, title: "Keyboard", slug: "keyboard", icon: Keyboard },
    { id: 3, title: "Controller", slug: "controllers", icon: Gamepad2 },
    { id: 4, title: "Mousepad", slug: "mousepad", icon: Grip },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: "easeOut" },
    },
};

function SubCategories() {
    return (
        // Hidden on phone — this section is tablet and up only
        <section className="hidden md:block bg-black py-16 lg:py-24">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">
                        Get what you want!
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Browse by category
                    </p>
                </motion.div>

                {/* Category Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-4 gap-4 lg:gap-6"
                >
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <motion.div key={category.id} variants={itemVariants}>
                                <Link
                                    to={`/products/sub-category/${category.slug}`}
                                    className="group relative flex flex-col justify-between h-[200px] w-full p-6 bg-black border-2 border-[#333333] rounded-none rounded-tr-2xl rounded-bl-2xl overflow-hidden transition-colors duration-300 hover:border-[#555555]"
                                >
                                    {/* Subtle ambient glow on hover */}
                                    <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/[0.03] blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

                                    {/* Top row — title + arrow */}
                                    <div className="relative flex items-start justify-between">
                                        <h3 className="text-white font-semibold text-lg tracking-tight">
                                            {category.title}
                                        </h3>
                                        <ArrowUpRight className="w-4 h-4 text-gray-600 transition-all duration-300 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </div>

                                    {/* Icon badge */}
                                    <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-[#111111] border border-[#2a2a2a] transition-transform duration-300 group-hover:scale-105 group-hover:border-[#444444]">
                                        <Icon className="w-7 h-7 text-gray-300 transition-colors duration-300 group-hover:text-white" strokeWidth={1.5} />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>

            </div>
        </section>
    );
}

export default SubCategories;