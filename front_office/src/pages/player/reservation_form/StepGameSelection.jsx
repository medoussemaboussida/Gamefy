import { getCoachesByGame } from "../../../api/reservation";

export default function StepGameSelection({ availableGames, selectedGame, setSelectedGame, setCoaches, setCoachLoading, setStep, setError }) {
    return (
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
    );
}
