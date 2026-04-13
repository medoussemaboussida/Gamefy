import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Monitor, Clock, Tag, CreditCard, Banknote, X, AlertTriangle, Timer, Filter } from "lucide-react";

import { getMyReservations, createReservationPaymentIntent, confirmReservationCashPayment, getWorkSchedule } from "../../api/reservation";
import Sidebar from "../../components/Sidebar";
import ReservationPaymentModal from "../../components/payment/ReservationPaymentModal";
import CashPaymentModal from "../../modals/CashPaymentModal";
import toast from "react-hot-toast";

import gamingRoomImg from "../../assets/images/room.png";
import coachingImg from "../../assets/images/coaching.png";
import vipImg from "../../assets/images/vip.png";

// Live countdown for PENDING reservation expiry
const CountdownTimer = ({ createdAt, onExpired }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calc = () => {
            // createdAt is UTC from backend
            const created = new Date(createdAt.includes("Z") ? createdAt : createdAt + "Z");
            const expiresAt = new Date(created.getTime() + 24 * 60 * 60 * 1000);
            const now = new Date();
            const diff = expiresAt - now;

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft("Expired");
                if (onExpired) onExpired();
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}h ${mins}m`);
            setIsUrgent(hours < 2);
        };

        calc();
        const interval = setInterval(calc, 60000); // update every minute
        return () => clearInterval(interval);
    }, [createdAt, onExpired]);

    if (isExpired) {
        return (
            <span className="inline-flex items-center gap-1 text-red-400 text-[10px] font-black uppercase">
                <AlertTriangle size={11} /> Expired
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase ${isUrgent ? "text-red-400" : "text-yellow-400"}`}>
            <Timer size={11} /> {timeLeft} left
        </span>
    );
};

const Rooms = () => {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("newest");
    const [isSortOpen, setIsSortOpen] = useState(false);



    // Payment confirmation state
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [cashConfirming, setCashConfirming] = useState(false);
    const [cardLoading, setCardLoading] = useState(false);

    // Stripe payment modal state
    const [stripeModalOpen, setStripeModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);

    // Cash info modal state
    const [cashModalOpen, setCashModalOpen] = useState(false);

    const fetchReservations = useCallback(async () => {
        try {
            const data = await getMyReservations();
            setReservations(data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReservations();
        // Auto-refresh every 5 minutes to pick up backend expiry deletions
        const interval = setInterval(fetchReservations, 300000);
        return () => clearInterval(interval);
    }, [fetchReservations]);



    const handleConfirmClick = (reservation) => {
        setSelectedReservation(reservation);
        setConfirmModalOpen(true);
    };

    const handleCashPayment = async () => {
        if (!selectedReservation) return;
        setCashConfirming(true);
        try {
            await confirmReservationCashPayment(selectedReservation.id);
            setConfirmModalOpen(false);
            setCashModalOpen(true);
            await fetchReservations(); // Refresh to reflect paymentType change
        } catch (error) {
            toast.error(error?.message || "Failed to set cash payment");
        } finally {
            setCashConfirming(false);
        }
    };

    const shouldShowCountdown = (res) => (res.status === "PENDING" && !res.paymentType) || res.status === "CANCELLED";
    const needsConfirmation = (res) => res.status === "PENDING" && !res.paymentType;


    const getUtcDate = (isoString) => new Date(isoString.includes("Z") ? isoString : `${isoString}Z`);


    const handleCardPayment = async () => {
        if (!selectedReservation) return;
        setCardLoading(true);
        try {
            const data = await createReservationPaymentIntent(selectedReservation.id);
            setClientSecret(data.clientSecret);
            setConfirmModalOpen(false);
            setStripeModalOpen(true);
        } catch (error) {
            toast.error(error?.message || "Failed to initiate card payment");
        } finally {
            setCardLoading(false);
        }
    };

    const handleStripePaymentSuccess = async () => {
        setStripeModalOpen(false);
        setClientSecret(null);
        setSelectedReservation(null);
        await fetchReservations();
    };

    const statusColors = {
        CONFIRMED: "bg-green-500/10 text-green-400 border-green-500/20",
        PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
        REJECTED: "bg-red-900/20 text-red-500 border-red-900/30",
    };

    const paymentBadge = (res) => {
        if (res.status === "PENDING" && res.paymentType === "CASH_PAYMENT") {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-400 border-orange-500/20">
                    <Banknote size={10} /> Awaiting Cash
                </span>
            );
        }
        return null;
    };

    const allFilteredReservations = reservations
        .sort((a, b) => {
            const dateA = new Date(a.startTime.includes('Z') ? a.startTime : a.startTime + 'Z');
            const dateB = new Date(b.startTime.includes('Z') ? b.startTime : b.startTime + 'Z');
            if (sortBy === "newest") return dateB - dateA;
            if (sortBy === "oldest") return dateA - dateB;
            return 0;
        });

    // Removed pagination: show all reservations in the scrollable card list.
    const filteredReservations = allFilteredReservations;

    const formatTime = (isoString) => {
        const date = new Date(isoString.includes('Z') ? isoString : isoString + 'Z');
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString.includes('Z') ? isoString : isoString + 'Z');
        return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getRoomPhoto = (reservationType) => {
        switch (reservationType) {
            case "COACHING_ROOM":
                return coachingImg;
            case "VIP_ROOM":
                return vipImg;
            case "PC_ROOM":
            default:
                return gamingRoomImg;
        }
    };

    const getCoachDisplayName = (reservation) => {
        if (!reservation) return null;
        if (reservation.coachFullName) return reservation.coachFullName;
        if (reservation.coachName) return reservation.coachName;
        if (reservation.coachLastName && reservation.coachFirstName) {
            return `${reservation.coachLastName} ${reservation.coachFirstName}`;
        }
        return null;
    };

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
                                <h1 className="text-3xl md:text-3xl font-black uppercase font-['Inter'] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8]">
                                    My Reservations
                                </h1>
                                <p className="text-gray-400">
                                    Manage your upcoming gaming sessions
                                </p>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-auto">
                                {/* Sort Filter Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsSortOpen(!isSortOpen)}
                                        className="bg-gradient-to-r from-[#DD00B8] to-[#2BDFC8] px-6 h-[40px] rounded-[18px] text-white font-medium flex items-center gap-2 hover:opacity-90 transition-all text-[15px]"
                                    >
                                        <Filter size={18} />
                                        <span>{sortBy === "newest" ? "Sort by newest" : "Sort by oldest"}</span>
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

                                {/* Book Now */}
                                <button
                                    onClick={() => navigate("/player/reservation")}
                                    className="flex items-center gap-2 px-5 py-3 bg-[#1CF3CA] text-black font-bold font-['Inter'] text-sm tracking-tight rounded-full hover:bg-[#19d4b0] active:scale-95 transition-all shadow-[0_0_20px_rgba(28,243,202,0.3)]"
                                >
                                    <Plus size={16} />
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ─── Content ─── */}
                        {/* Loading */}
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="w-10 h-10 border-4 border-[#1CF3CA]/20 border-t-[#1CF3CA] rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white/40 font-black uppercase tracking-widest text-xs">Synchronizing with server...</p>
                            </div>

                        ) : filteredReservations.length > 0 ? (<>

                            {/* ── Reservation cards (scrollable) ── */}
                            <div className="flex overflow-x-auto gap-8 py-6 px-4 pb-16 snap-x no-scrollbar custom-scrollbar-h -mx-4">
                                {filteredReservations.map((res) => (
                                    <div
                                        key={res.id}
                                        className="flex-shrink-0 w-full max-w-[450px] snap-center relative group bg-[#320141]/40 border border-white/5 rounded-[50px] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-[#320141]/60 hover:border-[#1CF3CA]/30 flex flex-col h-full shadow-2xl backdrop-blur-xl"
                                    >
                                        {/* Hover Light Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#1CF3CA]/0 via-[#1CF3CA]/5 to-[#FF89EB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                        {/* Image Section */}
                                        <div className="relative h-[250px] overflow-hidden">
                                            <img
                                                src={getRoomPhoto(res.reservationType)}
                                                alt={res.reservationType.replace('_', ' ')}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />

                                            {/* Status / badges */}
                                            <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                                                <span
                                                    className={`px-4 py-1.5 rounded-full text-[10px] font-black font-[inter] uppercase tracking-widest border backdrop-blur-md ${statusColors[res.status] || "bg-white/5 text-white border-white/10"}`}
                                                >
                                                    {res.status}
                                                </span>
                                                {paymentBadge(res)}
                                                {shouldShowCountdown(res) && res.createdAt && (
                                                    <CountdownTimer createdAt={res.createdAt} onExpired={fetchReservations} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-transparent to-black/30">
                                            <div className="flex-grow space-y-4">
                                                <h3 className="text-xl md:text-xl font-black font-[inter] uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8]">
                                                    {res.reservationType === "COACHING_ROOM" && getCoachDisplayName(res)
                                                        ? `${res.reservationType.replace('_', ' ')} with ${getCoachDisplayName(res)}`
                                                        : res.reservationType.replace('_', ' ')}
                                                </h3>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 text-white/70 font-medium">
                                                        <Tag size={18} className="text-[#FF89EB]" />
                                                        <span className="text-sm">{formatDate(res.startTime)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-white/70 font-medium">
                                                        <Clock size={18} className="text-[#1CF3CA]" />
                                                        <span className="text-sm font-black">{formatTime(res.startTime)} → {formatTime(res.endTime)}</span>
                                                    </div>
                                                </div>

                                                <div className="pt-3 space-y-3 border-t border-white/5">
                                                    <div className="flex flex-wrap gap-2">
                                                        {res.pcNumbers?.length > 0 ? (
                                                            res.pcNumbers.map((num) => (
                                                                <span key={num} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-black text-white/60">
                                                                    PC #{num}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-[10px] font-black text-white/30 uppercase">
                                                                No PCs
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Price</span>
                                                        <span className="text-sm font-black text-[#1CF3CA]">
                                                            {res.priceTime ? `${res.priceTime.toFixed(3)} DT` : "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="pt-8 w-full">
                                                <div className="w-full space-y-3">
                                                    {needsConfirmation(res) && (
                                                        <button
                                                            onClick={() => handleConfirmClick(res)}
                                                            className="w-full px-8 py-4 bg-[#1CF3CA] hover:bg-[#19d4b0] text-black font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(28,243,202,0.2)]"
                                                        >
                                                            Confirm Reservation
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </>) : (
                            /* Empty state */
                            <div className="py-16 sm:py-24 text-center px-6">
                                <Monitor className="mx-auto mb-5 text-white/10" size={56} />
                                <h3 className="text-lg sm:text-xl font-black font-['Inter'] tracking-tight mb-2">No Sessions Found</h3>
                                <p className="text-white/30 text-sm max-w-xs mx-auto mb-8 font-medium">
                                    You haven't reserved any gaming slots yet. Start your journey today!
                                </p>
                                <button
                                    onClick={() => navigate("/player/reservation")}
                                    className="px-8 py-4 bg-[#1CF3CA] text-black font-black font-bold font-['Inter'] tracking-tighter rounded-full hover:bg-[#19d4b0] active:scale-95 transition-all shadow-xl"
                                >
                                    Create First Reservation
                                </button>
                            </div>
                        )}
                </div>
            </main>

            {/* ─── Payment Type Selection Modal ─── */}
            {confirmModalOpen && selectedReservation && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ background: "rgba(10, 0, 20, 0.85)", backdropFilter: "blur(12px)" }}
                    onClick={(e) => { if (e.target === e.currentTarget) { setConfirmModalOpen(false); setSelectedReservation(null); } }}
                >
                    <div
                        className="relative w-full max-w-md rounded-[32px] overflow-hidden"
                        style={{
                            background: "linear-gradient(145deg, #2a0045, #1a0030)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(28,243,202,0.05)",
                        }}
                    >
                        {/* Top gradient bar */}
                        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1CF3CA, #FF89EB)" }} />

                        {/* Header */}
                        <div className="flex items-start justify-between px-8 pt-7 pb-3">
                            <div>
                                <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#1CF3CA]/60 mb-1">
                                    Confirm Payment
                                </p>
                                <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                                    {selectedReservation.reservationType.replace('_', ' ')}
                                </h2>
                            </div>
                            <button
                                onClick={() => { setConfirmModalOpen(false); setSelectedReservation(null); }}
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                            >
                                <X size={16} className="text-white/60" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-8 pb-8 space-y-5">
                            {/* Reservation summary */}
                            <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(28, 243, 202, 0.05)", border: "1px solid rgba(28, 243, 202, 0.12)" }}>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-white/30">Date</span>
                                    <span className="text-xs font-bold text-white">{formatDate(selectedReservation.startTime)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-white/30">Time</span>
                                    <span className="text-xs font-black text-white">{formatTime(selectedReservation.startTime)} → {formatTime(selectedReservation.endTime)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-dashed border-white/10">
                                    <span className="text-[10px] font-black uppercase text-[#1CF3CA]">Total</span>
                                    <span className="text-lg font-black text-[#1CF3CA] italic">
                                        {selectedReservation.priceTime?.toFixed(3) || "0.000"} DT
                                    </span>
                                </div>
                            </div>

                            {/* Payment method selection */}
                                {selectedReservation.priceTime > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Cash */}
                                        <button
                                            onClick={handleCashPayment}
                                            disabled={cashConfirming || cardLoading}
                                            className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#1CF3CA]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center group-hover:from-green-500/30 group-hover:to-green-600/20 transition-all">
                                                <Banknote size={24} className="text-green-400" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider text-white/70 group-hover:text-white transition-colors">
                                                {cashConfirming ? "Confirming..." : "Cash"}
                                            </span>
                                        </button>

                                        {/* Card */}
                                        <button
                                            onClick={handleCardPayment}
                                            disabled={cashConfirming || cardLoading}
                                            className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#FF89EB]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF89EB]/20 to-[#DD00B8]/10 flex items-center justify-center group-hover:from-[#FF89EB]/30 group-hover:to-[#DD00B8]/20 transition-all">
                                                <CreditCard size={24} className="text-[#FF89EB]" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wider text-white/70 group-hover:text-white transition-colors">
                                                {cardLoading ? "Loading..." : "Card"}
                                            </span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            setCardLoading(true);
                                            try {
                                                const { confirmReservationCardPayment } = await import("../../api/reservation");
                                                await confirmReservationCardPayment(selectedReservation.id);
                                                toast.success("Free session confirmed! Enjoy!");
                                                setConfirmModalOpen(false);
                                                await fetchReservations();
                                            } catch (error) {
                                                toast.error(error.message || "Failed to confirm free session");
                                            } finally {
                                                setCardLoading(false);
                                            }
                                        }}
                                        disabled={cardLoading}
                                        className="w-full py-4 rounded-2xl bg-[#1CF3CA] text-black font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(28,243,202,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {cardLoading ? (
                                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CreditCard size={18} />
                                                Claim Free Session
                                            </>
                                        )}
                                    </button>
                                )}
                        </div>
                    </div>
                </div>
            )}


            {/* ─── Stripe Payment Modal ─── */}
            <ReservationPaymentModal
                isOpen={stripeModalOpen}
                onClose={() => { setStripeModalOpen(false); setClientSecret(null); }}
                clientSecret={clientSecret}
                reservation={selectedReservation}
                onPaymentSuccess={handleStripePaymentSuccess}
            />

            {/* ─── Cash Info Modal ─── */}
            <CashPaymentModal
                isOpen={cashModalOpen}
                onClose={() => { setCashModalOpen(false); setSelectedReservation(null); }}
                reservation={selectedReservation}
            />

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-scrollbar-h::-webkit-scrollbar {
                    height: 8px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                    margin: 0 40px;
                }
                .custom-scrollbar-h::-webkit-scrollbar-thumb {
                    background: rgba(28, 243, 202, 0.2);
                    border-radius: 10px;
                    border: 2px solid #24003E;
                }
                .custom-scrollbar-h::-webkit-scrollbar-thumb:hover {
                    background: rgba(28, 243, 202, 0.4);
                }
            `}</style>
        </div>
    );
};

export default Rooms;
