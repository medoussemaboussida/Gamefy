import React, { useState, useEffect } from "react";
import { X, Package, Clock, DollarSign, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { packCoachingApi } from "../api/packCoaching";

const AddEditPackCoachingModal = ({ isOpen, onClose, onRefresh, pack = null }) => {
    const [formData, setFormData] = useState({
        name: "",
        hours: 1,
        minutes: 0,
        price: "",
        description: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (pack && pack.hours) {
            const [h, m] = pack.hours.split(":").map(Number);
            setFormData({
                name: pack.name || "",
                hours: h || 0,
                minutes: m || 0,
                price: pack.price || "",
                description: pack.description || "",
            });
        } else {
            setFormData({
                name: "",
                hours: 1,
                minutes: 0,
                price: "",
                description: "",
            });
        }
    }, [pack, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) return toast.error("Name is required");
        if (formData.hours < 0 || formData.minutes < 0) return toast.error("Valid hours/minutes are required");
        if (!formData.price || formData.price <= 0) return toast.error("Valid price is required");

        setIsSubmitting(true);
        // Format as HH:mm
        const formattedHours = `${String(formData.hours).padStart(2, '0')}:${String(formData.minutes).padStart(2, '0')}`;
        const payload = {
            ...formData,
            hours: formattedHours
        };

        try {
            if (pack) {
                await packCoachingApi.updatePack(pack.id, payload);
                toast.success("Pack updated successfully");
            } else {
                await packCoachingApi.createPack(payload);
                toast.success("Pack created successfully");
            }
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to save pack");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#1a0b2e] border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-[#1CF3CA]/10 text-[#1CF3CA]">
                            <Package size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                            {pack ? "Edit Coaching Pack" : "Create New Pack"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar pr-2">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Pack Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="e.g., Professional Training Elite"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#1CF3CA]/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 ml-1">Description (Optional)</label>
                        <textarea
                            placeholder="Briefly describe what's included in this pack..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#1CF3CA]/50 transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Hours & Minutes */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Duration (H : M)</label>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        placeholder="HH"
                                        value={formData.hours}
                                        onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 0 })}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white text-center focus:outline-none focus:border-[#1CF3CA]/50 transition-all"
                                    />
                                </div>
                                <span className="text-white/40 font-bold">:</span>
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        placeholder="MM"
                                        value={formData.minutes}
                                        onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white text-center focus:outline-none focus:border-[#1CF3CA]/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 ml-1">Price (DT)</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#1CF3CA]" />
                                <input
                                    type="number"
                                    step="0.001"
                                    placeholder="0.000"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#1CF3CA]/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-14 bg-[#1CF3CA] hover:bg-[#19d4b0] text-black font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(28,243,202,0.3)]"
                        >
                            {isSubmitting ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                pack ? "Save Changes" : "Create Pack"
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full h-14 bg-white/5 border border-white/10 text-white font-medium rounded-2xl hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditPackCoachingModal;
