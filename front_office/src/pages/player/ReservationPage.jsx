import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkSchedule, getAvailablePCs, createReservation, getCoachSessions, getAllFixedPrices, getActiveOffer } from "../../api/reservation";
import TimeSelectionModal from "../../modals/TimeSelectionModal";

import StepRoomType from "./reservation_form/StepRoomType";
import StepGameSelection from "./reservation_form/StepGameSelection";
import StepCoachSelection from "./reservation_form/StepCoachSelection";
import StepCalendarTime from "./reservation_form/StepCalendarTime";
import StepPcSelection from "./reservation_form/StepPcSelection";

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

        const fullHours = Math.floor(durationHours);
        const hasHalfHour = durationHours % 1 !== 0;
        let baseGamingPrice = 0;

        if (fullHours >= 4) {
            baseGamingPrice = pricing.oneHourPrice * fullHours;
            if (hasHalfHour) baseGamingPrice += (pricing.oneHourPrice * 0.5);
        } else if (fullHours === 3) {
            baseGamingPrice = pricing.threeHoursPrice;
            if (hasHalfHour) baseGamingPrice += (pricing.threeHoursPrice * 0.5);
        } else if (fullHours === 2) {
            baseGamingPrice = pricing.twoHoursPrice;
            if (hasHalfHour) baseGamingPrice += (pricing.twoHoursPrice * 0.5);
        } else if (fullHours === 1) {
            baseGamingPrice = pricing.oneHourPrice;
            if (hasHalfHour) baseGamingPrice += (pricing.oneHourPrice * 0.5);
        } else if (fullHours === 0 && hasHalfHour) {
            baseGamingPrice = pricing.oneHourPrice * 0.5;
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

        const fullHours = Math.floor(durationHours);
        const hasHalfHour = durationHours % 1 !== 0;
        let baseGamingPrice = 0;

        if (fullHours >= 4) {
            baseGamingPrice = pricing.oneHourPrice * fullHours;
            if (hasHalfHour) baseGamingPrice += (pricing.oneHourPrice * 0.5);
        } else if (fullHours === 3) {
            baseGamingPrice = pricing.threeHoursPrice;
            if (hasHalfHour) baseGamingPrice += (pricing.threeHoursPrice * 0.5);
        } else if (fullHours === 2) {
            baseGamingPrice = pricing.twoHoursPrice;
            if (hasHalfHour) baseGamingPrice += (pricing.twoHoursPrice * 0.5);
        } else if (fullHours === 1) {
            baseGamingPrice = pricing.oneHourPrice;
            if (hasHalfHour) baseGamingPrice += (pricing.oneHourPrice * 0.5);
        } else if (fullHours === 0 && hasHalfHour) {
            baseGamingPrice = pricing.oneHourPrice * 0.5;
        }

        const totalGamingPrice = baseGamingPrice * selectedPcIds.length;
        let coachingFee = 0;
        if (reservationType === "COACHING_ROOM" && selectedCoachId) {
            const coach = coaches.find(c => c.id === selectedCoachId);
            if (coach) coachingFee = coach.hourlyPrice * durationHours;
        }
        return totalGamingPrice + coachingFee;
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
                        <StepRoomType
                            reservationType={reservationType}
                            setReservationType={setReservationType}
                            setStep={setStep}
                            setAvailableGames={setAvailableGames}
                        />
                    )}

                    {/* ─── STEP 2: Game Selection (Coaching Only) ─── */}
                    {step === 2 && (
                        <StepGameSelection
                            availableGames={availableGames}
                            selectedGame={selectedGame}
                            setSelectedGame={setSelectedGame}
                            setCoaches={setCoaches}
                            setCoachLoading={setCoachLoading}
                            setStep={setStep}
                            setError={setError}
                        />
                    )}

                    {/* ─── STEP 3: Coach Selection (Coaching Only) ─── */}
                    {step === 3 && (
                        <StepCoachSelection
                            coaches={coaches}
                            coachLoading={coachLoading}
                            selectedCoachId={selectedCoachId}
                            setSelectedCoachId={setSelectedCoachId}
                            selectedGame={selectedGame}
                            setStep={setStep}
                        />
                    )}

                    {/* ─── STEP 4: Calendar + Time ─── */}
                    {step === 4 && (
                        <StepCalendarTime
                            reservationType={reservationType}
                            setStep={setStep}
                            currentMonth={currentMonth}
                            setCurrentMonth={setCurrentMonth}
                            currentYear={currentYear}
                            setCurrentYear={setCurrentYear}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            startTime={startTime}
                            endTime={endTime}
                            scheduleLoading={scheduleLoading}
                            isDayOpen={isDayOpen}
                            isDayPast={isDayPast}
                            handleDayClick={handleDayClick}
                            getDaysInMonth={getDaysInMonth}
                            getFirstDayOfMonth={getFirstDayOfMonth}
                            timeSlots={timeSlots}
                            handleTimeConfirm={handleTimeConfirm}
                            pcLoading={pcLoading}
                            setIsTimeModalOpen={setIsTimeModalOpen}
                        />
                    )}

                    {/* ─── STEP 5: PC Selection ─── */}
                    {step === 5 && (
                        <StepPcSelection
                            pcs={pcs}
                            pcLoading={pcLoading}
                            selectedPcIds={selectedPcIds}
                            togglePcSelection={togglePcSelection}
                            setStep={setStep}
                            reservationType={reservationType}
                            selectedDate={selectedDate}
                            selectedGame={selectedGame}
                            currentMonth={currentMonth}
                            currentYear={currentYear}
                            startTime={startTime}
                            endTime={endTime}
                            timeSlots={timeSlots}
                            activeOffer={activeOffer}
                            calculateTotalPrice={calculateTotalPrice}
                            calculateSubtotal={calculateSubtotal}
                            handleSubmit={handleSubmit}
                            submitting={submitting}
                        />
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
