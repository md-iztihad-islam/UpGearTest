import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import logo from "../../assets/upgearlogo.png";
import { useMutation } from "@tanstack/react-query";
import userStore from "@/state/clientPart/userStore";
import signinApi from "@/services/dashboard/authentication/signin";
import { setAuthToken, syncAuthTokenFromCookie } from "@/helpers/dashboard/axiosInstance";

// Validation Schema
const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const { user, setUser } = userStore();

    // Redirect if already logged in as admin
    useEffect(() => {
        const token = localStorage.getItem("signinToken");
        if (token && user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationFn: (credentials) => signinApi(credentials),
        onSuccess: (data) => {
            const token = data?.signinToken || data?.token || syncAuthTokenFromCookie();

            if (token) {
                setAuthToken(token);
            }
            
            // Store user data in Zustand store
            setUser(data.data);
            
            // Show success message
            alert("Login successful! Redirecting to dashboard...");
            
            // Navigate to dashboard
            setTimeout(() => {
                navigate("/dashboard");
            }, 500);
        },
        onError: (error) => {
            console.error("Login error:", error);
            alert(error.response?.data?.message || "Login failed. Please try again.");
        },
    });

    const onSubmit = (data) => {
        mutate(data);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Cyber Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md z-10"
            >
                {/* Branding/Logo Area */}
                <div className="flex justify-center mb-8">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-2xl font-black tracking-tighter text-white flex items-center gap-1"
                    >
                        <img src={logo} alt="UpGear Logo" className="h-8" />
                    </motion.div>
                </div>

                <div className="bg-gray-900/40 border border-gray-800 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Enter your credentials to access your gear
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-400 text-xs uppercase tracking-widest">
                                            Email Address
                                        </FormLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                                            <FormControl>
                                                <Input
                                                    placeholder="pilot@upgear.com"
                                                    className="bg-black/40 border-gray-800 pl-10 h-12 text-white focus:border-cyan-500/50 transition-all"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between items-center">
                                            <FormLabel className="text-gray-400 text-xs uppercase tracking-widest">
                                                Password
                                            </FormLabel>
                                            <Link
                                                to="/forgot-password"
                                                className="text-xs text-cyan-500 hover:underline"
                                            >
                                                Forgot?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="bg-black/40 border-gray-800 pl-10 pr-10 h-12 text-white focus:border-cyan-500/50 transition-all"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-gray-600 hover:text-white transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-12 bg-white text-black hover:bg-cyan-500 hover:text-white font-bold rounded-xl transition-all duration-300 mt-2 group"
                            >
                                {isPending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Authorize Session{" "}
                                        <ChevronRight
                                            size={18}
                                            className="group-hover:translate-x-1 transition-transform"
                                        />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Alternative Actions */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            New to the platform?{" "}
                            <Link
                                to="/register"
                                className="text-white font-semibold hover:text-cyan-500 transition-colors"
                            >
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-8 flex justify-center items-center gap-4 opacity-30 grayscale">
                    <div className="h-[1px] w-12 bg-gray-800" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.4em]">
                        Secure Auth v2.4
                    </span>
                    <div className="h-[1px] w-12 bg-gray-800" />
                </div>
            </motion.div>
        </div>
    );
};

export default Login;