import { useEffect } from "react";
import { MapPin, Banknote, Clock, X } from "lucide-react";

export default function CashPaymentModal({ isOpen, onClose, reservation }) {
    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen || !reservation) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(10, 0, 20, 0.85)", backdropFilter: "blur(12px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-md rounded-[32px] overflow-hidden"
                style={{
                    background: "linear-gradient(145deg, #2a0045, #1a0030)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(28,243,202,0.05)",
                }}
            >
                {/* Top gradient bar */}
                <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1CF3CA, #FF89EB)" }} />

                {/* Header */}
                <div className="flex items-start justify-between px-8 pt-7 pb-3">
                    <div>
                        <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#1CF3CA]/60 mb-1">
                            Cash Payment
                        </p>
                        <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                            Pay at Location
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                    >
                        <X size={16} className="text-white/60" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 pb-8 space-y-5">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/20">
                            <Banknote size={36} className="text-green-400" />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="text-center space-y-2">
                        <p className="text-white/80 text-sm font-medium leading-relaxed">
                            Please visit our <span className="text-[#1CF3CA] font-black">gaming center</span> to complete your cash payment.
                        </p>
                        <p className="text-white/40 text-xs leading-relaxed">
                            Your reservation will remain pending until payment is received at our location. The reservation will expire in 24 hours if not confirmed.
                        </p>
                    </div>

                    {/* Amount */}
                    <div
                        className="rounded-2xl p-4 text-center"
                        style={{ background: "rgba(28, 243, 202, 0.05)", border: "1px solid rgba(28, 243, 202, 0.12)" }}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Amount Due</p>
                        <p className="text-2xl font-black text-[#1CF3CA] italic">
                            {reservation.priceTime?.toFixed(2) || "0.00"} DT
                        </p>
                    </div>

                    {/* Info items */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-white/50 text-xs">
                            <MapPin size={14} className="text-[#FF89EB] shrink-0" />
                            <span>Pay at our front desk during working hours</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/50 text-xs">
                            <Clock size={14} className="text-yellow-400 shrink-0" />
                            <span>Reservation expires in 24h if not paid</span>
                        </div>
                    </div>

                    {/* Got it button */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl font-black uppercase italic tracking-tighter text-sm bg-[#1CF3CA] text-black shadow-[0_0_30px_rgba(28,243,202,0.3)] hover:shadow-[0_0_45px_rgba(28,243,202,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Got It
                    </button>
                </div>
            </div>
        </div>
    );
}
