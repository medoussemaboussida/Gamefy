const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

export default function StepCalendarTime({
    reservationType,
    setStep,
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    selectedDate,
    setSelectedDate,
    startTime,
    endTime,
    scheduleLoading,
    isDayOpen,
    isDayPast,
    handleDayClick,
    getDaysInMonth,
    getFirstDayOfMonth,
    timeSlots,
    handleTimeConfirm,
    pcLoading,
    setIsTimeModalOpen,
}) {
    return (
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
    );
}
