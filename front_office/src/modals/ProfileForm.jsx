import React, { useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { profileApi } from "../api/profile";

const ProfileForm = ({ user, onClose, onUpdate }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const loadingToast = toast.loading("Updating profile...", {
            style: {
                background: '#24003E',
                color: '#1CF3CA',
                border: '1px solid rgba(28, 243, 202, 0.3)',
            }
        });

        try {
            const updateDto = {
                firstName: formData.firstName,
                lastName: formData.lastName,
            };

            if (formData.password.trim()) {
                updateDto.password = formData.password;
            }

            const updatedUser = await profileApi.updateProfile(updateDto);

            toast.success("Profile updated successfully!", {
                id: loadingToast,
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                    boxShadow: '0 0 15px rgba(28, 243, 202, 0.4)',
                },
            });

            onUpdate(updatedUser);
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to update profile", {
                id: loadingToast,
                style: {
                    border: '1px solid #DE3D3D',
                    padding: '16px',
                    color: '#DE3D3D',
                    background: '#360200',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-gray-900/80 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Edit Profile</h2>
                    <p className="text-white/60 text-sm">Update your personal information below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Read-only info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="font-['Inter'] md:text-[12px] text-[#1CF3CA] font-medium tracking-wider">Email</label>
                            <div className="w-full h-11 bg-white/5 border border-white/10 rounded-full px-4 flex items-center text-white/40 text-sm cursor-not-allowed">
                                {user.email}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="font-['Inter'] md:text-[12px] text-[#1CF3CA] font-medium tracking-wider">Role</label>
                            <div className="w-full h-11 bg-white/5 border border-white/10 rounded-full px-4 flex items-center text-white/40 text-sm cursor-not-allowed">
                                {user.role}
                            </div>
                        </div>
                    </div>

                    {/* Editable fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="font-['Inter'] md:text-[12px] text-[#1CF3CA] font-medium tracking-wider">First Name</label>
                            <input
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full h-11 bg-white/5 border border-[#1CF3CA]/30 rounded-full px-4 text-white text-sm focus:outline-none focus:border-[#1CF3CA] transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="font-['Inter'] md:text-[12px] text-[#1CF3CA] font-medium  tracking-wider">Last Name</label>
                            <input
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full h-11 bg-white/5 border border-[#1CF3CA]/30 rounded-full px-4 text-white text-sm focus:outline-none focus:border-[#1CF3CA] transition-all"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="font-['Inter'] md:text-[12px] text-[#1CF3CA] font-medium tracking-wider">New Password</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Leave blank to keep current"
                                className="w-full h-11 bg-white/5 border border-[#1CF3CA]/30 rounded-full px-4 text-white text-sm focus:outline-none focus:border-[#1CF3CA] transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-[#1CF3CA] transition-colors"
                            >
                                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-12 border border-white/10 rounded-full text-white font-medium hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 h-12 bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-full text-white font-bold hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileForm;
