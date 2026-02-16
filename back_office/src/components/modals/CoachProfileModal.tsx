import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { userApi, CoachProfileDto } from "../../api/user";
import { AlertIcon } from "../../icons";
import toast from "react-hot-toast";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";

interface CoachProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
    isAdmin: boolean;
}

const PC_GAMES = [
    { value: "FC26", label: "FC 26" },
    { value: "VALORANT", label: "Valorant" },
    { value: "CS_GO", label: "CS:GO" },
    { value: "LEAGUE_OF_LEGENDS", label: "League of Legends" },
];

const CoachProfileModal: React.FC<CoachProfileModalProps> = ({ isOpen, onClose, userId, userName, isAdmin }) => {
    const [profile, setProfile] = useState<CoachProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        game: "",
        hourlyPrice: 0,
    });

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.getCoachProfile(userId);
            setProfile(data);
            setEditData({
                game: data.game,
                hourlyPrice: data.hourlyPrice,
            });
        } catch (err: any) {
            console.error("Failed to fetch coach profile:", err);
            if (err.message.includes("404")) {
                setError("This coach hasn't created their profile yet.");
            } else {
                setError("Failed to load coach profile.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            setIsEditing(false);
        }
    }, [isOpen, userId]);

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            await userApi.adminUpdateCoachProfile(userId, editData);
            toast.success("Coach profile updated successfully!");
            setIsEditing(false);
            fetchProfile();
        } catch (err: any) {
            toast.error(err.message || "Failed to update profile.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this coach's profile? This action cannot be undone.")) {
            return;
        }
        setUpdating(true);
        try {
            await userApi.adminDeleteCoachProfile(userId);
            toast.success("Coach profile deleted successfully!");
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete profile.");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 sm:p-8">
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                            Coaching Profile
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Professional details for <span className="font-semibold text-brand-500 font-medium">{userName}</span>
                        </p>
                    </div>
                </div>

                <div className="min-h-[200px] flex flex-col justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-500">Loading details...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center gap-4 text-center p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                            <AlertIcon className="w-10 h-10 text-warning-500" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                {error}
                            </p>
                        </div>
                    ) : isEditing ? (
                        <div className="flex flex-col gap-5">
                            <div>
                                <Label>Game</Label>
                                <Select
                                    options={PC_GAMES}
                                    defaultValue={editData.game}
                                    onChange={(val) => setEditData(prev => ({ ...prev, game: val }))}
                                />
                            </div>
                            <div>
                                <Label>Hourly Rate (TND)</Label>
                                <Input
                                    type="number"
                                    value={editData.hourlyPrice}
                                    onChange={(e) => setEditData(prev => ({ ...prev, hourlyPrice: parseFloat(e.target.value) }))}
                                    placeholder="Enter hourly price"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-4 p-4 bg-brand-50/50 dark:bg-brand-500/5 rounded-2xl border border-brand-100 dark:border-brand-500/10">
                                <div className="w-12 h-12 flex items-center justify-center bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20">
                                    <span className="text-2xl">🎮</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Target Game</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">{profile?.game}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                                <div className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                                    <span className="text-2xl">💰</span>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Hourly Rate</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-white">{profile?.hourlyPrice} <span className="text-sm font-medium text-gray-500">TND / Hour</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                    {!loading && !error && isAdmin && (
                        <>
                            {isEditing ? (
                                <>
                                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={updating}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleUpdate} loading={updating}>
                                        Save Changes
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={handleDelete} className="text-error-500 border-error-200 hover:bg-error-50 dark:border-error-500/20 dark:hover:bg-error-500/10" disabled={updating}>
                                        Delete Profile
                                    </Button>
                                    <Button variant="primary" onClick={() => setIsEditing(true)} disabled={updating}>
                                        Update Profile
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                    <Button variant="outline" onClick={onClose} disabled={updating} className={(isEditing && isAdmin) || (!loading && !error && isAdmin) ? "hidden sm:inline-flex" : ""}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CoachProfileModal;
