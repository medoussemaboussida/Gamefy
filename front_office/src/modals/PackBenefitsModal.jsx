import React from "react";
import { X, Check, Zap } from "lucide-react";

/**
 * PackBenefitsModal Component
 * Displays a list of benefits for a specific Gamefy pack in a premium modal.
 * Benefits are grouped and formatted for a clean user experience.
 */
const PackBenefitsModal = ({ isOpen, onClose, benefits, packName }) => {
    if (!isOpen) return null;

    // Group Hours benefits by type (e.g., PC, VIP, COACH)
    const hoursBenefits = benefits?.filter(b => b.rateRule === "HOURS") || [];
    const groupedHours = hoursBenefits.reduce((acc, b) => {
        acc[b.benefitType] = (acc[b.benefitType] || 0) + 1;
        return acc;
    }, {});

    // Individual Discount benefits
    const discountBenefits = benefits?.filter(b => b.rateRule === "DISCOUNT") || [];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#1a0b2e] border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-[#1CF3CA]/10 text-[#1CF3CA]">
                            <Zap size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white pr-8">
                            {packName} Benefits
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all shadow-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Benefits List Container */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
                    {benefits && benefits.length > 0 ? (
                        <div className="space-y-4">
                            
                            {/* Grouped Hours Display */}
                            {Object.entries(groupedHours).map(([type, count]) => (
                                <div key={type} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-[#1CF3CA]/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#1CF3CA]/20">
                                        <Check size={20} className="text-[#1CF3CA]" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-bold uppercase tracking-tight">
                                                {type} - HOURS
                                            </p>
                                            {count > 1 && (
                                                <span className="px-2.5 py-0.5 rounded-lg bg-[#1CF3CA] text-black text-[10px] font-black uppercase">
                                                    × {count}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em] mt-0.5">Gaming Center Credit</p>
                                    </div>
                                </div>
                            ))}

                            {/* Individual Discounts Display */}
                            {discountBenefits.map((benefit, index) => (
                                <div key={`discount-${index}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-[#FF89EB]/10 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#FF89EB]/20">
                                        <Check size={20} className="text-[#FF89EB]" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold uppercase tracking-tight">
                                            {benefit.benefitType} - DISCOUNT
                                        </p>
                                        <p className="text-[#FF89EB] font-black text-sm mt-0.5">
                                            {benefit.discountValue}{benefit.discountType === "PERCENTAGE" ? "%" : " DT"} Off
                                        </p>
                                    </div>
                                </div>
                            ))}

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center py-10">
                            <Zap size={40} className="mb-2" />
                            <p className="italic font-medium">No specific benefits listed for this pack.</p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full h-14 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PackBenefitsModal;
