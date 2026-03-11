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

    const roomIcon = (type) => (
        <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br ${type === 'VIP_ROOM' ? 'from-[#FF89EB] to-[#DD00B8]' : 'from-[#2BDFC8] to-blue-500'} shadow-lg shadow-black/20`}>
            <Monitor size={20} className="text-white" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#24003E] text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

                    {/* ─── Header ─── */}
                    <div className="mb-8 md:mb-10">
                        {/* Title row */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                        <div className="pl-16 md:pl-0">
                                <h1 className="text-3xl md:text-3xl font-black uppercase italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8]">
                                    My Reservations
                                </h1>
                                <p className="text-white/40 mt-1 text-xs font-medium tracking-widest uppercase">
                                    Manage your upcoming gaming sessions
                                </p>
                            </div>

                            {/* Book Now — always visible, top-right on md+ */}
                            <button
                                onClick={() => navigate("/player/reservation")}
                                className="self-start md:self-auto flex items-center gap-2 px-5 py-3 bg-[#1CF3CA] text-black font-black uppercase text-sm tracking-tight rounded-full hover:bg-[#19d4b0] active:scale-95 transition-all shadow-[0_0_20px_rgba(28,243,202,0.3)]"
                            >
                                <Plus size={16} />
                                Book Now
                            </button>
                        </div>

                        {/* Search & Sort row */}
                        <div className="flex flex-col md:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#1CF3CA] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by type or PC number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#320141] border border-white/5 pl-11 pr-4 py-3 rounded-full text-sm focus:outline-none focus:border-[#1CF3CA]/50 focus:ring-1 focus:ring-[#1CF3CA]/30 transition-all shadow-xl"
                                />
                            </div>

                            {/* Sort */}
                            <div className="relative shrink-0">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none w-full md:w-auto bg-[#320141] border border-white/5 pl-5 pr-10 py-3 rounded-full text-sm font-black tracking-wide focus:outline-none focus:border-[#1CF3CA]/50 transition-all cursor-pointer shadow-xl"
                                >
                                    <option value="newest">Sort by newest</option>
                                    <option value="oldest">Sort by oldest</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1CF3CA] pointer-events-none" size={15} />
                            </div>
                        </div>
                    </div>

                    {/* ─── Content ─── */}
                    <div className="bg-[#320141]/40 border border-white/5 rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl">

                        {/* Loading */}
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-10 h-10 border-4 border-[#1CF3CA]/20 border-t-[#1CF3CA] rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white/40 font-black uppercase tracking-widest text-xs">Synchronizing with server...</p>
                            </div>

                        ) : filteredReservations.length > 0 ? (<>

                            {/* ── Desktop table (md+) ── */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-6 lg:px-8 py-5 text-[10px] font-black tracking-[0.2em] text-[#1CF3CA]/60 uppercase">Details</th>
                                            <th className="px-6 lg:px-8 py-5 text-[10px] font-black tracking-[0.2em] text-[#1CF3CA]/60 uppercase">Schedule</th>
                                            <th className="px-6 lg:px-8 py-5 text-[10px] font-black tracking-[0.2em] text-[#1CF3CA]/60 uppercase">Hardware</th>
                                            <th className="px-6 lg:px-8 py-5 text-[10px] font-black tracking-[0.2em] text-[#1CF3CA]/60 uppercase text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {filteredReservations.map((res) => (
                                            <tr key={res.id} className="hover:bg-white/[0.015] transition-colors">
                                                <td className="px-6 lg:px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        {roomIcon(res.reservationType)}
                                                        <span className="font-black italic uppercase text-base tracking-tight text-[#1CF3CA]">
                                                            {res.reservationType.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 lg:px-8 py-5">
                                                    <div className="flex items-center gap-2 text-white/70 mb-1">
                                                        <Tag size={13} className="text-[#FF89EB] shrink-0" />
                                                        <span className="text-sm font-bold">{formatDate(res.startTime)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-white/40">
                                                        <Clock size={13} className="text-[#1CF3CA] shrink-0" />
                                                        <span className="text-xs font-black">{formatTime(res.startTime)} → {formatTime(res.endTime)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 lg:px-8 py-5">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {res.pcNumbers.map(num => (
                                                            <span key={num} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-black text-white/60">
                                                                PC #{num}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 lg:px-8 py-5 text-right">
                                                    <span className={`inline-flex items-center px-5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusColors[res.status] || "bg-white/5 text-white border-white/10"}`}>
                                                        {res.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Mobile cards (< md) ── */}
                            <div className="md:hidden divide-y divide-white/[0.04]">
                                {filteredReservations.map((res) => (
                                    <div key={res.id} className="p-4 sm:p-5 space-y-3">
                                        {/* Top row: icon + type + status badge */}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {roomIcon(res.reservationType)}
                                                <span className="font-black italic uppercase text-sm tracking-tight text-[#1CF3CA] truncate">
                                                    {res.reservationType.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusColors[res.status] || "bg-white/5 text-white border-white/10"}`}>
                                                {res.status}
                                            </span>
                                        </div>

                                        {/* Date & time */}
                                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                                            <div className="flex items-center gap-1.5 text-white/70">
                                                <Tag size={12} className="text-[#FF89EB]" />
                                                <span className="text-xs font-bold">{formatDate(res.startTime)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-white/40">
                                                <Clock size={12} className="text-[#1CF3CA]" />
                                                <span className="text-xs font-black">{formatTime(res.startTime)} → {formatTime(res.endTime)}</span>
                                            </div>
                                        </div>

                                        {/* PCs */}
                                        {res.pcNumbers.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {res.pcNumbers.map(num => (
                                                    <span key={num} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-black text-white/60">
                                                        PC #{num}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                        </>) : (
                            /* Empty state */
                            <div className="py-16 sm:py-24 text-center px-6">
                                <Monitor className="mx-auto mb-5 text-white/10" size={56} />
                                <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tight mb-2">No Sessions Found</h3>
                                <p className="text-white/30 text-sm max-w-xs mx-auto mb-8 font-medium">
                                    You haven't reserved any gaming slots yet. Start your journey today!
                                </p>
                                <button
                                    onClick={() => navigate("/player/reservation")}
                                    className="px-8 py-4 bg-[#1CF3CA] text-black font-black uppercase italic tracking-tighter rounded-full hover:bg-[#19d4b0] active:scale-95 transition-all shadow-xl"
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
