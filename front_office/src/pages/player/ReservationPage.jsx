import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkSchedule, getAvailablePCs, createReservation, getAvailableGames, getCoachesByGame, getCoachSessions, getAllFixedPrices, getActiveOffer } from "../../api/reservation";
import TimeSelectionModal from "../../modals/TimeSelectionModal";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Gamepad2, Check, ArrowRight, Info, Percent } from "lucide-react";
import streamingImg from "../../assets/images/streaming.png";
import gamingRoomImg from "../../assets/images/gaming_room.jpg";
import coachingRoomImg from "../../assets/images/event.png"; // Using event.png for coaching for now

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

    // Coaching Flow State
    const [availableGames, setAvailableGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [coaches, setCoaches] = useState([]);
    const [selectedCoachId, setSelectedCoachId] = useState(null);
    const [coachLoading, setCoachLoading] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [fixedPrices, setFixedPrices] = useState([]);
    const [pricingLoading, setPricingLoading] = useState(false);
    const [activeOffer, setActiveOffer] = useState(null);

    useEffect(() => {
        const fetchPrices = async () => {
            setPricingLoading(true);
            try {
                const data = await getAllFixedPrices();
                setFixedPrices(data);
            } catch (e) {
                console.error("Failed to fetch fixed prices", e);
            } finally {
                setPricingLoading(false);
            }
        };
        const fetchOffer = async () => {
            try {
                const data = await getActiveOffer();
                if (data) setActiveOffer(data);
            } catch (e) {
                // 204 No Content or error — no active offer
                setActiveOffer(null);
            }
        };
        fetchPrices();
        fetchOffer();
    }, []);

    // ─── Fetch work schedule when month changes ───
    useEffect(() => {
        if (step === 4) {
            fetchSchedule();
        }
    }, [step, currentMonth, currentYear, selectedCoachId]);

    const fetchSchedule = async () => {
        setScheduleLoading(true);
        setError("");
        try {
            if (reservationType === "COACHING_ROOM" && selectedCoachId) {
                // Fetch ONLY coach sessions
                const data = await getCoachSessions(selectedCoachId);
                // The coaching-sessions API returns all sessions for the coach. 
                // We filter them by month/year in the UI logic or here.
                setSchedules(data);
            } else if (reservationType !== "COACHING_ROOM") {
                // Fetch center work schedule
                const monthName = MONTHS[currentMonth];
                const data = await getWorkSchedule(monthName, String(currentYear));
                setSchedules(data);
            }
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

        if (reservationType === "COACHING_ROOM") {
            // Check if coach has ANY session on this day
            return schedules.find(s => 
                s.day === dayName && 
                s.month?.toUpperCase() === monthName && 
                s.year === String(currentYear) &&
                s.status === "AVAILABLE"
            );
        }

        return schedules.find(s => s.day === dayName && s.month === monthName && s.year === String(currentYear));
    };

    const isDayOpen = (dayNum) => {
        const schedule = getScheduleForDay(dayNum);
        return !!schedule && (reservationType === "COACHING_ROOM" ? true : schedule.status === "OPEN");
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
        setError("");
        setIsTimeModalOpen(true);
    };

    // ─── Time helpers — convert UTC schedule ↔ local ───
    const getScheduleTimes = () => {
        if (!selectedDate) return { open: "", close: "" };
        const schedule = getScheduleForDay(selectedDate);
        if (!schedule) return { open: "", close: "" };

        // Backend stores UTC (e.g., "10:00:00"). Convert to local for display.
        const offset = new Date().getTimezoneOffset(); // -60 for UTC+1
        const parseTime = (t) => {
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };
        const toHHMM = (mins) => {
            let h = Math.floor(((mins % 1440) + 1440) % 1440 / 60);
            let m = ((mins % 1440) + 1440) % 1440 % 60;
            return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        };

        const toAMPM = (mins) => {
            let h = Math.floor(((mins % 1440) + 1440) % 1440 / 60);
            let m = ((mins % 1440) + 1440) % 1440 % 60;
            const period = h >= 12 ? "PM" : "AM";
            const h12 = h % 12 || 12;
            return `${h12}:${String(m).padStart(2, "0")} ${period}`;
        };

        const openMins = parseTime(schedule.startTime) - offset;
        const closeMins = parseTime(schedule.endTime) - offset;
        return { 
            open: toHHMM(openMins), 
            close: toHHMM(closeMins),
            openFormatted: toAMPM(openMins),
            closeFormatted: toAMPM(closeMins)
        };
    };

    const generateTimeSlots = () => {
        const { open, close } = getScheduleTimes();
        if (!open || !close) return [];
        
        const toAMPM = (mins) => {
            let h = Math.floor(((mins % 1440) + 1440) % 1440 / 60);
            let m = ((mins % 1440) + 1440) % 1440 % 60;
            const period = h >= 12 ? "PM" : "AM";
            const h12 = h % 12 || 12;
            return `${h12}:${String(m).padStart(2, "0")} ${period}`;
        };

        const slots = [];
        const [oh, om] = open.split(":").map(Number);
        const [ch, cm] = close.split(":").map(Number);
        const start = oh * 60 + om;
        let end = ch * 60 + cm;

        if (end <= start) end += 1440;

        let current = start;
        while (current <= end) {
            slots.push({ label: toAMPM(current), value: current });
            current += 30;
        }
        return slots;
    };

    // ─── Step 4 → 5: Fetch available PCs ───
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

        const formatLocalToUTCISO = (mins) => {
            const offset = new Date().getTimezoneOffset();
            const utcMins = mins + offset;
            
            // We keep the selected date but shift the hours to UTC
            // This matches the symmetry of how sessions are saved
            const h = Math.floor(((utcMins % 1440) + 1440) % 1440 / 60);
            const m = ((utcMins % 1440) + 1440) % 1440 % 60;
            
            const pad = (n) => String(n).padStart(2, "0");
            return `${currentYear}-${pad(currentMonth + 1)}-${pad(selectedDate)}T${pad(h)}:${pad(m)}:00`;
        };

        const utcStart = formatLocalToUTCISO(Number(startTime));
        const utcEnd = formatLocalToUTCISO(Number(endTime));

        try {
            // Pass the selected game if coaching room
            const data = await getAvailablePCs(utcStart, utcEnd, reservationType, selectedGame);
            setPcs(data);
            setSelectedPcIds([]);
            setIsTimeModalOpen(false);
            setStep(5);
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

        const formatLocalToUTCISO = (mins) => {
            const offset = new Date().getTimezoneOffset();
            const utcMins = mins + offset;
            const h = Math.floor(((utcMins % 1440) + 1440) % 1440 / 60);
            const m = ((utcMins % 1440) + 1440) % 1440 % 60;
            const pad = (n) => String(n).padStart(2, "0");
            return `${currentYear}-${pad(currentMonth + 1)}-${pad(selectedDate)}T${pad(h)}:${pad(m)}:00`;
        };

        try {
            await createReservation({
                reservationType,
                startTime: formatLocalToUTCISO(Number(startTime)),
                endTime: formatLocalToUTCISO(Number(endTime)),
                pcIds: selectedPcIds,
                coachId: selectedCoachId,
                game: selectedGame,
                priceTime: calculateTotalPrice(),
            });
            setSuccess(true);
            setTimeout(() => navigate("/player/dashboard"), 2000);
        } catch (e) {
            setError(e.message || "Failed to create reservation");
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Pricing Logic ───
    const calculateTotalPrice = () => {
        if (!startTime || !endTime || fixedPrices.length === 0) return 0;

        const durationHours = (Number(endTime) - Number(startTime)) / 60;
        const pcPriceType = reservationType === "VIP_ROOM" ? "VIP" : "GAMING";
        const pricing = fixedPrices.find(p => p.pcType === pcPriceType);

        if (!pricing) return 0;

        const hours = Math.ceil(durationHours);
        let baseGamingPrice = 0;

        if (hours >= 4) {
            baseGamingPrice = pricing.oneHourPrice * hours;
        } else if (hours === 3) {
            baseGamingPrice = pricing.threeHoursPrice;
        } else if (hours === 2) {
            baseGamingPrice = pricing.twoHoursPrice;
        } else if (hours === 1) {
            baseGamingPrice = pricing.oneHourPrice;
        }

        const totalGamingPrice = baseGamingPrice * selectedPcIds.length;

        let coachingFee = 0;
        if (reservationType === "COACHING_ROOM" && selectedCoachId) {
            const coach = coaches.find(c => c.id === selectedCoachId);
            if (coach) {
                coachingFee = coach.hourlyPrice * durationHours;
            }
        }

        const subtotal = totalGamingPrice + coachingFee;

        // Apply active offer reduction
        if (activeOffer && activeOffer.reduction > 0) {
            return subtotal * (1 - activeOffer.reduction / 100);
        }

        return subtotal;
    };

    // Calculate subtotal before discount (for display purposes)
    const calculateSubtotal = () => {
        if (!startTime || !endTime || fixedPrices.length === 0) return 0;

        const durationHours = (Number(endTime) - Number(startTime)) / 60;
        const pcPriceType = reservationType === "VIP_ROOM" ? "VIP" : "GAMING";
        const pricing = fixedPrices.find(p => p.pcType === pcPriceType);
        if (!pricing) return 0;

        const hours = Math.ceil(durationHours);
        let baseGamingPrice = 0;
        if (hours >= 4) baseGamingPrice = pricing.oneHourPrice * hours;
        else if (hours === 3) baseGamingPrice = pricing.threeHoursPrice;
        else if (hours === 2) baseGamingPrice = pricing.twoHoursPrice;
        else if (hours === 1) baseGamingPrice = pricing.oneHourPrice;

        const totalGamingPrice = baseGamingPrice * selectedPcIds.length;
        let coachingFee = 0;
        if (reservationType === "COACHING_ROOM" && selectedCoachId) {
            const coach = coaches.find(c => c.id === selectedCoachId);
            if (coach) coachingFee = coach.hourlyPrice * durationHours;
        }
        return totalGamingPrice + coachingFee;
    };

    // PC Card Component for cleaner rendering
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
                {/* Background Clips & Decor - Moved here to prevent clipping the card border */}
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

                {/* Premium Border Overlay - Stays outside the overflow-hidden wrapper */}
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
                            <span className="truncate">{pc.games?.split(',')[0] || "All Games"}</span>
                        </div>
                    </div>
                </div>
            </motion.button>
        );
    };

    // ─── RENDER ───
    const timeSlots = generateTimeSlots();
    const { open: scheduleOpen, close: scheduleClose } = getScheduleTimes();

    return (
        <>
            <div className="min-h-screen bg-[#24003E] text-white py-10 px-4 font-sans">
                <style>{scrollbarStyle}</style>
                <div className={`mx-auto transition-all duration-500 ${step === 5 ? 'max-w-6xl' : 'max-w-4xl'}`}>
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-[32px] md:text-[51px] font-black font-['Inter'] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8] uppercase">
                            Book Your Session
                        </h1>
                        <p className="text-white/60 mt-2 font-normal font-['Inter']">Reserve your gaming setup in just a few steps</p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-10">
                        {[1, 2, 3, 4, 5].map((s) => {
                            // Skip game/coach steps in indicator if not coaching
                            if (reservationType !== "COACHING_ROOM" && (s === 2 || s === 3)) return null;
                            
                            // Map step number to label for clarity
                            const labels = { 1: "Room", 2: "Game", 3: "Coach", 4: "Time", 5: "PC" };
                            
                            return (
                                <div key={s} className="flex items-center gap-2">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-['Inter'] text-sm transition-all duration-300 ${step === s ? "bg-[#1CF3CA] text-black shadow-lg shadow-[#1CF3CA]/30 scale-110" :
                                            step > s ? "bg-[#1CF3CA]/20 text-[#1CF3CA] border border-[#1CF3CA]/30" :
                                                "bg-white/5 text-gray-500 border border-white/10"
                                            }`}>
                                            {step > s ? "✓" : s}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold font-['Inter'] tracking-tighter mt-1 text-white/40">{labels[s]}</span>
                                    </div>
                                    {(s < 5 && (reservationType === "COACHING_ROOM" || s === 1 || s >= 4)) && (
                                        <div className={`w-8 md:w-16 h-0.5 mt-[-15px] ${step > s ? "bg-[#1CF3CA]/50" : "bg-white/10"}`} />
                                    )}
                                </div>
                            );
                        })}
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { type: "PC_ROOM", label: "PC Room", img: gamingRoomImg, desc: "Standard gaming PCs with top-tier specs", color: "from-[#2BDFC8] to-blue-500" },
                                { type: "VIP_ROOM", label: "VIP Room", img: streamingImg, desc: "Premium VIP setup with exclusive perks", color: "from-[#FF89EB] to-[#DD00B8]" },
                                { type: "COACHING_ROOM", label: "Coaching", img: coachingRoomImg, desc: "Level up your game with professional coaches", color: "from-[#1CF3CA] to-[#DD00B8]" },
                            ].map(({ type, label, img, desc, color }) => (
                                <button
                                    key={type}
                                    onClick={async () => { 
                                        setReservationType(type); 
                                        if (type === "COACHING_ROOM") {
                                            setStep(2);
                                            // Pre-fetch games
                                            const games = await getAvailableGames();
                                            setAvailableGames(games);
                                        } else {
                                            setStep(4); 
                                        }
                                    }}
                                    className={`group relative p-6 rounded-2xl border transition-all duration-300 text-left overflow-hidden ${reservationType === type
                                        ? "border-[#1CF3CA] bg-[#1CF3CA]/5"
                                        : "border-white/10 bg-[#320141]/40 hover:border-white/20 hover:bg-[#320141]/60 shadow-xl"
                                        }`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                                    <div className="relative z-10">
                                        <div className="w-full h-32 mb-4 rounded-xl overflow-hidden border border-white/10 group-hover:border-[#1CF3CA]/30 transition-all">
                                            <img src={img} alt={label} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-1 uppercase font-['Inter'] tracking-tight ">{label}</h3>
                                        <p className="text-white/40 text-[12px] line-clamp-2">{desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ─── STEP 2: Game Selection (Coaching Only) ─── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <button onClick={() => setStep(1)} className="text-[#1CF3CA] hover:text-[#1CF3CA]/80 text-sm font-bold font-['Inter'] uppercase tracking-wider flex items-center gap-1 group">
                                <span className="transition-transform group-hover:-translate-x-1">←</span> Back
                            </button>
                            <h2 className="text-2xl font-black font-['Inter'] uppercase tracking-tight mb-4 text-[#1CF3CA]">Select Your Game</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {availableGames.map(game => (
                                    <button
                                        key={game}
                                        onClick={async () => {
                                            setSelectedGame(game);
                                            setCoachLoading(true);
                                            try {
                                                const data = await getCoachesByGame(game);
                                                setCoaches(data);
                                                setStep(3);
                                            } catch (e) {
                                                setError("Failed to load coaches");
                                            } finally {
                                                setCoachLoading(false);
                                            }
                                        }}
                                        className={`p-4 rounded-xl border text-center transition-all ${selectedGame === game ? "bg-[#1CF3CA] text-black" : "bg-white/5 border-white/10 hover:border-[#1CF3CA]/50"}`}
                                    >
                                        <span className="font-black font-['Inter'] uppercase text-sm">{game}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 3: Coach Selection (Coaching Only) ─── */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <button onClick={() => setStep(2)} className="text-[#1CF3CA] hover:text-[#1CF3CA]/80 text-sm font-bold font-['Inter'] uppercase tracking-wider flex items-center gap-1 group">
                                <span className="transition-transform group-hover:-translate-x-1">←</span> Back
                            </button>
                            <h2 className="text-2xl font-black font-['Inter'] uppercase tracking-tight mb-4 text-[#FF89EB]">Choose Your Coach</h2>
                            {coachLoading ? (
                                <div className="text-center py-10 text-white/40">Loading coaches...</div>
                            ) : coaches.length === 0 ? (
                                <div className="text-center py-10 text-white/40">No coaches available for {selectedGame} right now.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {coaches.map(coach => (
                                        <button
                                            key={coach.id}
                                            onClick={() => {
                                                setSelectedCoachId(coach.id);
                                                setStep(4);
                                            }}
                                            className={`p-6 rounded-2xl border text-left transition-all ${selectedCoachId === coach.id ? "bg-[#1CF3CA]/10 border-[#1CF3CA]" : "bg-[#320141]/40 border-white/10 hover:border-white/30"}`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg">{coach.name}</h3>
                                                <span className="text-[#1CF3CA] font-black">{Number(coach.hourlyPrice).toFixed(3)} DT/hr</span>
                                            </div>
                                            <p className="text-white/40 text-sm line-clamp-2">{coach.bio || "Pro player and expert coach."}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 4: Calendar + Time ─── */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <button 
                                onClick={() => { 
                                    if (reservationType === "COACHING_ROOM") setStep(3);
                                    else setStep(1); 
                                    setSelectedDate(null); 
                                }} 
                                className="text-[#1CF3CA] hover:text-[#1CF3CA]/80 text-sm font-bold font-['Inter'] uppercase tracking-wider flex items-center gap-1 group"
                            >
                                <span className="transition-transform group-hover:-translate-x-1">←</span> Back
                            </button>

                            {/* Month Navigation */}
                            <div className="flex items-center justify-between bg-[#320141] rounded-xl p-4 border border-white/5 shadow-2xl">
                                <button onClick={() => {
                                    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                                    else setCurrentMonth(m => m - 1);
                                    setSelectedDate(null);
                                }} className="text-[#1CF3CA] hover:bg-white/5 p-2 rounded-lg transition">‹</button>
                                <h3 className="text-lg font-black uppercase font-['Inter'] tracking-tight text-white">{MONTHS[currentMonth]} {currentYear}</h3>
                                <button onClick={() => {
                                    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                                    else setCurrentMonth(m => m + 1);
                                    setSelectedDate(null);
                                }} className="text-[#1CF3CA] hover:bg-white/5 p-2 rounded-lg transition">›</button>
                            </div>

                            {/* Calendar Grid */}
                            {scheduleLoading ? (
                                <div className="text-center py-12 text-gray-500">Loading availability...</div>
                            ) : (
                                <div className="bg-[#320141] rounded-[30px] border border-white/5 p-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-[30px] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
                                    <div className="relative">
                                        <div className="grid grid-cols-7 gap-1 mb-4">
                                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                                <div key={d} className="text-center text-[10px] font-black font-['Inter'] uppercase tracking-widest text-[#1CF3CA]/60 py-2">{d}</div>
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
                                                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-black font-['Inter'] transition-all duration-300 ${selected ? "bg-[#1CF3CA] text-black shadow-[0_0_20px_rgba(28,243,202,0.4)]" :
                                                            !open || past ? "text-white/10 cursor-not-allowed" :
                                                                "text-white/70 hover:bg-[#1CF3CA] hover:text-black cursor-pointer"
                                                            }`}
                                                    >
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center gap-6 mt-8 text-[10px] font-black font-['Inter'] uppercase tracking-widest text-white/40">
                                            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1CF3CA]" /> Selected</span>
                                            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-white/10" /> {reservationType === "COACHING_ROOM" ? "Coach Available" : "Open"}</span>
                                            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-white/5 opacity-30" /> {reservationType === "COACHING_ROOM" ? "No Session" : "Closed"} / Past</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Selected date indicator */}
                             {selectedDate && startTime && endTime && (
                                <button
                                    onClick={() => setIsTimeModalOpen(true)}
                                    className="w-full mt-6 flex items-center justify-between bg-[#320141] rounded-2xl border border-[#1CF3CA]/20 px-6 py-4 hover:border-[#1CF3CA]/40 transition-all group shadow-xl"
                                >
                                    <div>
                                        <p className="font-black font-['Inter'] uppercase text-white tracking-tight">
                                            {MONTHS[currentMonth]} {selectedDate} — {timeSlots.find(s => String(s.value) === String(startTime))?.label} → {timeSlots.find(s => String(s.value) === String(endTime))?.label}
                                        </p>
                                    </div>
                                    <span className="text-[#1CF3CA] text-xs font-black font-['Inter'] uppercase tracking-widest group-hover:underline">Edit ›</span>
                                </button>
                            )}

                            {selectedDate && startTime && endTime && (
                                <button
                                    onClick={handleTimeConfirm}
                                    disabled={pcLoading}
                                    className="w-full py-5 rounded-full font-black font-[inter] uppercase tracking-[0.2em] text-black bg-[#1CF3CA] hover:bg-[#19d4b0] transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(28,243,202,0.3)] hover:shadow-[0_0_40px_rgba(28,243,202,0.5)] active:scale-95"
                                >
                                    {pcLoading ? "Scanning available systems..." : "Explore Available PCs"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* ─── STEP 5: PC Selection ─── */}
                    {step === 5 && (
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
                    )}
                </div>
            </div>

            <TimeSelectionModal
                isOpen={isTimeModalOpen}
                onClose={() => setIsTimeModalOpen(false)}
                selectedDate={selectedDate}
                currentMonth={currentMonth}
                currentYear={currentYear}
                timeSlots={timeSlots}
                scheduleOpen={getScheduleTimes().openFormatted}
                scheduleClose={getScheduleTimes().closeFormatted}
                startTime={startTime}
                endTime={endTime}
                onSelectStart={setStartTime}
                onSelectEnd={setEndTime}
                onConfirm={handleTimeConfirm}
                loading={pcLoading}
                error={error}
            />
        </>
    );
}
