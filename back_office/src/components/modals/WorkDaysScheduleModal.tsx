import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { workDaysScheduleApi, WorkDaysScheduleDto } from "../../api/workDaysSchedule";
import toast from "react-hot-toast";

interface WorkDaysScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MONTHS = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

interface DaySchedule {
    day: string; // "MONDAY", "TUESDAY", etc.
    startTime: string; // "HH:mm AM/PM"
    endTime: string;   // "HH:mm AM/PM"
    isOpen: boolean;
}

const WorkDaysScheduleModal: React.FC<WorkDaysScheduleModalProps> = ({ isOpen, onClose }) => {
    const currentYear = new Date().getFullYear().toString();
    const [selectedMonth, setSelectedMonth] = useState<string>("OCTOBER");
    const [selectedYear] = useState<string>(currentYear);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Default schedule state
    const [schedules, setSchedules] = useState<DaySchedule[]>(
        DAYS.map(day => ({
            day,
            startTime: "12:00 PM",
            endTime: "02:00 AM",
            isOpen: true
        }))
    );

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const allSchedules = await workDaysScheduleApi.getAllSchedules();
            // Filter by BOTH month AND year to avoid cross-month contamination
            const filteredByMonth = allSchedules.filter(
                s => s.month === selectedMonth && s.year === selectedYear
            );

            const newSchedules = DAYS.map(dayName => {
                const existing = filteredByMonth.find(s => s.day === dayName);
                if (existing) {
                    return {
                        day: dayName,
                        startTime: formatTimeFromISO(existing.startTime),
                        endTime: formatTimeFromISO(existing.endTime),
                        isOpen: existing.status === "OPEN"
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
        } catch (error) {
            console.error("Failed to fetch schedules", error);
        } finally {
            setLoading(false);
        }
    };

    // Convert UTC time from backend → local display time (12h format)
    const formatTimeFromISO = (isoTime: string): string => {
        const [hours, minutes] = isoTime.split(':').map(Number);
        // Convert UTC to local: add timezone offset
        const offsetMinutes = new Date().getTimezoneOffset(); // e.g. -60 for UTC+1
        let localHours = hours - Math.floor(offsetMinutes / 60);
        if (localHours < 0) localHours += 24;
        if (localHours >= 24) localHours -= 24;
        const ampm = localHours >= 12 ? 'PM' : 'AM';
        const displayHours = localHours % 12 || 12;
        return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    useEffect(() => {
        if (isOpen) {
            fetchSchedules();
        }
        // Reload whenever the modal opens OR the selected month changes
    }, [isOpen, selectedMonth]);

    const handleTimeChange = (dayIndex: number, field: "startTime" | "endTime", value: string) => {
        const newSchedules = [...schedules];
        newSchedules[dayIndex][field] = value;
        setSchedules(newSchedules);
    };

    const handleToggleOpen = (dayIndex: number) => {
        const newSchedules = [...schedules];
        newSchedules[dayIndex].isOpen = !newSchedules[dayIndex].isOpen;
        setSchedules(newSchedules);
    };

    // Convert local display time (12h format) → UTC for backend
    const formatTimeToLocalISO = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        // Convert local to UTC: subtract timezone offset
        const offsetMinutes = new Date().getTimezoneOffset(); // e.g. -60 for UTC+1
        let utcHours = hours + Math.floor(offsetMinutes / 60);
        if (utcHours < 0) utcHours += 24;
        if (utcHours >= 24) utcHours -= 24;
        return `${utcHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Logic to save multiple schedules or one summary schedule
            // Since entity has month/year, we save one per day?
            // Or just one schedule record for the month?
            // Based on the entity created: Integer id, String month, String year, LocalDateTime startTime, LocalDateTime endTime.
            // It looks like each record is a specific time slot.

            const promises = schedules.map(s => {
                const dto: WorkDaysScheduleDto = {
                    day: s.day,
                    month: selectedMonth,
                    year: selectedYear,
                    startTime: formatTimeToLocalISO(s.startTime),
                    endTime: formatTimeToLocalISO(s.endTime),
                    status: s.isOpen ? "OPEN" : "CLOSED"
                };
                return workDaysScheduleApi.createSchedule(dto);
            });

            await Promise.all(promises);
            toast.success("Schedule saved successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save schedule.");
        } finally {
            setSaving(false);
        }
    };

    const renderTimeDropdown = (dayIndex: number, field: "startTime" | "endTime", currentValue: string) => {
        // Simplified time picker for demonstration, usually a custom component would be better
        return (
            <div className="relative group">
                <select
                    value={currentValue}
                    onChange={(e) => handleTimeChange(dayIndex, field, e.target.value)}
                    className="appearance-none bg-transparent border border-brand-500/30 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-500 w-32 cursor-pointer"
                >
                    {Array.from({ length: 24 }).map((_, h) => {
                        const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
                        const ampm = h < 12 ? "AM" : "PM";
                        const time = `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
                        return <option key={time} value={time} className="bg-white dark:bg-gray-900">{time}</option>;
                    })}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-0 overflow-hidden bg-white dark:bg-[#0B0E14] border-none">
            <div className="p-6 sm:p-8 flex flex-col gap-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                    Edit Monthly Weekly Schedule
                </h3>

                {/* Month Picker */}
                <div className="flex flex-wrap gap-2">
                    {MONTHS.map(month => (
                        <button
                            key={month}
                            onClick={() => setSelectedMonth(month)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedMonth === month
                                ? "bg-brand-500 text-black border-brand-500 shadow-lg shadow-brand-500/20"
                                : "bg-transparent text-brand-500 border-brand-500/30 hover:border-brand-500"
                                }`}
                        >
                            {month}
                        </button>
                    ))}
                </div>

                <h4 className="text-brand-500 font-bold text-lg mt-2 capitalize">
                    {selectedMonth.toLowerCase()}
                </h4>

                {/* Schedule Rows */}
                <div className="flex flex-col gap-4 min-h-[300px] justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-500">Loading schedule...</p>
                        </div>
                    ) : (
                        schedules.map((schedule, idx) => (
                            <div key={schedule.day} className="flex items-center justify-between gap-4">
                                <span className="w-24 font-medium text-gray-700 dark:text-gray-300">
                                    {schedule.day}
                                </span>

                                <div className={`flex items-center gap-4 transition-opacity ${!schedule.isOpen ? "opacity-30 pointer-events-none" : ""}`}>
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
                                            ? "bg-brand-500 border-brand-500"
                                            : "bg-transparent border-gray-400 dark:border-gray-600"
                                            }`}>
                                            {schedule.isOpen && (
                                                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-500 transition-colors">
                                        Open
                                    </span>
                                </label>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4">
                    <Button
                        variant="primary"
                        className="w-full bg-brand-500 hover:bg-brand-600 text-black font-bold h-12 rounded-xl"
                        onClick={handleSave}
                        loading={saving}
                    >
                        Save Schedule
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default WorkDaysScheduleModal;
