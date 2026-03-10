import { useEffect } from "react";
import { Clock, X, Zap } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   selectedDate: number,
 *   currentMonth: number,
 *   currentYear: number,
 *   timeSlots: {label: string, value: number}[],
 *   scheduleOpen: string,
 *   scheduleClose: string,
 *   startTime: string,
 *   endTime: string,
 *   onSelectStart: (v: string) => void,
 *   onSelectEnd: (v: string) => void,
 *   onConfirm: () => void,
 *   loading: boolean,
 *   error: string
 * }} props
 */
export default function TimeSelectionModal({
    isOpen,
    onClose,
    selectedDate,
    currentMonth,
    currentYear,
    timeSlots,
    scheduleOpen,
    scheduleClose,
    startTime,
    endTime,
    onSelectStart,
    onSelectEnd,
    onConfirm,
    loading,
    error,
}) {
    // Close on Escape key
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen || !selectedDate) return null;

    const date = new Date(currentYear, currentMonth, selectedDate);
    const dayName = DAYS[date.getDay()];
    const monthName = MONTHS[currentMonth];

    const endSlots = startTime
        ? timeSlots.filter((s) => s.value > Number(startTime))
        : [];

    const startLabel = timeSlots.find((s) => s.value === Number(startTime))?.label;
    const endLabel = timeSlots.find((s) => s.value === Number(endTime))?.label;

    const durationMins = startTime && endTime ? Number(endTime) - Number(startTime) : 0;
    const durationHrs = Math.floor(durationMins / 60);
    const durationRem = durationMins % 60;
    const durationText = durationHrs > 0
        ? `${durationHrs}h${durationRem > 0 ? ` ${durationRem}m` : ""}`
        : `${durationRem}m`;

    const canConfirm = startTime && endTime && Number(endTime) > Number(startTime);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(10, 0, 20, 0.85)", backdropFilter: "blur(12px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-xl rounded-[32px] overflow-hidden"
                style={{
                    background: "linear-gradient(145deg, #2a0045, #1a0030)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(28,243,202,0.05)",
                }}
            >
                {/* Top gradient bar */}
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1CF3CA, #FF89EB)" }} />

                {/* Header */}
                <div className="flex items-start justify-between px-8 pt-7 pb-4">
                    <div>
                        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#1CF3CA]/60 mb-1">
                            Select Time Slot
                        </p>
                        <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                            {dayName},{" "}
                            <span className="text-[#1CF3CA]">{selectedDate}</span>{" "}
                            {monthName} {currentYear}
                        </h2>
                        <p className="text-white/30 text-xs mt-1 font-medium">
                            Open hours: {scheduleOpen} → {scheduleClose}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                    >
                        <X size={16} className="text-white/60" />
                    </button>
                </div>

                {/* Time picker body */}
                <div className="px-8 pb-8 space-y-6">

                    {/* Start Time */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-[#1CF3CA]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#1CF3CA]/80">Start Time</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                            {timeSlots.map((slot) => (
                                <button
                                    key={slot.value}
                                    onClick={() => { onSelectStart(String(slot.value)); onSelectEnd(""); }}
                                    className={`py-2.5 rounded-xl text-xs font-black transition-all border ${String(slot.value) === startTime
                                        ? "bg-[#1CF3CA] text-black border-transparent shadow-lg shadow-[#1CF3CA]/20"
                                        : "bg-white/[0.04] border-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {slot.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* End Time */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-[#FF89EB]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF89EB]/80">
                                End Time {!startTime && <span className="text-white/20 normal-case font-medium">(pick start first)</span>}
                            </span>
                        </div>
                        <div className={`grid grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar ${!startTime ? "opacity-40 pointer-events-none" : ""}`}>
                            {(startTime ? endSlots : timeSlots).map((slot) => (
                                <button
                                    key={slot.value}
                                    onClick={() => onSelectEnd(String(slot.value))}
                                    className={`py-2.5 rounded-xl text-xs font-black transition-all border ${String(slot.value) === endTime
                                        ? "bg-[#FF89EB] text-black border-transparent shadow-lg shadow-[#FF89EB]/20"
                                        : "bg-white/[0.04] border-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {slot.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration summary */}
                    {canConfirm && (
                        <div
                            className="flex items-center justify-between rounded-2xl px-6 py-4"
                            style={{
                                background: "rgba(28, 243, 202, 0.05)",
                                border: "1px solid rgba(28, 243, 202, 0.12)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-[#1CF3CA]" />
                                <span className="text-white/60 text-sm font-medium">
                                    {startLabel} → {endLabel}
                                </span>
                            </div>
                            <span className="font-black text-[#1CF3CA] text-sm">{durationText}</span>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                            {error}
                        </p>
                    )}

                    {/* Confirm button */}
                    <button
                        onClick={onConfirm}
                        disabled={!canConfirm || loading}
                        className={`w-full py-4 rounded-2xl font-black uppercase italic tracking-tighter text-sm transition-all ${canConfirm && !loading
                            ? "bg-[#1CF3CA] text-black shadow-[0_0_30px_rgba(28,243,202,0.3)] hover:shadow-[0_0_45px_rgba(28,243,202,0.5)] hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-white/5 text-white/20 cursor-not-allowed border border-white/10"
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Finding Available PCs...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <Zap size={16} />
                                Explore Available PCs
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
