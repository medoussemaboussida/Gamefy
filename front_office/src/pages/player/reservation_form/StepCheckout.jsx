import { motion } from "framer-motion";
import { ArrowRight, Percent, Clock } from "lucide-react";

const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

const toAMPM = (mins) => {
    const normalized = ((mins % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
};

export default function StepCheckout({
    setStep,
    reservationType,
    selectedDate,
    selectedGame,
    currentMonth,
    currentYear,
    startTime,
    endTime,
    timeSlots,
    selectedPcIds,
    activeOffer,
    packHoursUsed,
    selectedDiscounts,
    packBenefits,
    coachingPackHoursUsed,
    calculateTotalPrice,
    calculateSubtotal,
    handleSubmit,
    submitting,
    isEditMode,
}) {
    const startLabel = timeSlots.find(s => String(s.value) === String(startTime))?.label;
    const originalEndLabel = timeSlots.find(s => String(s.value) === String(endTime))?.label;

    return (
        <div className="space-y-8">
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setStep(6)}
                className="text-[#1CF3CA] hover:text-[#19d4b0] text-sm font-black font-['Inter'] uppercase tracking-[0.2em] flex items-center gap-2 group"
            >
                <span className="p-1 rounded-md bg-[#1CF3CA]/10 group-hover:bg-[#1CF3CA]/20 transition-colors">
                    <ArrowRight size={14} className="rotate-180" />
                </span>
                Back to Pack Activation
            </motion.button>

            <div className="flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full max-w-3xl p-8 md:p-12 rounded-[40px] bg-[#320141]/60 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl"
                >
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#1CF3CA]/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

                    <div className="relative z-10 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-1 bg-[#1CF3CA] rounded-full" />
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#1CF3CA]">Checkout</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase text-white/30">Entry</span>
                                        <span className="text-xs font-black text-white italic">{reservationType?.replace("_", " ")}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase text-white/30">Date</span>
                                        <span className="text-xs font-black text-white italic">{MONTHS[currentMonth]} {selectedDate}, {currentYear}</span>
                                    </div>
                                    {selectedGame && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-black uppercase text-white/30">Session</span>
                                            <span className="text-xs font-black text-[#1CF3CA] italic">{selectedGame}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase text-white/30">Duration</span>
                                        <span className="text-xs font-black text-white italic">
                                            {startLabel} — {originalEndLabel}
                                        </span>
                                    </div>

                                    {/* Pack Benefits Applied */}
                                    {(packHoursUsed > 0 || selectedDiscounts.length > 0 || coachingPackHoursUsed > 0) && (
                                        <div className="pt-2 border-t border-[#1CF3CA]/10 space-y-2">
                                            {packHoursUsed > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase text-blue-400 flex items-center gap-1">
                                                        <Clock size={10} /> Pack Covered Hours
                                                    </span>
                                                    <span className="text-[11px] font-black text-blue-400 italic">{packHoursUsed}h covered (free)</span>
                                                </div>
                                            )}
                                            {coachingPackHoursUsed > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase text-purple-400 flex items-center gap-1">
                                                        <Clock size={10} /> Coaching Pack Hours
                                                    </span>
                                                    <span className="text-[11px] font-black text-purple-400 italic">{coachingPackHoursUsed}h covered (free)</span>
                                                </div>
                                            )}
                                            {selectedDiscounts.map((disc, i) => (
                                                <div key={disc.id || i} className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase text-green-400">
                                                        {disc.discountType === 'PERCENTAGE' ? 'Pack % Discount' : 'Pack Fixed Discount'}
                                                    </span>
                                                    <span className="text-[11px] font-black text-green-400 italic">
                                                        {disc.discountType === 'PERCENTAGE'
                                                            ? `-${disc.discountValue}%`
                                                            : `-${disc.discountValue?.toFixed(3)} DT`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="pt-2 border-t border-dashed border-white/10 space-y-2">
                                        {activeOffer && activeOffer.reduction > 0 ? (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase text-white/30">Subtotal</span>
                                                    <span className="text-xs font-bold text-white/40 line-through italic">
                                                        {calculateSubtotal().toFixed(3)} DT
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                                                    <Percent size={10} className="text-green-400" />
                                                    <span className="text-[10px] font-black text-green-400 uppercase">
                                                        {activeOffer.offerName} — {activeOffer.reduction}% OFF
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase text-[#1CF3CA]">Final Price</span>
                                                    <span className="text-sm font-black text-[#1CF3CA] italic">
                                                        {calculateTotalPrice().toFixed(3)} DT
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase text-[#1CF3CA]">Estimated Total</span>
                                                <span className="text-sm font-black text-[#1CF3CA] italic">
                                                    {calculateTotalPrice().toFixed(3)} DT
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center py-6">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Units Reserved</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black italic tracking-tighter text-white">{selectedPcIds.length}</span>
                                        <span className="text-lg font-black italic text-[#1CF3CA] uppercase">PC{selectedPcIds.length !== 1 && 's'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={selectedPcIds.length === 0 || submitting}
                            className={`group relative w-full py-5 rounded-full font-black uppercase font-['Inter'] tracking-[0.15em] transition-all duration-500 overflow-hidden shadow-xl
                                ${selectedPcIds.length === 0 || submitting
                                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                                    : "bg-[#1CF3CA] text-black hover:shadow-[0_0_40px_rgba(28,243,202,0.3)] hover:scale-[1.02] active:scale-95"
                                }`}
                        >
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        <span>Initializing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{isEditMode ? 'Update Reservation' : 'Confirm'}</span>
                                    </>
                                )}
                            </div>

                            {/* Button Hover Glow */}
                            {!submitting && selectedPcIds.length > 0 && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
