import React from "react";
import { Link } from "react-router-dom";
import wallpaper from "../../assets/images/Auth_second_wallpaper.png";

const ForgotPassword = () => {
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
                <form className="w-full flex flex-col items-center">
                    {/* Email Field */}
                    <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
                        <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Example@gmail.com"
                            className="w-full h-[47px] bg-transparent border border-[#1CF3CA] rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full max-w-[412px] h-[47px] rounded-full bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white font-medium text-lg font-['Inter'] hover:opacity-90 transition-opacity transform hover:shadow-lg active:scale-[0.98] mt-[33px]"
                    >
                        Send verification code
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
