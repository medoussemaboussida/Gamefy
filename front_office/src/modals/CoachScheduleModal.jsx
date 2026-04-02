import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { coachingSessionApi } from "../api/CoachingSession";
import { getWorkSchedule } from "../api/reservation";
import { getUserId } from "../utils/jwt";
import toast from "react-hot-toast";

const MONTHS = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const CoachScheduleModal = ({ isOpen, onClose }) => {
    const [selectedMonth, setSelectedMonth] = useState("JANUARY");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [platformScheduleByDay, setPlatformScheduleByDay] = useState({});

    const [schedules, setSchedules] = useState(
        DAYS.map(day => ({
            day,
            startTime: "12:00 PM",
            endTime: "02:00 AM",
            isOpen: true
        }))
    );

    const coachId = getUserId();

    const utcIsoToLocalHour = (isoTime) => {
        if (!isoTime) return 0;
        const [hours = 0, minutes = 0, seconds = 0] = isoTime.split(":").map(Number);
        const utcDate = new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
        return utcDate.getHours();
    };

    // Backend returns UTC time (HH:mm:ss). Convert to local display time (12h).
    const formatTimeFromISO = (isoTime) => hourToTime12h(utcIsoToLocalHour(isoTime));

    // Convert local display time (12h) to UTC HH:mm:ss for backend/database.
    const formatTimeToLocalISO = (time12h) => {
        if (!time12h) return "00:00:00";
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const localDate = new Date(1970, 0, 1, hours, minutes, 0);
        const utcHours = localDate.getUTCHours();
        const utcMinutes = localDate.getUTCMinutes();
        const utcSeconds = localDate.getUTCSeconds();
        return `${utcHours.toString().padStart(2, "0")}:${utcMinutes.toString().padStart(2, "0")}:${utcSeconds.toString().padStart(2, "0")}`;
    };

    const time12hToHour = (time12h) => {
        const [time, modifier] = time12h.split(" ");
        let [hours] = time.split(":").map(Number);
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return hours;
    };

    const hourToTime12h = (hour24) => {
        const hour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 < 12 ? "AM" : "PM";
        return `${hour.toString().padStart(2, "0")}:00 ${ampm}`;
    };

    const buildHourOptionsWithinInterval = (startTimeIso, endTimeIso) => {
        const startHour = utcIsoToLocalHour(startTimeIso);
        const endHour = utcIsoToLocalHour(endTimeIso);
        const options = [];
        let h = startHour;
        let guard = 0;
        while (true) {
            options.push(hourToTime12h(h));
            if (h === endHour) break;
            h = (h + 1) % 24;
            guard += 1;
            if (guard > 24) break;
        }
        return options;
    };

    const getDayHourOptions = (day) => {
        const schedule = platformScheduleByDay[day];
        if (!schedule || schedule.status !== "OPEN") return [];
        return buildHourOptionsWithinInterval(schedule.startTime, schedule.endTime);
    };

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const currentYear = new Date().getFullYear().toString();
            const [allSchedules, platformSchedules] = await Promise.all([
                coachingSessionApi.getSchedulesByCoach(coachId),
                getWorkSchedule(selectedMonth, currentYear),
            ]);
            const filteredByMonth = allSchedules.filter(s => s.month === selectedMonth);
            const platformByDay = platformSchedules.reduce((acc, item) => {
                acc[item.day] = item;
                return acc;
            }, {});
            setPlatformScheduleByDay(platformByDay);

            const newSchedules = DAYS.map(dayName => {
                const existing = filteredByMonth.find(s => s.day === dayName);
                const platformDay = platformByDay[dayName];
                const dayOptions = platformDay?.status === "OPEN"
                    ? buildHourOptionsWithinInterval(platformDay.startTime, platformDay.endTime)
                    : [];

                const defaultStart = dayOptions[0] || "12:00 PM";
                const defaultEnd = dayOptions[dayOptions.length - 1] || "12:00 PM";

                const existingStart = existing ? formatTimeFromISO(existing.startTime) : defaultStart;
                const existingEnd = existing ? formatTimeFromISO(existing.endTime) : defaultEnd;
                const validStart = dayOptions.includes(existingStart) ? existingStart : defaultStart;
                const validEnd = dayOptions.includes(existingEnd) ? existingEnd : defaultEnd;

                const isPlatformOpen = platformDay?.status === "OPEN";
                const isCoachOpen = existing ? existing.status === "AVAILABLE" : true;

                return {
                    day: dayName,
                    startTime: validStart,
                    endTime: validEnd,
                    isOpen: isPlatformOpen && isCoachOpen
                };
            });
            setSchedules(newSchedules);
        } catch (error) {
            console.error("Failed to fetch coaching schedules", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchSchedules();
        }
    }, [isOpen, selectedMonth]);

    const handleTimeChange = (dayIndex, field, value) => {
        const newSchedules = [...schedules];
        newSchedules[dayIndex][field] = value;
        setSchedules(newSchedules);
    };

    const handleToggleOpen = (dayIndex) => {
        const newSchedules = [...schedules];
        const day = newSchedules[dayIndex].day;
        const platformDay = platformScheduleByDay[day];
        if (!platformDay || platformDay.status !== "OPEN") return;
        newSchedules[dayIndex].isOpen = !newSchedules[dayIndex].isOpen;
        setSchedules(newSchedules);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const currentYear = new Date().getFullYear().toString();

            const promises = schedules.map(s => {
                const dayOptions = getDayHourOptions(s.day);
                const platformOpen = dayOptions.length > 0;
                const safeStart = dayOptions.includes(s.startTime) ? s.startTime : (dayOptions[0] || "12:00 PM");
                const safeEnd = dayOptions.includes(s.endTime) ? s.endTime : (dayOptions[dayOptions.length - 1] || "12:00 PM");

                const startHour = time12hToHour(safeStart);
                const endHour = time12hToHour(safeEnd);
                const status = platformOpen && s.isOpen && startHour !== endHour ? "AVAILABLE" : "NOT_AVAILABLE";

                const dto = {
                    day: s.day,
                    month: selectedMonth,
                    year: currentYear,
                    startTime: formatTimeToLocalISO(safeStart),
                    endTime: formatTimeToLocalISO(safeEnd),
                    status,
                    coachId: coachId
                };
                return coachingSessionApi.createSchedule(dto);
            });

            await Promise.all(promises);
            toast.success("Schedule saved successfully!", {
                style: {
                    border: "1px solid #1CF3CA",
                    padding: "16px",
                    color: "#1CF3CA",
                    background: "#24003E",
                },
            });
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to save schedule.", {
                style: {
                    border: "1px solid #DE3D3D",
                    padding: "16px",
                    color: "#DE3D3D",
                    background: "#360200",
                },
            });
        } finally {
            setSaving(false);
        }
    };

    const renderTimeDropdown = (dayIndex, field, currentValue) => {
        const dayName = schedules[dayIndex]?.day;
        const options = getDayHourOptions(dayName);
        const disabled = options.length === 0 || !schedules[dayIndex]?.isOpen;
        return (
            <div className="relative">
                <select
                    value={currentValue}
                    onChange={(e) => handleTimeChange(dayIndex, field, e.target.value)}
                    disabled={disabled}
                    className="appearance-none bg-[#24003E] border border-[#1CF3CA]/30 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#1CF3CA] w-32 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {options.map((time) => {
                        return <option key={time} value={time} className="bg-[#24003E]">{time}</option>;
                    })}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1CF3CA]/50">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-[700px] bg-gray-900/80 border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">
                        My Availability Schedule
                    </h2>
                    <p className="text-white/60 text-sm mt-1">
                        Set your available days and hours for coaching sessions.
                    </p>
                </div>

                {/* Month Picker */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {MONTHS.map(month => (
                        <button
                            key={month}
                            onClick={() => setSelectedMonth(month)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedMonth === month
                                ? "bg-[#1CF3CA] text-black border-[#1CF3CA] shadow-lg shadow-[#1CF3CA]/20"
                                : "bg-transparent text-[#1CF3CA] border-[#1CF3CA]/30 hover:border-[#1CF3CA]"
                                }`}
                        >
                            {month}
                        </button>
                    ))}
                </div>

                <h4 className="text-[#1CF3CA] font-bold text-lg mb-4 capitalize">
                    {selectedMonth.toLowerCase()}
                </h4>

                {/* Schedule Rows */}
                <div className="flex flex-col gap-4 mb-6">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3 py-12">
                            <Loader2 size={32} className="text-[#1CF3CA] animate-spin" />
                            <p className="text-sm text-white/50">Loading schedule...</p>
                        </div>
                    ) : (
                        schedules.map((schedule, idx) => {
                            const platformDay = platformScheduleByDay[schedule.day];
                            const isClosedByPlatform = !platformDay || platformDay.status !== "OPEN";
                            return (
                            <div key={schedule.day} className="flex items-center justify-between gap-4">
                                <span className="w-28 font-medium text-white/80 text-sm">
                                    {schedule.day}
                                </span>

                                <div className={`flex items-center gap-3 transition-opacity ${!schedule.isOpen ? "opacity-30 pointer-events-none" : ""}`}>
                                    {renderTimeDropdown(idx, "startTime", schedule.startTime)}
                                    {renderTimeDropdown(idx, "endTime", schedule.endTime)}
                                </div>

                                <label className={`flex items-center gap-2 group ${isClosedByPlatform ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={schedule.isOpen}
                                            onChange={() => handleToggleOpen(idx)}
                                            disabled={isClosedByPlatform}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 border-2 rounded transition-all ${schedule.isOpen
                                            ? "bg-[#1CF3CA] border-[#1CF3CA]"
                                            : "bg-transparent border-white/30"
                                            }`}>
                                            {schedule.isOpen && (
                                                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-white/70 group-hover:text-[#1CF3CA] transition-colors">
                                        {isClosedByPlatform ? "Closed by platform" : "Available"}
                                    </span>
                                </label>
                            </div>
                        )})
                    )}
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-12 bg-gradient-to-r from-[#DD00B8] to-[#1CF3CA] rounded-full text-white font-bold hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 size={20} className="animate-spin" /> : "Save Schedule"}
                </button>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(28, 243, 202, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(28, 243, 202, 0.4);
                }
            `}</style>
        </div>
    );
};

export default CoachScheduleModal;
