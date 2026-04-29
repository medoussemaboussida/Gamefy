import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import logo from "../../assets/images/auth_logo.png";
import wallpaper from "../../assets/images/Auth_second_wallpaper.png";
import google_icon from "../../assets/icons/google.png";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";

const SignIn = () => {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateField = (name, value) => {
    let error = "";
    if (name === "email") {
      if (!value.trim()) {
        error = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Invalid email format";
      }
    } else if (name === "password") {
      if (!value.trim()) {
        error = "Password is required";
      }
    }
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);

    if (emailError || passwordError) {
      toast.error("Please fix the errors in the form");
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
      const response = await authApi.login({ email: formData.email, password: formData.password });
      
      // Check if 2FA verification is required
      if (response.requires2FA) {
        toast.dismiss(loadingToast);
        toast("A verification code has been sent to your email", {
          icon: "🔐",
          style: {
            border: '1px solid #1CF3CA',
            padding: '16px',
            color: '#1CF3CA',
            background: '#24003E',
            boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
          },
        });
        sessionStorage.setItem("2fa_userId", response.userId);
        navigate("/verify-2fa");
        return;
      }

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("userId", response.userId);

      // Refresh the global user context immediately after login
      refreshUser();

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
      const errorMessage = err.message || "Failed to sign in";

      // Map server errors to fields if possible
      if (errorMessage.toLowerCase().includes("user") || errorMessage.toLowerCase().includes("email")) {
        setFieldErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes("password") || errorMessage.toLowerCase().includes("credentials")) {
        setFieldErrors(prev => ({ ...prev, password: errorMessage }));
      }

      toast.error(errorMessage, {
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

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      const loadingToast = toast.loading("Connecting with Google...", {
        style: {
          background: '#24003E',
          color: '#1CF3CA',
          border: '1px solid rgba(28, 243, 202, 0.3)',
        }
      });

      try {
        // Send access_token to backend
        const response = await authApi.googleLogin({ idToken: tokenResponse.access_token });
        localStorage.setItem("accessToken", response.accessToken);
        
        // Refresh the global user context
        refreshUser();

        toast.success("Signed in with Google!", {
          id: loadingToast,
          style: {
            border: '1px solid #1CF3CA',
            padding: '16px',
            color: '#1CF3CA',
            background: '#24003E',
            boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
          },
        });

        if (response.role === "PLAYER") {
          navigate("/player/dashboard");
        } else if (response.role === "COACH") {
          navigate("/coach/dashboard");
        } else {
          navigate("/player/dashboard");
        }
      } catch (err) {
        toast.error(err.message || "Google sign-in failed", {
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
    },
    onError: () => {
      toast.error("Google login failed", {
        style: {
          border: '1px solid #DE3D3D',
          padding: '16px',
          color: '#DE3D3D',
          background: '#360200',
          boxShadow: '0 0 15px rgba(222, 61, 61, 0.4)',
        },
      });
    }
  });

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
            {fieldErrors.password && (
              <span className="text-red-500 text-xs ml-4 mt-1">{fieldErrors.password}</span>
            )}
            <div className="flex justify-end w-full">
              <Link
                to="/forgot-password"
                className="text-[#1CF3CA] text-xs hover:underline mt-1 font-medium font-['Inter']"
              >
                Forget Password ?
              </Link>
            </div>
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
            onClick={() => googleLogin()}
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
