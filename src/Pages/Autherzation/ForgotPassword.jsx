import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import "react-toastify/dist/ReactToastify.css";
import { usePost } from "@/Hooks/UsePost";
import { FaHeartbeat, FaEnvelope, FaKey, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const ForgotPassword = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    // Step state: 1 for Forgot Password (Email), 2 for Reset Password (Code/New Password)
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [password_confirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Hooks for API calls
    const { postData: sendForgotPassword, loadingPost: loadingForgot, response: responseForgot } = usePost({
        url: `${apiUrl}/forgot-password`,
        type: true
    });

    const { postData: sendResetPassword, loadingPost: loadingReset, response: responseReset } = usePost({
        url: `${apiUrl}/reset-password`,
        type: true
    });

    // Handle Response for Step 1
    useEffect(() => {
        if (responseForgot && !loadingForgot) {
            if (responseForgot.status === 200 || responseForgot.status === 201) {
                toast.success(responseForgot.data?.message || "Reset code sent to your email!");
                setStep(2);
            }
        }
    }, [responseForgot, loadingForgot]);

    // Handle Response for Step 2
    useEffect(() => {
        if (responseReset && !loadingReset) {
            if (responseReset.status === 200 || responseReset.status === 201) {
                toast.success(responseReset.data?.message || "Password reset successfully!");
                setTimeout(() => navigate("/login"), 2000);
            }
        }
    }, [responseReset, loadingReset, navigate]);

    const handleForgotPassword = (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }
        const payload = { email };
        sendForgotPassword(payload);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (!code || !password || !password_confirmation) {
            toast.error("All fields are required");
            return;
        }
        if (password !== password_confirmation) {
            toast.error("Passwords do not match");
            return;
        }
        const payload = {
            email,
            code,
            password,
            password_confirmation
        };
        sendResetPassword(payload);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="w-full h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-bg-primary/40 to-white bg-cover bg-center relative overflow-hidden py-4">
            {/* Doctor-themed background image */}
            <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/0e/82/d4/0e82d4cbbfd783d3d7245fcb927dd358.jpg')] bg-cover bg-center opacity-40"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-lg w-full p-2"
            >
                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl border border-bg-primary/50 overflow-hidden ring-1 ring-bg-primary/30">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex items-center mb-6">
                            <Link to="/login" className="text-bg-primary hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50">
                                <FaArrowLeft size={18} />
                            </Link>
                        </div>

                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-3xl font-extrabold text-bg-primary tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-bg-primary to-blue-300">
                                {step === 1 ? "Forgot Password?" : "Reset Password"}
                            </h2>
                            <p className="text-gray-500 mt-2 text-base font-medium">
                                {step === 1
                                    ? "Enter your email to receive a reset code"
                                    : (
                                        <span>
                                            Enter the code sent to <span className="text-bg-primary font-bold">{email}</span> and choose a new password
                                        </span>
                                    )}
                            </p>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleForgotPassword}
                                    className="space-y-4"
                                >
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            placeholder="Email Address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-4 pr-12 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                                            disabled={loadingForgot}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bg-primary">
                                            <FaEnvelope />
                                        </span>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full p-6 text-lg bg-gradient-to-r from-bg-primary to-blue-300 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 shadow-lg"
                                        disabled={loadingForgot}
                                    >
                                        {loadingForgot ? "Sending..." : "Send Reset Code"}
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleResetPassword}
                                    className="space-y-4"
                                >
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Enter Verification Code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="w-full p-4 pr-12 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                                            disabled={loadingReset}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bg-primary">
                                            <FaKey />
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="New Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full p-4 pr-12 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                                            disabled={loadingReset}
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute right-12 top-1/2 -translate-y-1/2 text-bg-primary hover:text-blue-700 transition-colors duration-200 focus:outline-none"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bg-primary">
                                            <FaLock />
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Confirm New Password"
                                            value={password_confirmation}
                                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                                            className="w-full p-4 pr-12 border border-bg-primary/50 rounded-xl focus:ring-2 focus:ring-bg-primary focus:border-transparent transition-all duration-300 bg-white/70 placeholder-bg-primary/70"
                                            disabled={loadingReset}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-bg-primary">
                                            <FaHeartbeat />
                                        </span>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full p-6 text-lg bg-gradient-to-r from-bg-primary to-blue-300 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 shadow-lg"
                                        disabled={loadingReset}
                                    >
                                        {loadingReset ? "Resetting..." : "Reset Password"}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full text-center text-bg-primary font-semibold hover:underline mt-2 text-sm"
                                    >
                                        Didn't receive code? Try again
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="text-center mt-8 space-y-2">
                            <p className="text-sm text-gray-500">
                                Remember your password?{" "}
                                <Link
                                    to="/login"
                                    className="text-bg-primary font-semibold hover:underline transition-colors duration-200"
                                >
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <ToastContainer />
        </div>
    );
};

export default ForgotPassword;
