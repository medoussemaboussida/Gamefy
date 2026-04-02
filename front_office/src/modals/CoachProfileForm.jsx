import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { coachProfileApi } from "../api/coach_profile";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const CoachProfileForm = ({ profile, onClose, onSave }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        game: profile?.game || "",
        hourlyPrice: profile?.hourlyPrice ? profile.hourlyPrice.toFixed(3) : "",
        bio: profile?.bio || "",
    });
    const [availableGames, setAvailableGames] = useState([]);

    const isEditing = !!profile;

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const games = await coachProfileApi.getAvailableGames();
                setAvailableGames(games);
            } catch (error) {
                console.error("Failed to fetch games:", error);
            }
        };
        fetchGames();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "hourlyPrice") {
            // Allow only numbers and one decimal point
            const regex = /^\d*\.?\d{0,3}$/;
            if (value === "" || regex.test(value)) {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handlePriceBlur = () => {
        if (formData.hourlyPrice) {
            const formatted = parseFloat(formData.hourlyPrice).toFixed(3);
            setFormData((prev) => ({ ...prev, hourlyPrice: formatted }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.game || !formData.hourlyPrice) {
            toast.error("Please fill in game and price");
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading(isEditing ? "Updating profile..." : "Creating profile...", {
            style: {
                background: '#24003E',
                color: '#1CF3CA',
                border: '1px solid rgba(28, 243, 202, 0.3)',
            }
        });

        try {
            const dto = {
                game: formData.game,
                hourlyPrice: parseFloat(formData.hourlyPrice),
                bio: formData.bio
            };

            const savedProfile = isEditing
                ? await coachProfileApi.updateProfile(dto)
                : await coachProfileApi.saveProfile(dto);

            toast.success(isEditing ? "Profile updated!" : "Profile created!", {
                id: loadingToast,
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1CF3CA',
                    background: '#24003E',
                },
            });

            onSave(savedProfile);
            onClose();
        } catch (error) {
            toast.error(error.message || "Operation failed", {
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

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        setIsLoading(true);
        const loadingToast = toast.loading("Deleting profile...", {
            style: {
                background: '#24003E',
                color: '#DE3D3D',
                border: '1px solid rgba(222, 61, 61, 0.3)',
            }
        });

        try {
            await coachProfileApi.deleteProfile();
            toast.success("Profile deleted successfully", {
                id: loadingToast,
                style: {
                    border: '1px solid #1CF3CA',
                    padding: '16px',
                    color: '#1BF3CA',
                    background: '#24003E',
                },
            });
            onSave(null); // Clear profile in dashboard
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to delete profile", {
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
            setShowDeleteConfirm(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="relative w-full max-w-lg bg-gray-900/80 border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {isEditing ? "Edit Coaching Profile" : "Create Coaching Profile"}
                        </h2>
                        <p className="text-white/60 text-sm">
                            {isEditing
                                ? "Update your coaching details below."
                                : "Set up your coaching details to start receiving bookings."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-['Inter'] text-[12px] text-[#1CF3CA] font-medium tracking-wider uppercase">
                                Coaching Game
                            </label>
                            <select
                                name="game"
                                value={formData.game}
                                onChange={handleChange}
                                className="w-full h-12 bg-[#24003E] border border-[#1CF3CA]/30 rounded-full px-6 text-white text-sm focus:outline-none focus:border-[#1CF3CA] transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%231CF3CA\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2em' }}
                            >
                                <option value="" disabled className="bg-[#24003E]">Select a game</option>
                                {availableGames.map(game => (
                                    <option key={game} value={game} className="bg-[#24003E]">
                                        {game.replace(/_/g, " ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="font-['Inter'] text-[12px] text-[#1CF3CA] font-medium tracking-wider uppercase">
                                Hourly Price (DT)
                            </label>
                            <input
                                name="hourlyPrice"
                                type="text"
                                placeholder="e.g. 5.000"
                                value={formData.hourlyPrice}
                                onChange={handleChange}
                                onBlur={handlePriceBlur}
                                className="w-full h-12 bg-white/5 border border-[#1CF3CA]/30 rounded-full px-6 text-white text-sm focus:outline-none focus:border-[#1CF3CA] transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="font-['Inter'] text-[12px] text-[#1CF3CA] font-medium tracking-wider uppercase">
                                Biography
                            </label>
                            <textarea
                                name="bio"
                                placeholder="Tell us about your coaching experience..."
                                value={formData.bio}
                                onChange={handleChange}
                                className="w-full h-32 bg-white/5 border border-[#1CF3CA]/30 rounded-[24px] p-6 text-white text-sm focus:outline-none focus:border-[#1CF3CA] transition-all resize-none custom-scrollbar"
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <div className="flex gap-4">
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
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Save Profile"}
                                </button>
                            </div>

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="w-full h-12 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full font-bold hover:bg-red-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                                >
                                    Delete Coaching Profile
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {showDeleteConfirm && (
                <DeleteConfirmationModal
                    title="Delete Coaching Profile"
                    message="Are you sure you want to delete your profile? This action will remove your visibility as a coach and cannot be undone."
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                    isLoading={isLoading}
                />
            )}
        </>
    );
};

export default CoachProfileForm;
