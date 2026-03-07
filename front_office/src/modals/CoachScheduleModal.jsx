import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { coachingSessionApi } from "../api/CoachingSession";
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

    const [schedules, setSchedules] = useState(
        DAYS.map(day => ({
            day,
            startTime: "12:00 PM",
            endTime: "02:00 AM",
            isOpen: true
        }))
    );

    const coachId = getUserId();

    const formatTimeFromISO = (isoTime) => {
        const [hours, minutes] = isoTime.split(":").map(Number);
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    };

    const formatTimeToLocalISO = (time12h) => {
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
    };

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const allSchedules = await coachingSessionApi.getSchedulesByCoach(coachId);
            const filteredByMonth = allSchedules.filter(s => s.month === selectedMonth);

            if (filteredByMonth.length > 0) {
                const newSchedules = DAYS.map(dayName => {
                    const existing = filteredByMonth.find(s => s.day === dayName);
                    if (existing) {
                        return {
                            day: dayName,
                            startTime: formatTimeFromISO(existing.startTime),
                            endTime: formatTimeFromISO(existing.endTime),
                            isOpen: existing.status === "AVAILABLE"
                        };
                    }
                    return {
                        day: dayName,
                        startTime: "12:00 PM",
                        endTime: "02:00 AM",
                        isOpen: true
                    };
                });
                setSchedules(newSchedules);
            } else {
                // Reset to defaults if no schedules for this month
                setSchedules(
                    DAYS.map(day => ({
                        day,
                        startTime: "12:00 PM",
                        endTime: "02:00 AM",
                        isOpen: true
                    }))
                );
            }
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
        newSchedules[dayIndex].isOpen = !newSchedules[dayIndex].isOpen;
        setSchedules(newSchedules);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const currentYear = new Date().getFullYear().toString();

            const promises = schedules.map(s => {
                const dto = {
                    day: s.day,
                    month: selectedMonth,
                    year: currentYear,
                    startTime: formatTimeToLocalISO(s.startTime),
                    endTime: formatTimeToLocalISO(s.endTime),
                    status: s.isOpen ? "AVAILABLE" : "NOT_AVAILABLE",
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
        return (
            <div className="relative">
                <select
                    value={currentValue}
                    onChange={(e) => handleTimeChange(dayIndex, field, e.target.value)}
                    className="appearance-none bg-[#24003E] border border-[#1CF3CA]/30 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#1CF3CA] w-32 cursor-pointer transition-all"
                >
                    {Array.from({ length: 24 }).map((_, h) => {
                        const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                        const ampm = h < 12 ? "AM" : "PM";
                        const time = `${hour.toString().padStart(2, "0")}:00 ${ampm}`;
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
                        schedules.map((schedule, idx) => (
                            <div key={schedule.day} className="flex items-center justify-between gap-4">
                                <span className="w-28 font-medium text-white/80 text-sm">
                                    {schedule.day}
                                </span>

                                <div className={`flex items-center gap-3 transition-opacity ${!schedule.isOpen ? "opacity-30 pointer-events-none" : ""}`}>
                                    {renderTimeDropdown(idx, "startTime", schedule.startTime)}
                                    {renderTimeDropdown(idx, "endTime", schedule.endTime)}
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={schedule.isOpen}
                                            onChange={() => handleToggleOpen(idx)}
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
                                        Available
                                    </span>
                                </label>
                            </div>
                        ))
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
