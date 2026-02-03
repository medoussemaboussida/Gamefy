import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import logo from "../../assets/images/auth_logo.png";
import wallpaper from "../../assets/images/Auth_second_wallpaper.png";
import google_icon from "../../assets/icons/google.png";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${wallpaper})` }}
      ></div>
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[460px] px-6 py-12 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-[69px]">
          <img src={logo} alt="Gamefy" className="h-12 md:h-20 w-auto" />
        </div>

        {/* Form */}
        <form className="w-full space-y-6">
          {/* Email Field */}
          <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
            <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']" >
              Email
            </label>
            <input
              type="email"
              placeholder="Example@gmail.com"
              className="w-full h-[47px] bg-transparent border border-[#1CF3CA] rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
            <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-[47px] bg-transparent border border-[#1CF3CA] rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1CF3CA]/70 hover:text-[#1CF3CA]"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <div className="flex justify-end w-full">
              <Link
                to="/forgot-password"
                size="sm"
                className="text-[#1CF3CA] text-xs hover:underline mt-1 font-medium font-['Inter']"
              >
                Forget Password ?
              </Link>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center w-full max-w-[412px] mt-[-30px]">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <div
                  className={`w-6 h-6 border-2 border-[#1CF3CA] rounded flex items-center justify-center transition-all ${rememberMe ? "bg-[#1CF3CA]" : "bg-transparent"}`}
                >
                  {rememberMe && (
                    <Check size={16} className="text-[#470155] stroke-[4px]" />
                  )}
                </div>
              </div>
              <span className="ml-3 text-[#1CF3CA] text-sm font-medium select-none font-['Inter']">
                Remember me
              </span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full max-w-[412px] h-[47px] rounded-full bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white font-medium text-lg font-['Inter'] hover:opacity-90 transition-opacity transform hover:shadow-lg active:scale-[0.98]"
          >
            Sign In
          </button>

          {/* Google Sign In */}
          <button
            type="button"
            className="w-full max-w-[412px] h-[47px] rounded-full bg-white flex items-center justify-center gap-3 text-gray-800 font-medium text-lg hover:bg-gray-100 transition-colors shadow-md active:scale-[0.98] font-['Inter']"
          >
            <img src={google_icon} alt="Google" className="w-[20px] h-[20px]" />
            Sign In with Google
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-12 text-white/70 text-sm font-['Inter']">
          You don't have an account ?{" "}
          <Link
            to="/signup"
            className="text-[#1CF3CA] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
