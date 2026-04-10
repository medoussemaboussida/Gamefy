import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Gamepad2, Check, ArrowRight, Info, Percent } from "lucide-react";

const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

// PC Card Component
const PcCard = ({ pc, isSelected, onToggle }) => {
    return (
        <motion.button
            key={pc.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={pc.available ? { y: -5, scale: 1.02, transition: { duration: 0.2 } } : {}}
            whileTap={pc.available ? { scale: 0.98 } : {}}
            onClick={() => pc.available && onToggle(pc.id)}
            disabled={!pc.available}
            className={`group relative flex flex-col p-5 md:p-7 rounded-[24px] md:rounded-[32px] transition-all duration-500 overflow-visible min-h-[180px] md:min-h-[220px] ${
                !pc.available 
                    ? "opacity-20 cursor-not-allowed bg-white/2" 
                    : isSelected 
                        ? "bg-gradient-to-br from-[#1CF3CA]/20 to-[#1CF3CA]/5 shadow-[0_0_40px_rgba(28,243,202,0.15)]" 
                        : "bg-[#320141]/40 hover:bg-[#320141]/60"
            }`}
        >
            {/* Background Clips & Decor */}
            <div className="absolute inset-0 rounded-[24px] md:rounded-[32px] overflow-hidden pointer-events-none">
                {/* Glow Effect for Selected */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-br from-[#1CF3CA]/10 to-transparent z-10"
                        />
                    )}
                </AnimatePresence>
                
                {/* Decorative Elements */}
                <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-[#1CF3CA]/5 to-transparent rounded-full -mr-12 -mb-12 blur-2xl transition-opacity duration-1000 ${isSelected ? "opacity-100" : "opacity-0"} z-0`} />
            </div>

            {/* Premium Border Overlay */}
            <div className={`absolute inset-0 rounded-[24px] md:rounded-[32px] border-2 transition-all duration-500 pointer-events-none ${
                isSelected 
                    ? "border-[#1CF3CA] z-20" 
                    : "border-white/10 group-hover:border-[#1CF3CA]/40 z-20"
            }`} />

            <div className="flex justify-center items-start relative z-30 mb-4 md:mb-6">
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-colors duration-500 ${isSelected ? "bg-[#1CF3CA] text-black" : "bg-white/5 text-white/40 group-hover:text-[#1CF3CA] group-hover:bg-[#1CF3CA]/10"}`}>
                    <Monitor className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
                </div>
                {isSelected && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-[#1CF3CA] text-black rounded-full p-1"
                    >
                        <Check size={12} strokeWidth={4} />
                    </motion.div>
                )}
                {!pc.available && (
                    <div className="text-[9px] font-black uppercase tracking-tighter bg-red-500/20 text-red-500 px-2 py-1 rounded-md">
                        Busy
                    </div>
                )}
            </div>

            <div className="mt-auto relative z-30 flex flex-col items-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`text-lg md:text-2xl font-black italic tracking-tighter transition-colors duration-500 ${isSelected ? "text-[#1CF3CA]" : "text-white"}`}>
                        PC {pc.pcNumber}
                    </span>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-2 w-full">
                    <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-500 w-full max-w-[200px] ${
                        isSelected ? "bg-[#1CF3CA]/20 text-[#1CF3CA]" : "bg-white/5 text-white/40"
                    }`}>
                        <Gamepad2 size={12} />
                        <span className="truncate">
                            {Array.isArray(pc.games) 
                                ? (pc.games.length > 0 ? pc.games.join(", ").replace(/_/g, " ") : "All Games")
                                : (pc.games?.replace(/_/g, " ") || "All Games")}
                        </span>
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

export default function StepPcSelection({
    pcs,
    pcLoading,
    selectedPcIds,
    togglePcSelection,
    setStep,
    reservationType,
    selectedDate,
    selectedGame,
    currentMonth,
    currentYear,
    startTime,
    endTime,
    timeSlots,
    activeOffer,
    calculateTotalPrice,
    calculateSubtotal,
    handleSubmit,
    submitting,
}) {
    return (
        <div className="space-y-8">
            <motion.button 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setStep(4)} 
                className="text-[#1CF3CA] hover:text-[#19d4b0] text-sm font-black font-['Inter'] uppercase tracking-[0.2em] flex items-center gap-2 group"
            >
                <span className="p-1 rounded-md bg-[#1CF3CA]/10  group-hover:bg-[#1CF3CA]/20 transition-colors">
                    <ArrowRight size={14} className="rotate-180" />
                </span>
                Back to Schedule
            </motion.button>

            <div className="space-y-12">
                {/* Top: PC Grid Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black font-['Inter'] uppercase tracking-tighter text-white">
                                Select Your <span className="text-[#1CF3CA]">Station</span>
                            </h2>
                            <p className="text-white/40 text-xs mt-1 font-normal font-['Inter'] tracking-wide">Choose one or more available gaming rigs</p>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#1CF3CA] animate-pulse" />
                            <span className="text-[10px] font-black font-['Inter'] uppercase text-white/60">{pcs.filter(p => p.available).length} Live</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar pb-10 p-2 md:p-4">
                        {pcLoading ? (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-[#1CF3CA]/20 border-t-[#1CF3CA] rounded-full animate-spin" />
                                <p className="text-white/20 text-sm font-black font-['Inter'] uppercase tracking-widest">Scanning Network...</p>
                            </div>
                        ) : pcs.length === 0 ? (
                            <div className="col-span-full py-24 text-center bg-white/2 border border-dashed border-white/10 rounded-3xl">
                                <Info className="mx-auto text-white/10 mb-4" size={48} />
                                <p className="text-white/40 text-sm font-normal font-['Inter']">No gaming units found for this time slot.</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {pcs.map(pc => (
                                    <PcCard 
                                        key={pc.id} 
                                        pc={pc} 
                                        isSelected={selectedPcIds.includes(pc.id)} 
                                        onToggle={togglePcSelection} 
                                    />
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Bottom: Summary Section (Centered) */}
                <div className="flex justify-center pt-8">
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
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#1CF3CA]">Checkout</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-white/30">Entry</span>
                                            <span className="text-[11px] font-black text-white italic">{reservationType?.replace("_", " ")}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-white/30">Date</span>
                                            <span className="text-[11px] font-black text-white italic">{MONTHS[currentMonth]} {selectedDate}, {currentYear}</span>
                                        </div>
                                        {selectedGame && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase text-white/30">Session</span>
                                                <span className="text-[11px] font-black text-[#1CF3CA] italic">{selectedGame}</span>
                                            </div>
                                        )}
                                        <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase text-white/30">Duration</span>
                                            <span className="text-[11px] font-black text-white italic">
                                                {timeSlots.find(s => String(s.value) === String(startTime))?.label} — {timeSlots.find(s => String(s.value) === String(endTime))?.label}
                                            </span>
                                        </div>
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
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Units Reserved</span>
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
                                            <span >Confirm</span>
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
        </div>
    );
}
