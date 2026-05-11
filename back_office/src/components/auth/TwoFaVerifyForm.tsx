import { useState, useRef, useEffect } from "react";
import Button from "../ui/button/Button";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";

interface TwoFaVerifyFormProps {
  userId: number;
  onSuccess: (accessToken: string) => void;
  onCancel: () => void;
}

export default function TwoFaVerifyForm({ userId, onSuccess, onCancel }: TwoFaVerifyFormProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
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

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setCode(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Verifying code...");

    try {
      const response = await authApi.verify2FA({
        userId,
        code: fullCode,
      });

      toast.success("Verification successful!", { id: loadingToast });
      onSuccess(response.accessToken);
    } catch (err: any) {
      toast.error(err.message || "Invalid verification code", { id: loadingToast });
      // Clear the code inputs on error
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Two-Factor Authentication
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            We've sent a 6-digit verification code to your email. Enter it below to complete your sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                placeholder="-"
              />
            ))}
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="sm" disabled={isLoading} type="submit">
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </Button>
            
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
