import React from "react";
import { motion } from "framer-motion";
import { PackageCheck, AlarmClockCheck, MessageCircleHeart, ChevronRight } from "lucide-react";

function TrustFeatures() {
    const features = [
        {
            id: 1,
            icon: <PackageCheck strokeWidth={1.5} className="w-10 h-10 text-white mb-6" />,
            title: "100% Authentic",
            description: "Products here are original, handpicked by us. Rest assured."
        },
        {
            id: 2,
            icon: <AlarmClockCheck strokeWidth={1.5} className="w-10 h-10 text-white mb-6" />,
            title: "1 Year Warranty",
            description: "No catch here. You get a 1 year warranty on the store."
        },
        {
            id: 3,
            icon: <MessageCircleHeart strokeWidth={1.5} className="w-10 h-10 text-white mb-6" />,
            title: "After Sale Service",
            description: "We aren't going to ghost you. Just message us with your problems."
        }
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
        <section className="py-16 lg:py-24 bg-[#09090B] overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 sm:mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">
                        Can’t think of a reason to trust us?
                    </h2>
                    <p className="text-[#A1A1AA] text-lg sm:text-xl">
                        Look through what we do for you
                    </p>
                </motion.div>

                {/* Feature Cards Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    {features.map((feature) => (
                        <motion.div 
                            key={feature.id} 
                            variants={itemVariants}
                            className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-8 transition-colors hover:border-gray-500 flex flex-col"
                        >
                            {feature.icon}
                            <h3 className="text-white font-medium text-lg mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-[#A1A1AA] text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Learn More Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex justify-center"
                >
                    <a 
                        href="#learn-more" 
                        className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-gray-300 transition-colors group"
                    >
                        Learn more 
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </motion.div>

            </div>
        </section>
    );
}

export default TrustFeatures;