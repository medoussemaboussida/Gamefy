import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, Plus, Monitor, Clock, Tag } from "lucide-react";
import { getMyReservations } from "../../api/reservation";
import Sidebar from "../../components/Sidebar";

const Rooms = () => {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const data = await getMyReservations();
            setReservations(data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        CONFIRMED: "bg-green-500/10 text-green-400 border-green-500/20",
        PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
        REJECTED: "bg-red-900/20 text-red-500 border-red-900/30",
    };

    const filteredReservations = reservations
        .filter((res) =>
            res.reservationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.pcNumbers.some(num => String(num).includes(searchTerm))
        )
        .sort((a, b) => {
            const dateA = new Date(a.startTime.includes('Z') ? a.startTime : a.startTime + 'Z');
            const dateB = new Date(b.startTime.includes('Z') ? b.startTime : b.startTime + 'Z');
            if (sortBy === "newest") return dateB - dateA;
            if (sortBy === "oldest") return dateA - dateB;
            return 0;
        });

    const formatTime = (isoString) => {
        const date = new Date(isoString.includes('Z') ? isoString : isoString + 'Z');
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString.includes('Z') ? isoString : isoString + 'Z');
        return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="flex min-h-screen bg-[#24003E] text-white">
            <Sidebar />

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-4xl font-black uppercase italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8]">
                                My Reservations
                            </h1>
                            <p className="text-white/50 mt-1 font-medium italic uppercase tracking-widest text-xs">Manage your upcoming gaming sessions</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate("/player/reservation")}
                                className="flex items-center gap-2 px-6 py-3 bg-[#1CF3CA] text-black font-black uppercase italic tracking-tighter rounded-full hover:bg-[#19d4b0] transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(28,243,202,0.3)]"
                            >
                                <Plus size={18} />
                                Book Now
                            </button>

                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#1CF3CA] transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search reservations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-[#320141] border border-white/5 pl-12 pr-6 py-3 rounded-full text-sm focus:outline-none focus:border-[#1CF3CA]/50 focus:ring-1 focus:ring-[#1CF3CA]/30 transition-all w-64 shadow-xl"
                                />
                            </div>

                            <div className="relative group">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-[#320141] border border-white/5 pl-6 pr-12 py-3 rounded-full text-sm font-black uppercase tracking-widest focus:outline-none focus:border-[#1CF3CA]/50 transition-all cursor-pointer shadow-xl"
                                >
                                    <option value="newest">Sort by newest</option>
                                    <option value="oldest">Sort by oldest</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1CF3CA]" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="bg-[#320141]/40 border border-white/5 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="w-12 h-12 border-4 border-[#1CF3CA]/20 border-t-[#1CF3CA] rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-white/40 font-black uppercase tracking-widest text-xs">Synchronizing with server...</p>
                            </div>
                        ) : filteredReservations.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#1CF3CA]/60">Details</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#1CF3CA]/60">Schedule</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#1CF3CA]/60">Hardware</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#1CF3CA]/60 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02]">
                                        {filteredReservations.map((res) => (
                                            <tr key={res.id} className="group hover:bg-white/[0.01] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${res.reservationType === 'VIP_ROOM' ? 'from-[#FF89EB] to-[#DD00B8]' : 'from-[#2BDFC8] to-blue-500'} shadow-lg shadow-black/20`}>
                                                            <Monitor size={24} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black italic uppercase tracking-tighter text-lg leading-tight">
                                                                Reservation By <span className="text-[#1CF3CA]">{res.playerName}</span>
                                                            </p>
                                                            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">
                                                                ID: #{String(res.id).padStart(5, '0')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-white/70 mb-1">
                                                        <Tag size={14} className="text-[#FF89EB]" />
                                                        <span className="text-sm font-bold uppercase tracking-tight">{formatDate(res.startTime)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-white/40">
                                                        <Clock size={14} className="text-[#1CF3CA]" />
                                                        <span className="text-xs font-black">From {formatTime(res.startTime)} To {formatTime(res.endTime)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {res.pcNumbers.map(num => (
                                                            <span key={num} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white/60">
                                                                PC #{num}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className={`inline-flex items-center px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusColors[res.status] || "bg-white/5 text-white border-white/10"}`}>
                                                        {res.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-20 text-center">
                                <Monitor className="mx-auto mb-6 text-white/10" size={64} />
                                <h3 className="text-xl font-black uppercase italic tracking-tight mb-2">No Sessions Found</h3>
                                <p className="text-white/30 text-sm max-w-xs mx-auto mb-8 font-medium">You haven't reserved any gaming slots yet. Start your journey today!</p>
                                <button
                                    onClick={() => navigate("/player/reservation")}
                                    className="px-8 py-4 bg-[#1CF3CA] text-black font-black uppercase italic tracking-tighter rounded-full hover:bg-[#19d4b0] transition-all shadow-xl"
                                >
                                    Create First Reservation
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Rooms;
