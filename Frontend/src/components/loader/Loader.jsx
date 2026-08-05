import { motion } from "framer-motion";
import logo from "../../assets/upgearlogo.png";

const UpGearLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black">
            <div className="relative flex flex-col items-center">
                
                {/* Animated Logo Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                        opacity: [0.4, 1, 0.4],
                        scale: [0.98, 1, 0.98],
                        filter: [
                        "drop-shadow(0 0 0px #00f2ff)",
                        "drop-shadow(0 0 15px #00f2ff)",
                        "drop-shadow(0 0 0px #00f2ff)"
                        ]
                    }}
                    transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                    className="relative mb-8"
                >
                    <img 
                        src= {logo}
                        alt="UPGEAR" 
                        className="h-20 md:h-28 w-auto object-contain"
                    />
                
                    {/* Glitch Overlay Effect */}
                    <motion.div 
                        className="absolute inset-0 bg-cyan-500/10 mix-blend-overlay"
                        animate={{ 
                            clipPath: [
                                "inset(80% 0 0 0)", 
                                "inset(10% 0 70% 0)", 
                                "inset(50% 0 30% 0)", 
                                "inset(80% 0 0 0)"
                            ] 
                        }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
                    />
                </motion.div>

                {/* Futuristic Progress Bar */}
                <div className="w-64 h-[2px] bg-gray-800 rounded-full overflow-hidden relative">
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            ease: "linear" 
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#00f2ff]"
                    />
                </div>

                {/* Subtext */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-[10px] uppercase tracking-[0.3em] text-cyan-500/60 font-mono"
                >
                    System Initializing...
                </motion.p>
            </div>

            {/* Background Decorative Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
    );
};

export default UpGearLoader;