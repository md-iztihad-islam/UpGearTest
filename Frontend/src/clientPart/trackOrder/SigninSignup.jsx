import { setAuthToken } from "@/helpers/dashboard/axiosInstance";
import sendOTPApi from "@/services/clientPart/auth/sendOTPApi";
import signinCustomerApi from "@/services/clientPart/auth/signinCustomerApi";
import signupCustomerApi from "@/services/clientPart/auth/signupCustomerApi";
import userStore from "@/state/clientPart/userStore";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Lock, KeyRound, CheckCircle, AlertCircle, Loader2, LogIn, UserPlus, Send } from "lucide-react";

function SigninSignUp() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const { setUser } = userStore();

    const [customerPhone, setCustomerPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message: '' }

    const showFeedback = (message, type = "success") => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 4000);
    };

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) navigate("/customer/dashboard");
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const formatCountdown = (s) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const normalizePhone = (value) => {
        let v = value.replace(/\s+/g, "");
        if (v.startsWith("+880")) v = "0" + v.slice(4);
        else if (v.startsWith("880")) v = "0" + v.slice(3);
        return v;
    };

    const { mutate: sendOTP, isPending: sendingOTP } = useMutation({
        mutationFn: () => sendOTPApi(customerPhone),
        onSuccess: () => {
            setOtpSent(true);
            setCountdown(300);
            showFeedback("OTP sent to your phone number.", "success");
        },
        onError: (err) => {
            showFeedback(err?.response?.data?.message || "Failed to send OTP. Try again.", "error");
        }
    });

    const { mutate: signup, isPending: signingUp } = useMutation({
        mutationFn: (customerData) => signupCustomerApi(customerData),
        onSuccess: () => {
            showFeedback("Account created! Please sign in.", "success");
            setTimeout(() => {
                setIsSignUp(false);
                setOtp(""); setPassword(""); setConfirmPassword(""); setOtpSent(false); setCountdown(0);
            }, 1500);
        },
        onError: (err) => {
            showFeedback(err?.response?.data?.message || "Sign up failed. Please try again.", "error");
        }
    });

    const { mutate: signin, isPending: signingIn } = useMutation({
        mutationFn: (customerData) => signinCustomerApi(customerData),
        onSuccess: (data) => {
            setUser(data.data);
            setAuthToken(data.token);
            showFeedback("Welcome back!", "success");
            setTimeout(() => navigate("/customer/dashboard"), 1000);
        },
        onError: (err) => {
            showFeedback(err?.response?.data?.message || "Invalid credentials. Please try again.", "error");
        }
    });

    const handleSignIn = (e) => {
        e.preventDefault();
        if (!customerPhone || !password) return showFeedback("Please fill in all fields.", "error");
        signin({ customerPhone, password });
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        if (!customerPhone || !password || !otp) return showFeedback("Please fill in all fields.", "error");
        if (password !== confirmPassword) return showFeedback("Passwords do not match.", "error");
        if (password.length < 8) return showFeedback("Password must be at least 8 characters.", "error");
        signup({ customerPhone, password, otp });
    };

    const toggleForm = () => {
        setIsSignUp(v => !v);
        setFeedback(null);
        setOtp(""); setPassword(""); setConfirmPassword(""); setOtpSent(false); setCountdown(0);
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-lg">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-gray-400 text-base">
                        {isSignUp ? "Sign up to track your orders" : "Sign in to view your orders"}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-gray-900 border border-gray-700 rounded-xl p-1">
                    <button
                        onClick={() => isSignUp && toggleForm()}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${!isSignUp ? "bg-gray-700 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <LogIn className="w-4 h-4" /> Sign In
                    </button>
                    <button
                        onClick={() => !isSignUp && toggleForm()}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isSignUp ? "bg-gray-700 text-white shadow" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <UserPlus className="w-4 h-4" /> Sign Up
                    </button>
                </div>

                {/* Feedback Banner */}
                {feedback && (
                    <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
                        feedback.type === "success"
                            ? "bg-green-900/30 border-green-700"
                            : "bg-red-900/30 border-red-700"
                    }`}>
                        {feedback.type === "success"
                            ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                            : <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        }
                        <p className={feedback.type === "success" ? "text-green-400" : "text-red-400"}>
                            {feedback.message}
                        </p>
                    </div>
                )}

                {/* Sign In Form */}
                {!isSignUp ? (
                    <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
                            <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                                <Phone className="w-5 h-5 text-blue-500" /> Phone Number
                            </label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={e => setCustomerPhone(normalizePhone(e.target.value))}
                                placeholder="017XXXXXXXX"
                                maxLength={11}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
                            <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                                <Lock className="w-5 h-5 text-blue-500" /> Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <div className="flex justify-center pt-2">
                            <button
                                type="submit"
                                disabled={signingIn}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 min-w-[200px] flex items-center justify-center gap-2"
                            >
                                {signingIn
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing In...</>
                                    : <><LogIn className="w-5 h-5" /> Sign In</>
                                }
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Sign Up Form */
                    <form onSubmit={handleSignUp} className="space-y-5">
                        {/* Phone + Send OTP */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
                            <label className="flex items-center gap-3 text-lg font-semibold mb-4">
                                <Phone className="w-5 h-5 text-blue-500" /> Phone Number
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="tel"
                                    value={customerPhone}
                                    onChange={e => setCustomerPhone(normalizePhone(e.target.value))}
                                    placeholder="017XXXXXXXX"
                                    maxLength={11}
                                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => sendOTP()}
                                    disabled={sendingOTP || countdown > 0 || !customerPhone}
                                    className="px-3 py-2 w-[100px] bg-gray-700 border border-gray-600 rounded-lg text-sm font-semibold text-blue-400 hover:bg-gray-600 hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap flex items-center justify-center gap-1"
                                >
                                    {sendingOTP ? "Sending..." : countdown > 0 ? formatCountdown(countdown) : "Send OTP"}
                                </button>
                            </div>
                        </div>

                        {/* OTP Input */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8">
                            <label className="flex items-center gap-3 text-lg font-semibold mb-1">
                                <KeyRound className="w-5 h-5 text-blue-500" /> Enter OTP
                            </label>
                            <p className="text-xs text-gray-500 mb-4">
                                {!otpSent && "Send OTP to your phone first."}
                                {otpSent && countdown > 0 && <>Expires in <span className="text-blue-400 font-mono">{formatCountdown(countdown)}</span></>}
                                {otpSent && countdown === 0 && <span className="text-red-400">OTP expired. Please request a new one.</span>}
                            </p>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                                placeholder="000000"
                                maxLength={6}
                                disabled={!otpSent || countdown === 0}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-center tracking-[0.5em] text-xl font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Password */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 space-y-4">
                            <label className="flex items-center gap-3 text-lg font-semibold">
                                <Lock className="w-5 h-5 text-blue-500" /> Set Password
                            </label>
                            <div>
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Password</p>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Confirm Password</p>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                                        confirmPassword && confirmPassword !== password
                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                            : confirmPassword && confirmPassword === password
                                            ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                                            : "border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                                    }`}
                                />
                                {confirmPassword && confirmPassword !== password && (
                                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                                )}
                                {confirmPassword && confirmPassword === password && (
                                    <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center pt-2">
                            <button
                                type="submit"
                                disabled={signingUp || !otpSent || countdown === 0}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-semibold rounded-xl hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 min-w-[200px] flex items-center justify-center gap-2"
                            >
                                {signingUp
                                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
                                    : <><UserPlus className="w-5 h-5" /> Create Account</>
                                }
                            </button>
                        </div>
                    </form>
                )}

                {/* Footer toggle */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={toggleForm}
                        className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors"
                    >
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default SigninSignUp;