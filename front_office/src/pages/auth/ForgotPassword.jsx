import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import wallpaper from "../../assets/images/Auth_second_wallpaper.png";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your email", {
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                    boxShadow: '0 0 15px rgba(222, 61, 61, 0.4)',
                },
            });
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Sending recovery email...", {
            style: {
                background: '#24003E',
                color: '#1CF3CA',
                border: '1px solid rgba(28, 243, 202, 0.3)',
            }
        });

        try {
            await authApi.forgotPassword({ email, clientUrl: window.location.origin });
            toast.success("Recovery link sent! Check your email", {
                id: loadingToast,
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                    boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                },
            });
            // Optimization: Maybe clear email field
            setEmail("");
        } catch (err) {
            toast.error(err.message || "Failed to send recovery email", {
                id: loadingToast,
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                    boxShadow: '0 0 15px rgba(222, 61, 61, 0.4)',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden font-sans">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${wallpaper})` }}
            ></div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[550px] px-6 py-12 flex flex-col items-center">
                {/* Title & Description */}
                <div className="text-center mb-[42px] space-y-4">
                    <h1 className="text-white text-[24px] font-bold font-['Inter']">
                        Forgot Password ?
                    </h1>
                    <p className="text-white/80 text-[14px] font-medium font-['Inter'] max-w-[420px] leading-tight">
                        Don't worry , it happens for all of us. enter your email below to recover your password
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                    {/* Email Field */}
                    <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
                        <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Example@gmail.com"
                            className="w-full h-[47px] bg-transparent border border-[#1CF3CA] rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full max-w-[412px] h-[47px] rounded-full bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white font-medium text-lg font-['Inter'] hover:opacity-90 transition-opacity transform hover:shadow-lg active:scale-[0.98] mt-[33px] flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Send verification code"}
                    </button>
                </form>

                {/* Back to Sign In */}
                <p className="mt-12 text-white/70 text-sm font-['Inter']">
                    Remember your password ?{" "}
                    <Link
                        to="/signin"
                        className="text-[#1CF3CA] font-medium hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
