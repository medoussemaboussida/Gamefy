import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { Bell, MoreHorizontal, ChevronDown, Gamepad2, Banknote, Edit3, PlusCircle, CalendarDays, Monitor, Clock, User } from "lucide-react";
import { coachProfileApi } from "../../api/coach_profile";
import { getMyCoachingReservations } from "../../api/reservation";
import CoachProfileForm from "../../modals/CoachProfileForm";
import CoachScheduleModal from "../../modals/CoachScheduleModal";
import toast from "react-hot-toast";

import NotificationBell from "../../components/NotificationBell";

const CoachDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [stats, setStats] = useState({ totalSessions: 0, activeBookedPacks: 0 });

  const fetchProfile = async () => {
    try {
      const data = await coachProfileApi.getMyProfile();
      setProfile(data);
    } catch (error) {
      if (error.message !== "Coach profile not found for user ID: " + localStorage.getItem("userId")) {
        console.error("Failed to load coach profile", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReservations = useCallback(async () => {
    try {
      const data = await getMyCoachingReservations();
      setReservations(data);
    } catch (error) {
      console.error("Failed to fetch coaching reservations", error);
    } finally {
      setReservationsLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const data = await coachProfileApi.getMyStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch coach stats", error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchReservations();
    fetchStats();
  }, [fetchReservations]);

  const statusColors = {
    CONFIRMED: "bg-green-500/10 text-green-400 border-green-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    REJECTED: "bg-red-900/20 text-red-500 border-red-900/30",
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString.includes('Z') ? isoString : isoString + 'Z');
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString.includes('Z') ? isoString : isoString + 'Z');
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  // Show latest 3 reservations sorted by newest
  const latestReservations = [...reservations]
    .sort((a, b) => {
      const dateA = new Date(a.startTime.includes('Z') ? a.startTime : a.startTime + 'Z');
      const dateB = new Date(b.startTime.includes('Z') ? b.startTime : b.startTime + 'Z');
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <div className="h-screen bg-[#24003E] flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 px-10 md:px-12 pt-8 pb-12 transition-all duration-300 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto space-y-10 md:space-y-16">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-0">
            <h2 className="text-white text-[18px] font-bold font-['Inter'] self-start md:self-auto pl-14 md:pl-0">
              Coach Dashboard
            </h2>

            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="p-2.5 bg-[#1CF3CA]/10 text-[#1CF3CA] rounded-full hover:bg-[#1CF3CA] hover:text-black transition-all flex-shrink-0"
                title="My Availability Schedule"
              >
                <CalendarDays size={20} />
              </button>

              <NotificationBell />
            </div>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
            {/* Sessions Card */}
            <div className="bg-[#582167] border border-white/5 rounded-[32px] p-8 relative h-[137px] flex flex-col justify-between group hover:border-[#1CF3CA]/30 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-[16px] font-medium font-['Inter']">
                  Sessions
                </span>
                <MoreHorizontal className="text-white/40 cursor-pointer" />
              </div>
              <div className="text-white text-[32px] font-bold font-['Inter']">
                {stats.totalSessions}
              </div>
            </div>

            {/* Booked Packs Card */}
            <div className="bg-[#582167] border border-white/5 rounded-[32px] p-8 relative h-[137px] flex flex-col justify-between group hover:border-[#1CF3CA]/30 transition-all">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-[16px] font-medium font-['Inter']">
                  Booked Packs
                </span>
                <MoreHorizontal className="text-white/40 cursor-pointer" />
              </div>
              <div className="text-white text-[32px] font-bold font-['Inter']">
                {stats.activeBookedPacks}
              </div>
            </div>

            {/* Coach Profile Card */}
            <div className={`bg-[#320141] border ${profile ? 'border-[#1CF3CA]/20' : 'border-dashed border-white/20'} rounded-[32px] p-8 relative min-h-[160px] flex flex-col justify-center group hover:border-[#1CF3CA]/40 transition-all overflow-hidden`}>
              {profile ? (
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                      <Gamepad2 size={14} className="text-[#1CF3CA]" /> {profile.game}
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="p-3 bg-[#1CF3CA]/10 text-[#1CF3CA] rounded-2xl hover:bg-[#1CF3CA] hover:text-black transition-all shadow-lg shadow-[#1CF3CA]/5"
                    >
                      <Edit3 size={20} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-white text-[24px] font-black font-['Inter'] flex items-baseline gap-1">
                      {Number(profile.hourlyPrice).toFixed(3)} <span className="text-[14px] text-white/40 font-medium">DT/hr</span>
                    </div>

                    {profile.bio && (
                      <p className="text-white/60 text-sm font-medium line-clamp-2 italic leading-relaxed">
                        "{profile.bio}"
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-full flex flex-col items-center justify-center gap-3 group/btn"
                >
                  <PlusCircle size={32} className="text-[#1CF3CA] group-hover/btn:scale-110 transition-transform" />
                  <span className="text-white/60 text-[14px] font-bold font-['Inter'] group-hover/btn:text-white transition-colors">
                    Create your coaching profile now
                  </span>
                </button>
              )}
              {/* Background Glow Effect */}
              {profile && <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#1CF3CA] blur-[60px] opacity-10"></div>}
            </div>
          </div>

          {/* Latest Coaching Sessions Section */}
          <div className="border border-[#1CF3CA]/30 rounded-[32px] p-8 md:p-12 bg-black/10 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
              <h3 className="text-white text-[16px] font-bold font-['Inter']">
                Latest coaching sessions
              </h3>
            </div>

            <div className="overflow-x-auto w-full">
              {reservationsLoading ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-4 border-[#1CF3CA]/20 border-t-[#1CF3CA] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Loading sessions...</p>
                </div>
              ) : latestReservations.length > 0 ? (
                <table className="w-full border-collapse">
                  <tbody>
                    {latestReservations.map((res, index) => (
                      <tr
                        key={res.id}
                        className={`${index !== latestReservations.length - 1 ? "border-b border-[#1CF3CA]/30" : ""}`}
                      >
                        <td className="py-8">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#2BDFC8] to-blue-500 shadow-lg shadow-black/20">
                                <User size={18} className="text-white" />
                              </div>
                              <div className="text-white text-[14px] font-medium font-['Inter'] text-center md:text-left">
                                Reservation By{" "}
                                <span className="text-[#1CF3CA] font-bold">
                                  {res.playerName || "Unknown"}
                                </span>{" "}
                                <span className="text-white/50">
                                  {formatDate(res.startTime)} · {formatTime(res.startTime)} → {formatTime(res.endTime)}
                                </span>
                                {res.pcNumbers && res.pcNumbers.length > 0 && (
                                  <span className="text-white/30 ml-2">
                                    {res.pcNumbers.map(n => `PC #${n}`).join(", ")}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center justify-center px-5 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest w-[120px] ${statusColors[res.status] || "bg-white/5 text-white border-white/10"}`}
                            >
                              {res.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center">
                  <Monitor className="mx-auto mb-3 text-white/10" size={40} />
                  <p className="text-white/30 text-sm font-medium">No coaching sessions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <CoachProfileForm
          profile={profile}
          onClose={() => setIsModalOpen(false)}
          onSave={(newProfile) => setProfile(newProfile)}
        />
      )}

      <CoachScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
};

export default CoachDashboard;
