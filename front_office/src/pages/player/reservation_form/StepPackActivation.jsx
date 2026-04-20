import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Clock, Percent, ArrowRight, Zap, Gift, Check, GraduationCap } from "lucide-react";
import { getMyPackBenefits, getMyCoachingPackBenefits } from "../../../api/reservation";

export default function StepPackActivation({
    reservationType,
    setStep,
    startTime,
    endTime,
    packHoursUsed,
    setPackHoursUsed,
    selectedDiscounts,
    setSelectedDiscounts,
    packBenefits,
    setPackBenefits,
    coachingPackHoursUsed,
    setCoachingPackHoursUsed,
    coachingPackBenefits,
    setCoachingPackBenefits,
    selectedCoachId,
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // "gamefy" or "coaching"
    const [activeTab, setActiveTab] = useState("gamefy");

    const reservationDuration = (Number(endTime) - Number(startTime)) / 60;
    const isCoachingRoom = reservationType === "COACHING_ROOM";

    // Fetch Gamefy Pack Benefits
    useEffect(() => {
        const fetchBenefits = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getMyPackBenefits(reservationType);
                setPackBenefits(data);
            } catch (e) {
                setPackBenefits(null);
            } finally {
                setLoading(false);
            }
        };
        fetchBenefits();
    }, [reservationType]);

    // Fetch Coaching Pack Benefits (only for coaching reservations)
    useEffect(() => {
        if (!isCoachingRoom || !selectedCoachId) {
            setCoachingPackBenefits(null);
            return;
        }
        const fetchCoachingBenefits = async () => {
            try {
                const data = await getMyCoachingPackBenefits(selectedCoachId);
                setCoachingPackBenefits(data);
            } catch (e) {
                setCoachingPackBenefits(null);
            }
        };
        fetchCoachingBenefits();
    }, [isCoachingRoom, selectedCoachId]);

    // Determine which tabs are available
    const hasGamefyPack = packBenefits?.hasActivePack;
    const gamefyHasHours = packBenefits?.remainingHours > 0;
    const gamefyHasDiscount = packBenefits?.discounts && packBenefits.discounts.length > 0;
    const gamefyCanActivate = gamefyHasHours || gamefyHasDiscount;

    const hasCoachingPack = isCoachingRoom && coachingPackBenefits?.hasActivePack;
    const coachingHasHours = coachingPackBenefits?.remainingHours > 0;

    const noPacks = !hasGamefyPack && !hasCoachingPack;

    // Gamefy hours
    const gamefyMaxHours = packBenefits
        ? Math.min(packBenefits.remainingHours || 0, reservationDuration)
        : 0;

    // Coaching hours
    const coachingMaxHours = coachingPackBenefits
        ? Math.min(coachingPackBenefits.remainingHours || 0, reservationDuration)
        : 0;

    // Tab switching — clear the other pack's state
    const switchTab = (tab) => {
        if (tab === activeTab) return;
        if (tab === "coaching") {
            // Clear gamefy state
            setPackHoursUsed(0);
            setSelectedDiscounts([]);
        } else {
            // Clear coaching state
            setCoachingPackHoursUsed(0);
        }
        setActiveTab(tab);
    };

    const handleGamefyHoursChange = (value) => {
        const hours = Math.min(Math.max(0, parseFloat(value) || 0), gamefyMaxHours);
        const rounded = Math.round(hours * 2) / 2;
        setPackHoursUsed(rounded);
    };

    const handleCoachingHoursChange = (value) => {
        const hours = Math.min(Math.max(0, parseFloat(value) || 0), coachingMaxHours);
        const rounded = Math.round(hours * 2) / 2;
        setCoachingPackHoursUsed(rounded);
    };

    const handleSkip = () => {
        setPackHoursUsed(0);
        setSelectedDiscounts([]);
        setCoachingPackHoursUsed(0);
        setStep(7);
    };

    const handleContinue = () => {
        setStep(7);
    };

    const toggleDiscount = (discount) => {
        const isSelected = selectedDiscounts.some(d => d.id === discount.id);
        if (isSelected) {
            setSelectedDiscounts(prev => prev.filter(d => d.id !== discount.id));
        } else {
            setSelectedDiscounts(prev => [...prev, discount]);
        }
    };

    const roomLabel = reservationType === "VIP_ROOM" ? "VIP" : reservationType === "COACHING_ROOM" ? "Coaching" : "PC";

    // Check if anything is activated
    const hasAnyActivation =
        packHoursUsed > 0 || selectedDiscounts.length > 0 || coachingPackHoursUsed > 0;

    return (
        <div className="space-y-8">
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setStep(5)}
                className="text-[#1CF3CA] hover:text-[#19d4b0] text-sm font-black font-['Inter'] uppercase tracking-[0.2em] flex items-center gap-2 group"
            >
                <span className="p-1 rounded-md bg-[#1CF3CA]/10 group-hover:bg-[#1CF3CA]/20 transition-colors">
                    <ArrowRight size={14} className="rotate-180" />
                </span>
                Back to PC Selection
            </motion.button>

            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-black font-['Inter'] uppercase tracking-tighter text-white">
                    Pack <span className="text-[#1CF3CA]">Activation</span>
                </h2>
                <p className="text-white/40 text-xs mt-1 font-normal font-['Inter'] tracking-wide">
                    Use your pack benefits for this reservation
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-12 h-12 border-4 border-[#1CF3CA]/20 border-t-[#1CF3CA] rounded-full animate-spin" />
                    <p className="text-white/30 text-sm font-black font-['Inter'] uppercase tracking-widest">Loading pack benefits...</p>
                </div>
            ) : noPacks ? (
                /* No packs at all */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-8 md:p-12 rounded-[32px] bg-[#320141]/60 backdrop-blur-xl border border-white/10 text-center space-y-6"
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center">
                        <Package size={32} className="text-white/20" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black font-['Inter'] uppercase text-white/60">No Active Pack</h3>
                        <p className="text-white/30 text-sm mt-2">You don't have any active pack. Proceed to checkout.</p>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="px-8 py-4 rounded-full font-black uppercase font-['Inter'] tracking-[0.15em] bg-[#1CF3CA] text-black hover:shadow-[0_0_30px_rgba(28,243,202,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                        Continue to Checkout
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Tab Switcher — only show if both packs exist */}
                    {hasGamefyPack && hasCoachingPack && (
                        <div className="flex rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
                            <button
                                onClick={() => switchTab("gamefy")}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-black uppercase text-xs font-['Inter'] tracking-[0.15em] transition-all duration-300 ${
                                    activeTab === "gamefy"
                                        ? "bg-[#1CF3CA]/10 text-[#1CF3CA] border-b-2 border-[#1CF3CA]"
                                        : "text-white/30 hover:text-white/50 hover:bg-white/[0.02]"
                                }`}
                            >
                                <Zap size={16} />
                                Gamefy Pack
                            </button>
                            <button
                                onClick={() => switchTab("coaching")}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-black uppercase text-xs font-['Inter'] tracking-[0.15em] transition-all duration-300 ${
                                    activeTab === "coaching"
                                        ? "bg-purple-500/10 text-purple-400 border-b-2 border-purple-400"
                                        : "text-white/30 hover:text-white/50 hover:bg-white/[0.02]"
                                }`}
                            >
                                <GraduationCap size={16} />
                                Coaching Pack
                            </button>
                        </div>
                    )}

                    {/* ═══════════ GAMEFY PACK TAB ═══════════ */}
                    {activeTab === "gamefy" && hasGamefyPack && (
                        <div className="space-y-6">
                            {/* Pack Header */}
                            <div className="relative p-6 md:p-8 rounded-[28px] bg-gradient-to-br from-[#320141]/80 to-[#320141]/40 backdrop-blur-xl border border-[#1CF3CA]/20 overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#1CF3CA]/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-[#1CF3CA]/10">
                                        <Zap size={24} className="text-[#1CF3CA]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black font-['Inter'] uppercase tracking-tight text-white">{packBenefits.packName}</h3>
                                        <p className="text-[#1CF3CA]/60 text-xs font-bold uppercase tracking-wider">Active Pack — {roomLabel} Benefits</p>
                                    </div>
                                </div>
                            </div>

                            {!gamefyCanActivate ? (
                                <div className="p-6 rounded-[24px] bg-[#320141]/60 border border-white/10 text-center">
                                    <p className="text-white/30 text-sm">
                                        No remaining {roomLabel} benefits in your Gamefy pack.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Free Hours Section */}
                                    {gamefyHasHours && (
                                        <div className="p-6 md:p-8 rounded-[24px] bg-[#320141]/60 border border-white/10 space-y-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-500/10">
                                                    <Clock size={20} className="text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black font-['Inter'] uppercase text-sm text-white">Free Covered Hours</h4>
                                                    <p className="text-white/30 text-xs">
                                                        You have <span className="text-blue-300 font-bold">{packBenefits.remainingHours}h</span> available — cover part of your {reservationDuration}h session for free
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-wider">Hours to cover with pack</span>
                                                    <span className="text-sm font-black text-blue-400">{packHoursUsed}h / max {gamefyMaxHours}h</span>
                                                </div>

                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={gamefyMaxHours}
                                                    step={0.5}
                                                    value={packHoursUsed}
                                                    onChange={(e) => handleGamefyHoursChange(e.target.value)}
                                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(to right, #1CF3CA ${(packHoursUsed / gamefyMaxHours) * 100}%, rgba(255,255,255,0.1) ${(packHoursUsed / gamefyMaxHours) * 100}%)`,
                                                    }}
                                                />

                                                <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                                    <span>0h</span>
                                                    <span>{gamefyMaxHours}h</span>
                                                </div>

                                                {packHoursUsed > 0 && (
                                                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                                        <p className="text-xs text-blue-400 font-bold">
                                                            ✓ {packHoursUsed}h covered — you'll only pay for {reservationDuration - packHoursUsed}h
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Discount Section — Individual Toggle Cards */}
                                    {gamefyHasDiscount && (
                                        <div className="p-6 md:p-8 rounded-[24px] bg-[#320141]/60 border border-white/10 space-y-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-green-500/10">
                                                    <Gift size={20} className="text-green-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black font-['Inter'] uppercase text-sm text-white">Price Discounts</h4>
                                                    <p className="text-white/30 text-xs">
                                                        Select which discounts to activate for this reservation
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-3">
                                                {packBenefits.discounts.map((discount, index) => {
                                                    const isSelected = selectedDiscounts.some(d => d.id === discount.id);
                                                    return (
                                                        <button
                                                            key={discount.id || index}
                                                            onClick={() => toggleDiscount(discount)}
                                                            className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left ${
                                                                isSelected
                                                                    ? "bg-[#1CF3CA]/10 border-[#1CF3CA]/40 shadow-[0_0_20px_rgba(28,243,202,0.1)]"
                                                                    : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                                                    isSelected ? "bg-[#1CF3CA] text-black" : "bg-white/5 text-white/30"
                                                                }`}>
                                                                    {isSelected ? <Check size={16} strokeWidth={3} /> : <Percent size={14} />}
                                                                </div>
                                                                <div>
                                                                    <p className={`text-sm font-black font-['Inter'] ${isSelected ? 'text-[#1CF3CA]' : 'text-white/80'}`}>
                                                                        {discount.discountType === "PERCENTAGE"
                                                                            ? `${discount.discountValue}% Off`
                                                                            : `${discount.discountValue?.toFixed(3)} DT Cut`}
                                                                    </p>
                                                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                                                                        {discount.discountType === "PERCENTAGE" ? "Percentage Discount" : "Fixed Amount Discount"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                isSelected ? "border-[#1CF3CA] bg-[#1CF3CA]" : "border-white/20"
                                                            }`}>
                                                                {isSelected && <Check size={12} className="text-black" strokeWidth={3} />}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {selectedDiscounts.length > 0 && (
                                                <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                                                    <p className="text-xs text-green-400 font-bold flex items-center gap-1.5">
                                                        <Check size={12} />
                                                        {selectedDiscounts.length} discount{selectedDiscounts.length !== 1 ? 's' : ''} selected — will be applied to the final price
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ═══════════ COACHING PACK TAB ═══════════ */}
                    {activeTab === "coaching" && hasCoachingPack && (
                        <div className="space-y-6">
                            {/* Pack Header */}
                            <div className="relative p-6 md:p-8 rounded-[28px] bg-gradient-to-br from-purple-900/60 to-purple-900/30 backdrop-blur-xl border border-purple-400/20 overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-purple-400/10">
                                        <GraduationCap size={24} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black font-['Inter'] uppercase tracking-tight text-white">{coachingPackBenefits.packName}</h3>
                                        <p className="text-purple-400/60 text-xs font-bold uppercase tracking-wider">Coaching Pack — Hour Benefits</p>
                                    </div>
                                </div>
                            </div>

                            {!coachingHasHours ? (
                                <div className="p-6 rounded-[24px] bg-purple-900/30 border border-white/10 text-center">
                                    <p className="text-white/30 text-sm">
                                        No remaining hours in your coaching pack.
                                    </p>
                                </div>
                            ) : (
                                /* Coaching Hours Slider */
                                <div className="p-6 md:p-8 rounded-[24px] bg-purple-900/20 border border-purple-400/10 space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-purple-500/10">
                                            <Clock size={20} className="text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-black font-['Inter'] uppercase text-sm text-white">Coaching Covered Hours</h4>
                                            <p className="text-white/30 text-xs">
                                                You have <span className="text-purple-300 font-bold">{coachingPackBenefits.remainingHours}h</span> available — cover part of your {reservationDuration}h session
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-white/40 tracking-wider">Hours to cover with coaching pack</span>
                                            <span className="text-sm font-black text-purple-400">{coachingPackHoursUsed}h / max {coachingMaxHours}h</span>
                                        </div>

                                        <input
                                            type="range"
                                            min={0}
                                            max={coachingMaxHours}
                                            step={0.5}
                                            value={coachingPackHoursUsed}
                                            onChange={(e) => handleCoachingHoursChange(e.target.value)}
                                            className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                            style={{
                                                background: `linear-gradient(to right, #a855f7 ${(coachingPackHoursUsed / coachingMaxHours) * 100}%, rgba(255,255,255,0.1) ${(coachingPackHoursUsed / coachingMaxHours) * 100}%)`,
                                            }}
                                        />

                                        <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                            <span>0h</span>
                                            <span>{coachingMaxHours}h</span>
                                        </div>

                                        {coachingPackHoursUsed > 0 && (
                                            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                                <p className="text-xs text-purple-400 font-bold">
                                                    ✓ {coachingPackHoursUsed}h covered — you'll only pay for {reservationDuration - coachingPackHoursUsed}h
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={handleSkip}
                            className="flex-1 py-4 rounded-full font-black uppercase font-['Inter'] tracking-[0.1em] text-white/40 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white/60 transition-all duration-300"
                        >
                            Skip — No Pack
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={!hasAnyActivation}
                            className={`flex-1 py-4 rounded-full font-black uppercase font-['Inter'] tracking-[0.1em] transition-all duration-300 ${
                                hasAnyActivation
                                    ? "bg-[#1CF3CA] text-black hover:shadow-[0_0_30px_rgba(28,243,202,0.3)] hover:scale-[1.02] active:scale-95"
                                    : "bg-white/5 text-white/20 cursor-not-allowed"
                            }`}
                        >
                            Apply & Continue
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
