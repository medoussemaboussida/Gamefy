import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkSchedule, getAvailablePCs, createReservation } from "../../api/reservation";

const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const scrollbarStyle = `
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(28, 243, 202, 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(28, 243, 202, 0.4);
}
`;

export default function ReservationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [reservationType, setReservationType] = useState(null);

    // Step 2
    const [selectedDate, setSelectedDate] = useState(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [schedules, setSchedules] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    // Step 3
    const [pcs, setPcs] = useState([]);
    const [selectedPcIds, setSelectedPcIds] = useState([]);
    const [pcLoading, setPcLoading] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // ─── Fetch work schedule when month changes ───
    useEffect(() => {
        if (step === 2) {
            fetchSchedule();
        }
    }, [step, currentMonth, currentYear]);

    const fetchSchedule = async () => {
        setScheduleLoading(true);
        try {
            const monthName = MONTHS[currentMonth];
            const data = await getWorkSchedule(monthName, String(currentYear));
            setSchedules(data);
        } catch (e) {
            setError("Failed to load schedule");
        } finally {
            setScheduleLoading(false);
        }
    };

    // ─── Calendar helpers ───
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const getScheduleForDay = (dayNum) => {
        const date = new Date(currentYear, currentMonth, dayNum);
        const dayName = DAY_NAMES[date.getDay()];
        const monthName = MONTHS[currentMonth];
        return schedules.find(s => s.day === dayName && s.month === monthName && s.year === String(currentYear));
    };

    const isDayOpen = (dayNum) => {
        const schedule = getScheduleForDay(dayNum);
        return schedule && schedule.status === "OPEN";
    };

    const isDayPast = (dayNum) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(currentYear, currentMonth, dayNum);
        return date < today;
    };

    const handleDayClick = (dayNum) => {
        if (!isDayOpen(dayNum) || isDayPast(dayNum)) return;
        setSelectedDate(dayNum);
        setStartTime("");
        setEndTime("");
    };

    // ─── Time helpers — convert UTC schedule ↔ local ───
    const getScheduleTimes = () => {
        if (!selectedDate) return { open: "", close: "" };
        const schedule = getScheduleForDay(selectedDate);
        if (!schedule) return { open: "", close: "" };

        // Backend stores UTC. Convert to local for display.
        const offset = new Date().getTimezoneOffset(); // minutes
        const parseTime = (t) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };
        const toHHMM = (mins) => {
            let h = Math.floor(((mins % 1440) + 1440) % 1440 / 60);
            let m = ((mins % 1440) + 1440) % 1440 % 60;
            return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        };

        const openMins = parseTime(schedule.startTime) - offset;
        const closeMins = parseTime(schedule.endTime) - offset;
        return { open: toHHMM(openMins), close: toHHMM(closeMins) };
    };

    const generateTimeSlots = () => {
        const { open, close } = getScheduleTimes();
        if (!open || !close) return [];
        const slots = [];
        const [oh, om] = open.split(":").map(Number);
        const [ch, cm] = close.split(":").map(Number);
        const start = oh * 60 + om;
        let end = ch * 60 + cm;

        if (end <= start) end += 1440;

        let current = start;
        while (current <= end) {
            const h = Math.floor((current % 1440) / 60);
            const m = current % 60;
            const label = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            slots.push({ label, value: current });
            current += 30;
        }
        return slots;
    };

    // ─── Step 2 → 3: Fetch available PCs ───
    const handleTimeConfirm = async () => {
        if (!startTime || !endTime) {
            setError("Please select both start and end time");
            return;
        }
        if (Number(startTime) >= Number(endTime)) {
            setError("End time must be after start time");
            return;
        }
        setError("");
        setPcLoading(true);

        const getUTC = (mins) => {
            const h = Math.floor((mins % 1440) / 60);
            const m = mins % 60;
            let date = new Date(currentYear, currentMonth, selectedDate, h, m);
            if (mins >= 1440) date.setDate(date.getDate() + 1);
            return date.toISOString().slice(0, 19);
        };

        const utcStart = getUTC(Number(startTime));
        const utcEnd = getUTC(Number(endTime));

        try {
            const data = await getAvailablePCs(utcStart, utcEnd, reservationType);
            setPcs(data);
            setSelectedPcIds([]);
            setStep(3);
        } catch (e) {
            setError(e.message || "Failed to load PCs");
        } finally {
            setPcLoading(false);
        }
    };

    const togglePcSelection = (id) => {
        setSelectedPcIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    // ─── Submit reservation ───
    const handleSubmit = async () => {
        if (selectedPcIds.length === 0) {
            setError("Please select at least one PC");
            return;
        }
        setError("");
        setSubmitting(true);

        const getUTC = (mins) => {
            const h = Math.floor((mins % 1440) / 60);
            const m = mins % 60;
            let date = new Date(currentYear, currentMonth, selectedDate, h, m);
            if (mins >= 1440) date.setDate(date.getDate() + 1);
            return date.toISOString().slice(0, 19);
        };

        try {
            await createReservation({
                reservationType,
                startTime: getUTC(Number(startTime)),
                endTime: getUTC(Number(endTime)),
                paymentType: "CASH_PAYMENT",
                pcIds: selectedPcIds,
            });
            setSuccess(true);
            setTimeout(() => navigate("/player/dashboard"), 2000);
        } catch (e) {
            setError(e.message || "Failed to create reservation");
        } finally {
            setSubmitting(false);
        }
    };

    // ─── RENDER ───
    const timeSlots = generateTimeSlots();
    const { open: scheduleOpen, close: scheduleClose } = getScheduleTimes();

    return (
        <div className="min-h-screen bg-[#24003E] text-white py-10 px-4 font-sans">
            <style>{scrollbarStyle}</style>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-[32px] md:text-[54px] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8] uppercase italic">
                        Book Your Session
                    </h1>
                    <p className="text-white/60 mt-2 font-medium">Reserve your gaming setup in just a few steps</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step === s ? "bg-[#1CF3CA] text-black shadow-lg shadow-[#1CF3CA]/30 scale-110" :
                                step > s ? "bg-[#1CF3CA]/20 text-[#1CF3CA] border border-[#1CF3CA]/30" :
                                    "bg-white/5 text-gray-500 border border-white/10"
                                }`}>
                                {step > s ? "✓" : s}
                            </div>
                            {s < 3 && <div className={`w-16 h-0.5 ${step > s ? "bg-[#1CF3CA]/50" : "bg-white/10"}`} />}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center">
                        🎉 Reservation created successfully! Redirecting...
                    </div>
                )}

                {/* ─── STEP 1: Room Type ─── */}
                {step === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { type: "PC_ROOM", label: "PC Room", icon: "🖥️", desc: "Standard gaming PCs with top-tier specs", color: "from-[#2BDFC8] to-blue-500" },
                            { type: "VIP_ROOM", label: "VIP Room", icon: "👑", desc: "Premium VIP setup with exclusive perks", color: "from-[#FF89EB] to-[#DD00B8]" },
                        ].map(({ type, label, icon, desc, color }) => (
                            <button
                                key={type}
                                onClick={() => { setReservationType(type); setStep(2); }}
                                className={`group relative p-8 rounded-2xl border transition-all duration-300 text-left overflow-hidden ${reservationType === type
                                    ? "border-[#1CF3CA] bg-[#1CF3CA]/5"
                                    : "border-white/10 bg-[#320141]/40 hover:border-white/20 hover:bg-[#320141]/60 shadow-xl"
                                    }`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                <div className="relative z-10">
                                    <span className="text-5xl block mb-4">{icon}</span>
                                    <h3 className="text-xl font-bold mb-2 uppercase italic tracking-tight">{label}</h3>
                                    <p className="text-white/40 text-sm">{desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* ─── STEP 2: Calendar + Time ─── */}
                {step === 2 && (
                    <div className="space-y-6">
                        <button onClick={() => { setStep(1); setSelectedDate(null); }} className="text-[#1CF3CA] hover:text-[#1CF3CA]/80 text-sm font-bold uppercase tracking-wider flex items-center gap-1 group">
                            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to room type
                        </button>

                        {/* Month Navigation */}
                        <div className="flex items-center justify-between bg-[#320141] rounded-xl p-4 border border-white/5 shadow-2xl">
                            <button onClick={() => {
                                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                                else setCurrentMonth(m => m - 1);
                                setSelectedDate(null);
                            }} className="text-[#1CF3CA] hover:bg-white/5 p-2 rounded-lg transition">‹</button>
                            <h3 className="text-lg font-black uppercase italic tracking-tight">{MONTHS[currentMonth]} {currentYear}</h3>
                            <button onClick={() => {
                                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                                else setCurrentMonth(m => m + 1);
                                setSelectedDate(null);
                            }} className="text-[#1CF3CA] hover:bg-white/5 p-2 rounded-lg transition">›</button>
                        </div>

                        {/* Calendar Grid */}
                        {scheduleLoading ? (
                            <div className="text-center py-12 text-gray-500">Loading schedule...</div>
                        ) : (
                            <div className="bg-[#320141] rounded-[30px] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-[30px] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
                                <div className="relative">
                                    <div className="grid grid-cols-7 gap-1 mb-4">
                                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-[#1CF3CA]/60 py-2">{d}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
                                            <div key={`empty-${i}`} />
                                        ))}
                                        {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
                                            const day = i + 1;
                                            const open = isDayOpen(day);
                                            const past = isDayPast(day);
                                            const selected = selectedDate === day;
                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => handleDayClick(day)}
                                                    disabled={!open || past}
                                                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 ${selected ? "bg-[#1CF3CA] text-black shadow-[0_0_20px_rgba(28,243,202,0.4)]" :
                                                        !open || past ? "text-white/10 cursor-not-allowed" :
                                                            "text-white/70 hover:bg-[#1CF3CA] hover:text-black cursor-pointer"
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-6 mt-8 text-[10px] font-black uppercase tracking-widest text-white/40">
                                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1CF3CA]" /> Selected</span>
                                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-white/10" /> Available</span>
                                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-white/5 opacity-30" /> Closed / Past</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Time Selection */}
                        {selectedDate && (
                            <div className="bg-[#320141] rounded-[30px] border border-white/5 p-8 space-y-8 shadow-2xl">
                                <div>
                                    <h4 className="text-xl font-black italic uppercase tracking-tight mb-1">
                                        Select Time
                                    </h4>
                                    <p className="text-sm text-white/40 font-medium">
                                        Playing on <span className="text-[#1CF3CA]">{MONTHS[currentMonth]} {selectedDate}, {currentYear}</span>
                                    </p>
                                    <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-black/20 rounded-full border border-white/5">
                                        <div className="w-2 h-2 rounded-full bg-[#1CF3CA] animate-pulse"></div>
                                        <span className="text-xs font-black uppercase tracking-widest text-[#1CF3CA]/80">
                                            Open hours: {scheduleOpen} — {scheduleClose}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-white/40 mb-4 uppercase tracking-[0.2em] ml-1">Start Time</label>
                                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border-l-2 border-white/5 pl-4 custom-scrollbar">
                                            {timeSlots.slice(0, -1).map(slot => (
                                                <button
                                                    key={slot.value}
                                                    onClick={() => { setStartTime(slot.value); setEndTime(""); }}
                                                    className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${Number(startTime) === slot.value
                                                            ? "bg-[#1CF3CA] text-black border-[#1CF3CA] shadow-[0_0_20px_rgba(28,243,202,0.3)]"
                                                            : "bg-white/5 text-white/60 border-transparent hover:border-[#1CF3CA]/30 hover:text-white"
                                                        }`}
                                                >
                                                    {slot.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {startTime && (
                                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                            <label className="block text-[10px] font-black text-white/40 mb-4 uppercase tracking-[0.2em] ml-1">End Time</label>
                                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border-l-2 border-white/5 pl-4 custom-scrollbar">
                                                {timeSlots.filter(slot => slot.value > Number(startTime)).map(slot => (
                                                    <button
                                                        key={slot.value}
                                                        onClick={() => setEndTime(slot.value)}
                                                        className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${Number(endTime) === slot.value
                                                                ? "bg-[#FF89EB] text-black border-[#FF89EB] shadow-[0_0_20px_rgba(255,137,235,0.3)]"
                                                                : "bg-white/5 text-white/60 border-transparent hover:border-[#FF89EB]/30 hover:text-white"
                                                            }`}
                                                    >
                                                        {slot.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {startTime && endTime && (
                                        <div className="p-6 bg-gradient-to-r from-[#DD00B8]/10 to-[#1CF3CA]/10 border border-white/5 rounded-[24px] animate-in zoom-in-95 duration-500">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Duration Summary</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xl font-black italic uppercase tracking-tighter text-white">
                                                            {timeSlots.find(s => s.value === Number(startTime))?.label}
                                                        </span>
                                                        <div className="w-8 h-px bg-gradient-to-r from-[#FF89EB] to-[#1CF3CA]"></div>
                                                        <span className="text-xl font-black italic uppercase tracking-tighter text-white">
                                                            {timeSlots.find(s => s.value === Number(endTime))?.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black text-[#1CF3CA] uppercase tracking-widest block">Session Price</span>
                                                    <span className="text-2xl font-black text-white">Free Test</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleTimeConfirm}
                                    disabled={pcLoading || !startTime || !endTime}
                                    className="w-full py-5 rounded-full font-black uppercase tracking-[0.2em] text-black bg-[#1CF3CA] hover:bg-[#19d4b0] transition-all duration-500 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_30px_rgba(28,243,202,0.3)] hover:shadow-[0_0_40px_rgba(28,243,202,0.5)] active:scale-95"
                                >
                                    {pcLoading ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                                            <span>Scanning available systems...</span>
                                        </div>
                                    ) : (
                                        "Explore Available PCs →"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── STEP 3: PC Selection ─── */}
                {step === 3 && (
                    <div className="space-y-8">
                        <button onClick={() => setStep(2)} className="text-[#1CF3CA] hover:text-[#1CF3CA]/80 text-sm font-bold uppercase tracking-wider flex items-center gap-1 group">
                            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to time selection
                        </button>

                        <div className="bg-[#320141] rounded-[24px] border border-white/5 p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1CF3CA]/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
                            <div className="relative">
                                <p className="text-sm text-white font-bold uppercase italic tracking-wider mb-1">
                                    <span className="text-[#1CF3CA]">{reservationType === "PC_ROOM" ? "PC Room" : "VIP Room"}</span> —{" "}
                                    {MONTHS[currentMonth]} {selectedDate}, {currentYear}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#FF89EB]">
                                    {timeSlots.find(s => String(s.value) === String(startTime))?.label} to {timeSlots.find(s => String(s.value) === String(endTime))?.label} — {selectedPcIds.length} PCs selected
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {pcs.map((pc) => {
                                const isSelected = selectedPcIds.includes(pc.id);
                                return (
                                    <button
                                        key={pc.id}
                                        onClick={() => pc.available && togglePcSelection(pc.id)}
                                        disabled={!pc.available}
                                        className={`relative p-6 rounded-[30px] border transform transition-all duration-500 text-center group ${!pc.available
                                            ? "border-red-500/20 bg-red-500/5 opacity-40 cursor-not-allowed"
                                            : isSelected
                                                ? "border-[#1CF3CA] bg-[#1CF3CA]/10 shadow-[0_0_25px_rgba(28,243,202,0.15)] scale-105"
                                                : "border-white/5 bg-[#320141] hover:border-[#1CF3CA]/40 hover:scale-[1.02] shadow-xl"
                                            }`}
                                    >
                                        <div className={`text-4xl mb-3 transform transition-transform group-hover:scale-110 duration-500 ${isSelected ? "animate-pulse" : ""}`}>
                                            {reservationType === "VIP_ROOM" ? "👑" : "🖥️"}
                                        </div>
                                        <div className="font-black italic uppercase text-lg text-white tracking-tighter">PC #{pc.pcNumber}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">{pc.games}</div>

                                        {!pc.available && (
                                            <span className="absolute top-4 right-4 text-[8px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-black uppercase tracking-widest border border-red-500/30">
                                                Locked
                                            </span>
                                        )}
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#1CF3CA] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300">
                                                <span className="text-black text-[10px] font-black">✓</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {pcs.length === 0 && (
                            <div className="text-center py-12 text-gray-500">No PCs available for this room type.</div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || selectedPcIds.length === 0}
                            className="w-full py-5 rounded-full font-black text-[18px] uppercase tracking-[0.2em] text-black bg-[#1CF3CA] hover:bg-[#19d4b0] transition-all duration-500 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_40px_rgba(28,243,202,0.3)] hover:shadow-[0_0_50px_rgba(28,243,202,0.6)] active:scale-95 mt-10"
                        >
                            {submitting ? "Finalizing Order..." : `Confirm Session (${selectedPcIds.length} System${selectedPcIds.length !== 1 ? "s" : ""})`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
