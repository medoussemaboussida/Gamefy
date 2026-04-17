import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Clock, Percent, ArrowRight, Zap, Gift, Check } from "lucide-react";
import { getMyPackBenefits } from "../../../api/reservation";

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
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const reservationDuration = (Number(endTime) - Number(startTime)) / 60;

    useEffect(() => {
        const fetchBenefits = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getMyPackBenefits(reservationType);
                setPackBenefits(data);
            } catch (e) {
                setError("Failed to load pack benefits");
                setPackBenefits(null);
            } finally {
                setLoading(false);
            }
        };
        fetchBenefits();
    }, [reservationType]);

    const maxUsableHours = packBenefits
        ? Math.min(packBenefits.remainingHours || 0, reservationDuration)
        : 0;

    const hasHours = packBenefits?.remainingHours > 0;
    const hasDiscount = packBenefits?.discounts && packBenefits.discounts.length > 0;

    const canActivate = hasHours || hasDiscount;

    const handleHoursChange = (value) => {
        const hours = Math.min(Math.max(0, parseFloat(value) || 0), maxUsableHours);
        // Round to nearest 0.5
        const rounded = Math.round(hours * 2) / 2;
        setPackHoursUsed(rounded);
    };

    const handleSkip = () => {
        setPackHoursUsed(0);
        setSelectedDiscounts([]);
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
                    Use your Pack Gamefy benefits for this reservation
                </p>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="w-12 h-12 border-4 border-[#1CF3CA]/20 border-t-[#1CF3CA] rounded-full animate-spin" />
                    <p className="text-white/30 text-sm font-black font-['Inter'] uppercase tracking-widest">Loading pack benefits...</p>
                </div>
            ) : error ? (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                    <button onClick={handleSkip} className="mt-4 text-[#1CF3CA] font-bold text-sm uppercase tracking-wider hover:underline">
                        Skip to Checkout →
                    </button>
                </div>
            ) : !packBenefits?.hasActivePack ? (
                /* No active pack */
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
                        <p className="text-white/30 text-sm mt-2">You don't have an active Pack Gamefy. Proceed to checkout.</p>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="px-8 py-4 rounded-full font-black uppercase font-['Inter'] tracking-[0.15em] bg-[#1CF3CA] text-black hover:shadow-[0_0_30px_rgba(28,243,202,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                        Continue to Checkout
                    </button>
                </motion.div>
            ) : !canActivate ? (
                /* Has pack but no benefits for this room type */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-8 md:p-12 rounded-[32px] bg-[#320141]/60 backdrop-blur-xl border border-white/10 text-center space-y-6"
                >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1CF3CA]/10 flex items-center justify-center">
                        <Package size={32} className="text-[#1CF3CA]/40" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black font-['Inter'] uppercase text-white/80">{packBenefits.packName}</h3>
                        <p className="text-white/30 text-sm mt-2">
                            No remaining {roomLabel} benefits in your pack. You can still proceed without pack activation.
                        </p>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="px-8 py-4 rounded-full font-black uppercase font-['Inter'] tracking-[0.15em] bg-[#1CF3CA] text-black hover:shadow-[0_0_30px_rgba(28,243,202,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                        Continue to Checkout
                    </button>
                </motion.div>
            ) : (
                /* Has active pack with available benefits */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
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

                    {/* Free Hours Section */}
                    {hasHours && (
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
                                    <span className="text-sm font-black text-blue-400">{packHoursUsed}h / max {maxUsableHours}h</span>
                                </div>

                                <input
                                    type="range"
                                    min={0}
                                    max={maxUsableHours}
                                    step={0.5}
                                    value={packHoursUsed}
                                    onChange={(e) => handleHoursChange(e.target.value)}
                                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #1CF3CA ${(packHoursUsed / maxUsableHours) * 100}%, rgba(255,255,255,0.1) ${(packHoursUsed / maxUsableHours) * 100}%)`,
                                    }}
                                />

                                <div className="flex justify-between text-[10px] font-bold text-white/20 uppercase">
                                    <span>0h</span>
                                    <span>{maxUsableHours}h</span>
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
                    {hasDiscount && (
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
                            disabled={packHoursUsed === 0 && selectedDiscounts.length === 0}
                            className={`flex-1 py-4 rounded-full font-black uppercase font-['Inter'] tracking-[0.1em] transition-all duration-300 ${
                                packHoursUsed > 0 || selectedDiscounts.length > 0
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
