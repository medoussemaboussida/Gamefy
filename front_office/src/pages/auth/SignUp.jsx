import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import logo from "../../assets/images/auth_logo.png";
import wallpaper from "../../assets/images/Auth_second_wallpaper.png";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
      case "lastName":
        if (value.trim().length < 3) {
          error = `${name === "firstName" ? "First" : "Last"} name must be at least 3 characters`;
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          error = "Invalid email format";
        }
        break;
      case "password":
        if (value.length < 8) {
          error = "Password must be at least 8 characters";
        } else if (!/(?=.*[A-Z])(?=.*\d)/.test(value)) {
          error = "Password must contain at least one uppercase letter and one number";
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0: return "bg-gray-600";
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-green-500";
      default: return "bg-gray-600";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Special case: validate confirmPassword when password changes
      if (name === "password") {
        validateField("confirmPassword", prev.confirmPassword);
      }
      return newData;
    });
    validateField(name, value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation check
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
      if (key === "confirmPassword" && formData[key] !== formData.password) {
        newErrors[key] = "Passwords do not match";
      } else if (key === "password") {
        if (formData[key].length < 8) newErrors[key] = "Password must be at least 8 characters";
        else if (!/(?=.*[A-Z])(?=.*\d)/.test(formData[key])) newErrors[key] = "Password must contain at least one uppercase letter and one number";
      } else if ((key === "firstName" || key === "lastName") && formData[key].trim().length < 3) {
        newErrors[key] = "Minimum 3 characters required";
      } else if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[key])) {
        newErrors[key] = "Invalid email format";
      }
    });

    if (Object.values(newErrors).some(err => err) || Object.values(fieldErrors).some(err => err)) {
      toast.error("Please fix the errors in the form");
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
      await authApi.signUp({ ...signUpData, recaptchaToken });
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
              className={`w-full h-[47px] bg-transparent border ${fieldErrors.firstName ? 'border-red-500' : 'border-[#1CF3CA]'} rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all`}
            />
            {fieldErrors.firstName && (
              <span className="text-red-500 text-xs ml-4 mt-1">{fieldErrors.firstName}</span>
            )}
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
              className={`w-full h-[47px] bg-transparent border ${fieldErrors.lastName ? 'border-red-500' : 'border-[#1CF3CA]'} rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all`}
            />
            {fieldErrors.lastName && (
              <span className="text-red-500 text-xs ml-4 mt-1">{fieldErrors.lastName}</span>
            )}
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
              className={`w-full h-[47px] bg-transparent border ${fieldErrors.email ? 'border-red-500' : 'border-[#1CF3CA]'} rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all`}
            />
            {fieldErrors.email && (
              <span className="text-red-500 text-xs ml-4 mt-1">{fieldErrors.email}</span>
            )}
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
                className={`w-full h-[47px] bg-transparent border ${fieldErrors.password ? 'border-red-500' : 'border-[#1CF3CA]'} rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1CF3CA]/70 hover:text-[#1CF3CA]"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {/* Password Strength Meter */}
            {formData.password && (
              <div className="flex flex-col gap-2 px-4 mt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password) >= level
                        ? getStrengthColor(getPasswordStrength(formData.password))
                        : "bg-gray-600/30"
                        }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-medium ${getStrengthColor(getPasswordStrength(formData.password)).replace('bg-', 'text-')}`}>
                  {getPasswordStrength(formData.password) <= 1 && "Weak"}
                  {getPasswordStrength(formData.password) === 2 && "Fair"}
                  {getPasswordStrength(formData.password) === 3 && "Good"}
                  {getPasswordStrength(formData.password) === 4 && "Strong"}
                </span>
              </div>
            )}
            {fieldErrors.password && (
              <span className="text-red-500 text-xs ml-4">{fieldErrors.password}</span>
            )}
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
                className={`w-full h-[47px] bg-transparent border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-[#1CF3CA]'} rounded-full px-6 text-white text-[14px] font-medium font-['Inter'] focus:outline-none focus:ring-1 focus:ring-[#1CF3CA] transition-all pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1CF3CA]/70 hover:text-[#1CF3CA]"
              >
                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className="text-red-500 text-xs ml-4">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          {/* reCAPTCHA Widget */}
          <div className="flex justify-center w-full max-w-[412px] mt-4 ">
            <div className="rounded-[10px] overflow-hidden">
              <ReCAPTCHA
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
                theme="light"
              />
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading || !recaptchaToken || Object.values(fieldErrors).some(err => err)}
            className="w-full max-w-[412px] h-[47px] rounded-full bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] text-white font-medium text-lg font-['Inter'] hover:opacity-90 transition-opacity transform hover:shadow-lg active:scale-[0.98] mt-[33px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
