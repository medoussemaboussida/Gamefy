import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import wallpaper from "../../assets/images/Auth_second_wallpaper.png";
import logo from "../../assets/images/auth_logo.png";

const ResetPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden font-sans">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${wallpaper})` }}
            ></div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[550px] px-6 py-12 flex flex-col items-center">
                {/* Logo */}
                <div className="mb-[69px]">
                    <img src={logo} alt="Gamefy" className="h-12 md:h-20 w-auto" />
                </div>

                {/* Title & Description */}
                <div className="text-center mb-[42px] space-y-4">
                    <h1 className="text-white text-[24px] font-bold font-['Inter']">
                        Set A New Password
                    </h1>
                    <p className="text-white/80 text-[14px] font-medium font-['Inter'] max-w-[420px] leading-tight">
                        Your previous password has been reset. Please set a new password for your account.
                    </p>
                </div>

                {/* Form */}
                <form className="w-full flex flex-col items-center space-y-6">
                    {/* Password Field */}
                    <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
                        <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
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
                                type={showConfirmPassword ? "text" : "password"}
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
                        className="w-full max-w-[412px] h-[47px] rounded-full bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white font-medium text-lg font-['Inter'] hover:opacity-90 transition-opacity transform hover:shadow-lg active:scale-[0.98] mt-[33px]"
                    >
                        set a password
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
