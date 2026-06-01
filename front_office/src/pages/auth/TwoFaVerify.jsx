import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import wallpaper from "../../assets/images/auth_second_wallpaper.png";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";

const TwoFaVerify = () => {
    const navigate = useNavigate();
    const { refreshUser } = useUser();
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);
    const userId = sessionStorage.getItem("2fa_userId");

    useEffect(() => {
        if (!userId) {
            navigate("/signin");
        }
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current is empty
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("");
            setCode(digits);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode = code.join("");

        if (fullCode.length !== 6) {
            toast.error("Please enter all 6 digits", {
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                    boxShadow: '0 0 15px rgba(222, 61, 61, 0.4)',
                }
            });
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Verifying code...", {
            style: {
                background: '#24003E',
                color: '#1CF3CA',
                border: '1px solid rgba(28, 243, 202, 0.3)',
            }
        });

        try {
            const response = await authApi.verify2FA({
                userId: parseInt(userId),
                code: fullCode,
            });

            localStorage.setItem("accessToken", response.accessToken);
            localStorage.setItem("userId", response.userId);
            sessionStorage.removeItem("2fa_userId");

            // Refresh the global user context immediately after login
            refreshUser();

            toast.success("Verification successful!", {
                id: loadingToast,
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                    boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                },
                iconTheme: {
                    primary: '#1CF3CA',
                    secondary: '#24003E',
                },
            });

            // Role-based redirect
            if (response.role === "PLAYER") {
                navigate("/player/dashboard");
            } else if (response.role === "COACH") {
                navigate("/coach/dashboard");
            } else {
                navigate("/player/dashboard");
            }
        } catch (err) {
            toast.error(err.message || "Invalid verification code", {
                id: loadingToast,
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                    boxShadow: '0 0 15px rgba(222, 61, 61, 0.4)',
                },
            });
            // Clear the code inputs on error
            setCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
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

                {/* Icon */}
                <div className="mb-6 p-4 rounded-full bg-[#1CF3CA]/10 border border-[#1CF3CA]/30">
                    <ShieldCheck size={48} className="text-[#1CF3CA]" />
                </div>

                {/* Title & Description */}
                <div className="text-center mb-[42px] space-y-4">
                    <h1 className="text-white text-[24px] font-bold font-['Inter']">
                        Two-Factor Authentication
                    </h1>
                    <p className="text-white/80 text-[14px] font-medium font-['Inter'] max-w-[420px] leading-tight">
                        We've sent a 6-digit verification code to your email. Enter it below to complete your sign in.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-8">
                    {/* 6 Digit Code Inputs */}
                    <div className="flex gap-3" onPaste={handlePaste}>
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-[52px] h-[62px] bg-transparent border-2 border-[#1CF3CA]/50 rounded-2xl text-center text-white text-[24px] font-bold font-['Inter'] focus:outline-none focus:border-[#1CF3CA] focus:shadow-[0_0_15px_rgba(28,243,202,0.3)] transition-all placeholder:text-white/20"
                                placeholder="•"
                            />
                        ))}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full max-w-[412px] h-[47px] rounded-full bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white font-medium text-lg font-['Inter'] hover:opacity-90 transition-opacity transform hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Verify & Sign In"}
                    </button>
                </form>

                {/* Back to Sign In */}
                <p className="mt-12 text-white/70 text-sm font-['Inter']">
                    Didn't receive the code?{" "}
                    <Link
                        to="/signin"
                        className="text-[#1CF3CA] font-medium hover:underline"
                    >
                        Try again
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default TwoFaVerify;
