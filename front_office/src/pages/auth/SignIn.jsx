import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import logo from "../../assets/images/auth_logo.png";
import wallpaper from "../../assets/images/Auth_second_wallpaper.png";
import google_icon from "../../assets/icons/google.png";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error("Please fill in all fields", {
        style: {
          border: '1px solid #DE3D3D',
          padding: '16px',
          color: '#DE3D3D',
          background: '#360200',
          boxShadow: '0 0 15px rgba(222, 61, 61, 0.4)',
        },
        iconTheme: {
          primary: '#DE3D3D',
          secondary: '#360200',
        },
      });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Signing you in...", {
      style: {
        background: '#24003E',
        color: '#1CF3CA',
        border: '1px solid rgba(28, 243, 202, 0.3)',
      }
    });

    try {
      const response = await authApi.login(formData.email, formData.password);
      localStorage.setItem("accessToken", response.accessToken);

      toast.success("Welcome back!", {
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

      // Role-based redirection
      if (response.role === "PLAYER") {
        navigate("/player/dashboard");
      } else if (response.role === "COACH") {
        navigate("/coach/dashboard");
      } else {
        // Fallback for other roles if any
        navigate("/player/dashboard");
      }

    } catch (err) {
      toast.error(err.message || "Failed to sign in", {
        id: loadingToast,
        style: {
          border: '1px solid #DE3D3D',
          padding: '16px',
          color: '#DE3D3D',
          background: '#360200',
          boxShadow: '0 0 15px rgba(222, 61, 61, 0.4)',
        },
        iconTheme: {
          primary: '#DE3D3D',
          secondary: '#360200',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {/* Email Field */}
          <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
            <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']" >
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
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
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
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
            disabled={isLoading}
            className="w-full max-w-[412px] h-[47px] rounded-full bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white font-medium text-lg font-['Inter'] hover:opacity-90 transition-opacity transform hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Sign In"}
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
