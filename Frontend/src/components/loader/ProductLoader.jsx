import { motion } from "framer-motion";
import logo from "../../assets/upgearlogo.png"

function ProductLoadingState() {
    return (
        <div className="flex flex-col items-center h-screen justify-center w-full min-h-[400px] bg-black">
        
            {/* Logo + Rings */}
            <div className="relative flex items-center justify-center w-56 h-56">

                {/* Outermost slow ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute w-56 h-56 rounded-full"
                    style={{
                        background: "conic-gradient(from 0deg, transparent 70%, rgba(6,182,212,0.6) 100%)",
                    }}
                />

                {/* Middle counter ring */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute w-44 h-44 rounded-full"
                    style={{
                        background: "conic-gradient(from 180deg, transparent 60%, rgba(6,182,212,0.4) 100%)",
                    }}
                />

                {/* Inner pulsing glow ring */}
                <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-32 h-32 rounded-full"
                    style={{
                        boxShadow: "0 0 30px 8px rgba(6,182,212,0.3)",
                        background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
                    }}
                />

                {/* Logo */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{
                        background: "rgba(6,182,212,0.08)",
                        border: "1px solid rgba(6,182,212,0.2)",
                        backdropFilter: "blur(8px)",
                    }}
                >
                    <img
                        src={logo}
                        alt="Upgear Logo"
                        className="w-20 h-20 object-contain"
                    />
                </motion.div>

                {/* Orbiting dot */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute w-56 h-56"
                >
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400"
                        style={{ boxShadow: "0 0 10px 3px rgba(6,182,212,0.8)" }}
                    />
                </motion.div>

                {/* Second orbiting dot (offset) */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute w-44 h-44"
                >
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300"
                        style={{ boxShadow: "0 0 8px 2px rgba(6,182,212,0.6)" }}
                    />
                </motion.div>
            </div>

            {/* Text section */}
            <div className="mt-10 flex flex-col items-center gap-3">

                {/* Brand name */}
                <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs tracking-[0.4em] uppercase text-cyan-500 font-medium"
                >
                    Upgear
                </motion.p>

                <motion.h3
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xl font-bold tracking-[0.15em] uppercase text-white"
                >
                    Loading Products
                </motion.h3>

                {/* Scanning bar */}
                <div className="w-40 h-[1px] bg-gray-800 relative overflow-hidden mt-1">
                    <motion.div
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    />
                </div>

                <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-1">
                    Fetching the latest gear...
                </p>
            </div>
        </div>
    );
};

export default ProductLoadingState;