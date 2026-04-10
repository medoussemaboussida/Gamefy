import streamingImg from "../../../assets/images/vip.png";
import gamingRoomImg from "../../../assets/images/room.png";
import coachingRoomImg from "../../../assets/images/coaching.png";
import { getAvailableGames } from "../../../api/reservation";

export default function StepRoomType({ reservationType, setReservationType, setStep, setAvailableGames }) {
    return (
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
    );
}
