import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Gamepad2, Check, ArrowRight, Info } from "lucide-react";

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

            {/* Continue Button */}
            <button
                onClick={() => setStep(6)}
                disabled={selectedPcIds.length === 0}
                className={`w-full py-5 rounded-full font-black uppercase font-['Inter'] tracking-[0.15em] transition-all duration-500 shadow-xl
                    ${selectedPcIds.length === 0
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-[#1CF3CA] text-black hover:shadow-[0_0_40px_rgba(28,243,202,0.3)] hover:scale-[1.02] active:scale-95"
                    }`}
            >
                Continue — {selectedPcIds.length} PC{selectedPcIds.length !== 1 ? 's' : ''} Selected
            </button>
        </div>
    );
}
