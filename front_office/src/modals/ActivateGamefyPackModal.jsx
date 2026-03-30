import React from "react";
import { X } from "lucide-react";

const toIsoUTC = (isoString) => (isoString?.includes("Z") ? isoString : isoString + "Z");

const addHoursToIsoUTC = (isoString, hours) => {
    const d = new Date(toIsoUTC(isoString));
    return new Date(d.getTime() + hours * 60 * 60 * 1000).toISOString();
};

export default function ActivateGamefyPackModal({
    isOpen,
    onClose,
    reservation,
    packGamefy,
    discountCount = 0,
    hoursCount = 0,
    formatDate,
    formatTime,
    onConfirm,
    loading = false,
}) {
    if (!isOpen || !reservation) return null;

    const reduction = packGamefy?.price ? (packGamefy.price / 2) * discountCount : 0;
    const newPrice = Math.max(0, (reservation.priceTime || 0) - reduction);
    const newEndTimeIso = hoursCount > 0 ? addHoursToIsoUTC(reservation.endTime, hoursCount) : null;

    return (
        <div
            className="fixed inset-0 z-[105] flex items-center justify-center p-4"
            style={{ background: "rgba(10, 0, 20, 0.85)", backdropFilter: "blur(12px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div
                className="relative w-full max-w-md rounded-[32px] overflow-hidden"
                style={{
                    background: "linear-gradient(145deg, #2a0045, #1a0030)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(28,243,202,0.05)",
                }}
            >
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #DD00B8, #1CF3CA)" }} />

                <div className="flex items-start justify-between px-8 pt-7 pb-3">
                    <div>
                        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#DD00B8]/60 mb-1">
                            Activate Gamefy Pack
                        </p>
                        <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                            {reservation.reservationType.replace("_", " ")}
                        </h2>
                    </div>
                    <button
                        onClick={() => onClose?.()}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                    >
                        <X size={16} className="text-white/60" />
                    </button>
                </div>

                <div className="px-8 pb-8 space-y-5">
                    <div
                        className="rounded-2xl p-4 space-y-2"
                        style={{ background: "rgba(221, 0, 184, 0.05)", border: "1px solid rgba(221, 0, 184, 0.12)" }}
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-white/30">Date</span>
                            <span className="text-xs font-bold text-white">
                                {formatDate ? formatDate(reservation.startTime) : ""}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-white/30">Time</span>
                            <span className="text-xs font-black text-white">
                                {formatTime ? `${formatTime(reservation.startTime)} → ${formatTime(reservation.endTime)}` : ""}
                                {hoursCount > 0 && (
                                    <>
                                        {" "}
                                        <span className="text-[#1CF3CA]">
                                            (new: {formatTime ? formatTime(newEndTimeIso) : ""})
                                        </span>
                                    </>
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-white/10">
                            <span className="text-[10px] font-black uppercase text-[#1CF3CA]">Total</span>
                            <span className="text-lg font-black text-[#DD00B8] italic">
                                {newPrice.toFixed(3)} DT
                            </span>
                        </div>

                        {discountCount > 0 && (
                            <div className="text-[11px] text-white/60 pt-2">
                                Discount applied from your pack benefits
                            </div>
                        )}

                        {hoursCount > 0 && (
                            <div className="text-[11px] text-white/60">
                                Extra time applied from your pack benefits
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onConfirm?.()}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-[#DD00B8] text-white font-bold text-lg hover:bg-[#DD00B8]/90 transition-all shadow-[0_0_20px_rgba(255,0,184,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Activating..." : "Confirm activation"}
                    </button>
                </div>
            </div>
        </div>
    );
}

