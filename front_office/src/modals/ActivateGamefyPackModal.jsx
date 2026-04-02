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
    maxApplicableHours = null,
    formatDate,
    formatTime,
    onConfirm,
    loading = false,
}) {
    if (!isOpen || !reservation) return null;

    const reduction = packGamefy?.price ? (packGamefy.price / 2) * discountCount : 0;
    const newPrice = Math.max(0, (reservation.priceTime || 0) - reduction);
    const effectiveHours = hoursCount > 0 && Number.isFinite(maxApplicableHours)
        ? Math.max(0, Math.min(hoursCount, maxApplicableHours))
        : hoursCount;
    const newEndTimeIso = effectiveHours > 0 ? addHoursToIsoUTC(reservation.endTime, effectiveHours) : null;
    const disableActivation = hoursCount > 0 && Number.isFinite(maxApplicableHours) && maxApplicableHours <= 0;

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
                                {hoursCount > 0 && effectiveHours > 0 && (
                                    <>
                                        {" "}
                                        <span className="text-[#1CF3CA]">
                                            (up to: {formatTime ? formatTime(newEndTimeIso) : ""})
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
                                Extra time from your pack is limited by platform closing time.
                            </div>
                        )}

                        {hoursCount > 0 && (
                            <div
                                className="rounded-xl p-3 mt-2 text-[11px] leading-relaxed text-white/75"
                                style={{ background: "rgba(28, 243, 202, 0.06)", border: "1px solid rgba(28, 243, 202, 0.18)" }}
                            >
                                If your reservation would pass the work schedule end time, only the hours that fit are applied.
                                <br />
                                Example: close at 05:00, booking 03:00 → 04:00, pack has 3 hours: only 1 hour is applied.
                            </div>
                        )}

                        {disableActivation && (
                            <div
                                className="rounded-xl p-3 mt-2 text-[11px] leading-relaxed text-red-300"
                                style={{ background: "rgba(220, 38, 38, 0.10)", border: "1px solid rgba(220, 38, 38, 0.30)" }}
                            >
                                You are in the last working hour. No extra pack hours can be applied for this reservation.
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => onConfirm?.()}
                        disabled={loading || disableActivation}
                        className="w-full py-4 rounded-2xl bg-[#DD00B8] text-white font-bold text-lg hover:bg-[#DD00B8]/90 transition-all shadow-[0_0_20px_rgba(255,0,184,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Activating..." : disableActivation ? "Cannot activate for this time slot" : "Confirm activation"}
                    </button>
                </div>
            </div>
        </div>
    );
}

