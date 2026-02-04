import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import logo from "../../assets/images/auth_logo.png";
import wallpaper from "../../assets/images/Auth_second_wallpaper.png";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Field validation (ensure no empty fields)
    const emptyFields = Object.entries(formData).filter(([key, value]) => !value.trim());
    if (emptyFields.length > 0) {
      toast.error("All fields are required", {
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

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
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
    const loadingToast = toast.loading("Creating your account...", {
      style: {
        background: '#24003E',
        color: '#1CF3CA',
        border: '1px solid rgba(28, 243, 202, 0.3)',
      }
    });

    try {
      const { confirmPassword, ...signUpData } = formData;
      await authApi.signUp(signUpData);
      toast.success("Account created successfully!", {
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
      navigate("/signin");
    } catch (err) {
      toast.error(err.message || "Registration failed", {
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
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${wallpaper})` }}
      ></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[460px] px-6 py-20 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-[69px]">
          <img src={logo} alt="Gamefy" className="h-12 md:h-20 w-auto" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6 flex flex-col items-center">
          {error && (
            <div className="text-red-500 text-sm font-['Inter'] w-full max-w-[412px] text-center mb-2">
              {error}
            </div>
          )}

          {/* First Name Field */}
          <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
            <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">
              First Name
            </label>
            <input
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full h-[47px] bg-transparent border border-[#1CF3CA] rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all"
            />
          </div>

          {/* Last Name Field */}
          <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
            <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">
              Last Name
            </label>
            <input
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full h-[47px] bg-transparent border border-[#1CF3CA] rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all"
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
            <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="Example@gmail.com"
              value={formData.email}
              onChange={handleChange}
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
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-[11px] w-full max-w-[412px]">
            <label className="text-[#1CF3CA] text-[14px] font-medium font-['Inter']">
              Confirm Password
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full h-[47px] bg-transparent border border-[#1CF3CA] rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all pr-12"
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

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full max-w-[412px] h-[47px] rounded-full bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white font-medium text-lg font-['Inter'] hover:opacity-90 transition-opacity transform hover:shadow-lg active:scale-[0.98] mt-[33px] flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Sign Up"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-12 text-white/70 text-sm font-['Inter']">
          Already have an account ?{" "}
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

export default SignUp;
