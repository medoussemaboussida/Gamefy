export default function StepCoachSelection({ coaches, coachLoading, selectedCoachId, setSelectedCoachId, selectedGame, setStep, setSelectedDate, setStartTime, setEndTime, setSelectedPcIds, setPcs }) {
    return (
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
                                // If selecting a different coach, reset calendar/time/PCs
                                if (coach.id !== selectedCoachId) {
                                    setSelectedDate(null);
                                    setStartTime("");
                                    setEndTime("");
                                    setSelectedPcIds([]);
                                    setPcs([]);
                                }
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
    );
}
