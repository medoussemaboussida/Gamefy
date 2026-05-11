import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { authApi } from "../../api/auth";
import TwoFaVerifyForm from "./TwoFaVerifyForm";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showTwoFa, setShowTwoFa] = useState(false);
  const [tempUserId, setTempUserId] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setLoading(true);
    setFieldErrors({});
    try {
      const response = await authApi.googleLogin({ idToken: credentialResponse.credential });
      localStorage.setItem("accessToken", response.accessToken);
      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem("accessToken", token);
    navigate("/home");
  };

  const validateField = (name: string, value: string) => {
    let errorMsg = "";
    if (name === "email") {
      if (!value.trim()) {
        errorMsg = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errorMsg = "Invalid email format";
      }
    } else if (name === "password") {
      if (!value.trim()) {
        errorMsg = "Password is required";
      }
    }
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    validateField("email", val);
    setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    validateField("password", val);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateField("email", email);
    const passwordErr = validateField("password", password);

    if (emailErr || passwordErr) {
      return;
    }

    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      
      if (response.requires2FA) {
        setTempUserId(response.userId);
        setShowTwoFa(true);
        return;
      }

      // Store the token in localStorage or a more secure way
      localStorage.setItem("accessToken", response.accessToken);
      // Redirect to dashboard on success
      navigate("/home");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in. Please check your credentials.";
      setError(errorMessage);

      // Map server errors to fields
      if (errorMessage.toLowerCase().includes("user") || errorMessage.toLowerCase().includes("email")) {
        setFieldErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.toLowerCase().includes("password") || errorMessage.toLowerCase().includes("credentials")) {
        setFieldErrors(prev => ({ ...prev, password: errorMessage }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (showTwoFa && tempUserId) {
    return (
      <TwoFaVerifyForm
        userId={tempUserId}
        onSuccess={handleLoginSuccess}
        onCancel={() => setShowTwoFa(false)}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In failed.")}
                useOneTap
              />
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={handleEmailChange}
                    error={!!fieldErrors.email}
                    hint={fieldErrors.email}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      error={!!fieldErrors.password}
                      hint={fieldErrors.password}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-error-500">{error}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span> */}
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            {/* <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
