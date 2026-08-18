import React from "react";
import { motion } from "framer-motion";

function SubCategories() {
    // Replace these placeholder URLs with your actual transparent PNG assets
    const categories = [
        {
            id: 1,
            title: "Mouse",
            imageURL: "https://cdn-icons-png.flaticon.com/512/3144/3144186.png", 
        },
        {
            id: 2,
            title: "Keyboard",
            imageURL: "https://cdn-icons-png.flaticon.com/512/3388/3388701.png", 
        },
        {
            id: 3,
            title: "Controller",
            imageURL: "https://cdn-icons-png.flaticon.com/512/8340/8340058.png", 
        },
        {
            id: 4,
            title: "Mousepad",
            imageURL: "https://cdn-icons-png.flaticon.com/512/10565/10565551.png", 
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        // The 'hidden md:block' classes ensure this section only appears on tablets and up (>=768px)
        <section className="hidden md:block py-16 lg:py-24 bg-[#09090B] overflow-hidden">
            <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-3">
                        Get what you want!
                    </h2>
                    <p className="text-[#A1A1AA] text-lg">
                        Browse by Category
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
                    {categories.map((category) => (
                        <motion.div 
                            key={category.id} 
                            variants={itemVariants}
                            className="relative group cursor-pointer"
                        >
                            <div className="h-[200px] w-full bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl overflow-hidden transition-colors hover:border-gray-500">
                                
                                {/* Category Title */}
                                <h3 className="absolute top-5 left-5 text-white font-medium text-lg z-10">
                                    {category.title}
                                </h3>

                                {/* Category Image - Positioned bottom right */}
                                {/* The scale and translate classes help replicate the cropped look from the design */}
                                <div className="absolute -bottom-6 -right-6 w-3/4 h-3/4 transition-transform duration-300 group-hover:scale-110">
                                    <img 
                                        src={category.imageURL} 
                                        alt={category.title}
                                        className="w-full h-full object-contain opacity-90 drop-shadow-2xl"
                                    />
                                </div>
                                
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}

export default SubCategories;