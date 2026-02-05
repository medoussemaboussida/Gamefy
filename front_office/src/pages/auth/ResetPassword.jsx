import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import wallpaper from "../../assets/images/Auth_second_wallpaper.png";
import logo from "../../assets/images/auth_logo.png";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid or missing reset token", {
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

        if (!formData.password || !formData.confirmPassword) {
            toast.error("Please fill in both password fields", {
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

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match", {
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
        const loadingToast = toast.loading("Updating your password...", {
            style: {
                background: '#24003E',
                color: '#1CF3CA',
                border: '1px solid rgba(28, 243, 202, 0.3)',
            }
        });

        try {
            await authApi.resetPassword(token, formData.password);
            toast.success("Password reset successful! You can now sign in.", {
                id: loadingToast,
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                    boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                },
            });
            navigate("/signin");
        } catch (err) {
            toast.error(err.message || "Failed to reset password", {
                id: loadingToast,
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                    boxShadow: '0 0 15px rgba(222, 61, 61, 0.4)',
                }
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
                        Set a new password
                    </h1>
                    <p className="text-white/80 text-[14px] font-medium font-['Inter'] max-w-[420px] leading-tight">
                        Your previous password has been reset. Please set a new password for your account.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-6">
                    {/* Password Field */}
                    <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
                        <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Your new password"
                                className="w-full h-[47px] bg-transparent border border-[#1CF3CA] rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1CF3CA]/70 hover:text-[#1CF3CA]"
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
                        <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">confirm password</label>
                        <div className="relative">
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                className="w-full h-[47px] bg-transparent border border-[#1CF3CA] rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1CF3CA]/70 hover:text-[#1CF3CA]"
                            >
                                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full max-w-[412px] h-[47px] rounded-full bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white font-medium text-lg font-['Inter'] hover:opacity-90 transition-opacity transform hover:shadow-lg active:scale-[0.98] mt-[33px] flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : "set a password"}
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

export default ResetPassword;
