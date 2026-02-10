import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { authApi } from "../../api/auth";

export default function ResetPasswordForm() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!token) {
            setError("Reset token is missing.");
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.resetPassword({ token: token!, newPassword });
            setMessage(response.message);
        } catch (err: any) {
            setError(err.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div className="mb-5 sm:mb-8">
                    <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                        Reset Password
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div>
                            <Label>
                                New Password <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label>
                                Confirm Password <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {message && <p className="text-sm text-success-500">{message}</p>}
                        {error && <p className="text-sm text-error-500">{error}</p>}

                        <div>
                            <Button className="w-full" size="sm" disabled={loading || !!message}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </Button>
                        </div>
                    </div>
                </form>

                <div className="mt-5 text-center">
                    <Link to="/" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                        Go to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
