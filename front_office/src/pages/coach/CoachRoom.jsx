import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, Monitor, Clock, Tag, User, Filter } from "lucide-react";

import { getMyCoachingReservations } from "../../api/reservation";
import Sidebar from "../../components/Sidebar";
import Pagination from "../../components/pagination/Pagination";
import NotificationBell from "../../components/NotificationBell";

const CoachRoom = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("newest");
    const [isSortOpen, setIsSortOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const fetchReservations = useCallback(async () => {
        try {
            const data = await getMyCoachingReservations();
            setReservations(data);
        } catch (error) {
            console.error("Failed to fetch coaching reservations", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReservations();
        const interval = setInterval(fetchReservations, 300000);
        return () => clearInterval(interval);
    }, [fetchReservations]);

    const statusColors = {
        CONFIRMED: "bg-green-500/10 text-green-400 border-green-500/20",
        PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
        REJECTED: "bg-red-900/20 text-red-500 border-red-900/30",
    };

    const allFilteredReservations = reservations
        .sort((a, b) => {
            const dateA = new Date(a.startTime.includes('Z') ? a.startTime : a.startTime + 'Z');
            const dateB = new Date(b.startTime.includes('Z') ? b.startTime : b.startTime + 'Z');
            if (sortBy === "newest") return dateB - dateA;
            if (sortBy === "oldest") return dateA - dateB;
            return 0;
        });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const filteredReservations = allFilteredReservations.slice(startIndex, startIndex + itemsPerPage);

    const formatTime = (isoString) => {
        const date = new Date(isoString.includes('Z') ? isoString : isoString + 'Z');
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString.includes('Z') ? isoString : isoString + 'Z');
        return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const roomIcon = () => (
        <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#FF89EB] to-[#DD00B8] shadow-lg shadow-black/20">
            <Monitor size={20} className="text-white" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#24003E] text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

                    {/* ─── Header ─── */}
                        <div className="flex items-center justify-between w-full mb-8">
                            <div className="pl-14 md:pl-0">
                                <h1 className="text-2xl md:text-3xl font-black uppercase font-['Inter'] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#FF89EB]">
                                    My Coaching Sessions
                                </h1>
                                <p className="text-gray-400 hidden md:block text-sm">
                                    View reservations booked with you
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsSortOpen(!isSortOpen)}
                                        className="bg-gradient-to-r from-[#DD00B8] to-[#2BDFC8] text-white px-5 h-[40px] rounded-[18px] text-[15px] font-medium flex items-center gap-2 hover:opacity-90 transition-all whitespace-nowrap shadow-lg shadow-black/20"
                                    >
                                        <Filter size={18} className="text-[#FF89EB]" />
                                        <span className="hidden sm:inline">{sortBy === "newest" ? "Sort by newest" : "Sort by oldest"}</span>
                                        <span className="sm:hidden">{sortBy === "newest" ? "Newest" : "Oldest"}</span>
                                        <ChevronDown size={18} className={`transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {isSortOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsSortOpen(false)}
                                            ></div>
                                            <div className="absolute right-0 mt-3 w-56 bg-[#320141]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-2 z-20 animate-in fade-in zoom-in duration-200">
                                                {[
                                                    { value: "newest", label: "Sort by newest" },
                                                    { value: "oldest", label: "Sort by oldest" },
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            setSortBy(option.value);
                                                            setIsSortOpen(false);
                                                            setCurrentPage(1);
                                                        }}
                                                        className={`w-full flex items-center px-5 py-3 rounded-2xl text-[14px] font-medium transition-all ${sortBy === option.value
                                                            ? "bg-[#1CF3CA] text-black"
                                                            : "text-white/70 hover:bg-white/5 hover:text-white"
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <NotificationBell />
                            </div>
                        </div>

                    {/* ─── Content ─── */}
                    <div className="bg-[#320141]/40 border border-white/5 rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-xl">

                        {/* Loading */}
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-10 h-10 border-4 border-[#FF89EB]/20 border-t-[#FF89EB] rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white/40 font-black uppercase tracking-widest text-xs">Synchronizing with server...</p>
                            </div>

                        ) : filteredReservations.length > 0 ? (<>

                            {/* ── Desktop table (md+) ── */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.02]">
                                            <th className="px-6 lg:px-8 py-5 text-[10px] font-black tracking-[0.2em] text-[#FF89EB]/60 uppercase">Player</th>
                                            <th className="px-6 lg:px-8 py-5 text-[10px] font-black tracking-[0.2em] text-[#FF89EB]/60 uppercase">Schedule</th>
                                            <th className="px-6 lg:px-8 py-5 text-[10px] font-black tracking-[0.2em] text-[#FF89EB]/60 uppercase">Hardware</th>
                                            <th className="px-6 lg:px-8 py-5 text-[10px] font-black tracking-[0.2em] text-[#FF89EB]/60 uppercase text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {filteredReservations.map((res) => (
                                            <tr key={res.id} className="hover:bg-white/[0.015] transition-colors">
                                                <td className="px-6 lg:px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#2BDFC8] to-blue-500 shadow-lg shadow-black/20">
                                                            <User size={18} className="text-white" />
                                                        </div>
                                                        <span className="font-black text-base tracking-tight text-white">
                                                            {res.playerName || "Unknown"}
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
                                        {/* Top row: player + status */}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#2BDFC8] to-blue-500 shadow-lg shadow-black/20">
                                                    <User size={18} className="text-white" />
                                                </div>
                                                <span className="font-black text-sm tracking-tight text-white truncate">
                                                    {res.playerName || "Unknown"}
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

                            <Pagination
                                currentPage={currentPage}
                                totalItems={allFilteredReservations.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />

                        </>) : (
                            /* Empty state */
                            <div className="py-16 sm:py-24 text-center px-6">
                                <Monitor className="mx-auto mb-5 text-white/10" size={56} />
                                <h3 className="text-lg sm:text-xl font-black font-['Inter'] tracking-tight mb-2">No Sessions Found</h3>
                                <p className="text-white/30 text-sm max-w-xs mx-auto mb-8 font-medium">
                                    No players have booked coaching sessions with you yet.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CoachRoom;
