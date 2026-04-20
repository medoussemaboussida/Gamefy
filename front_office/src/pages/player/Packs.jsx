import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { packGamefyApi } from "../../api/packGamefy";
import { packCoachingApi } from "../../api/packCoaching";
import { Gift, Info, Check, CreditCard, Clock, User, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import PaymentModal from "../../components/payment/PaymentModal";
import CoachingPaymentModal from "../../components/payment/CoachingPaymentModal";
import PackDescriptionModal from "../../modals/PackDescriptionModal";
import CoachingPackDescriptionModal from "../../modals/CoachingPackDescriptionModal";

const Packs = () => {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPack, setSelectedPack] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Coaching packs
    const [coachingPacks, setCoachingPacks] = useState([]);
    const [coachingLoading, setCoachingLoading] = useState(true);
    const [selectedCoachingPack, setSelectedCoachingPack] = useState(null);
    const [isCoachingModalOpen, setIsCoachingModalOpen] = useState(false);

    // Payment states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCoachingPaymentModalOpen, setIsCoachingPaymentModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [purchasedPackIds, setPurchasedPackIds] = useState([]);
    const [purchasedCoachingPackIds, setPurchasedCoachingPackIds] = useState([]);
    const [myPackStatus, setMyPackStatus] = useState(null); // { packId, packName, status }
    const [myCoachingPackStatus, setMyCoachingPackStatus] = useState(null); // { packId, packName, status }
    const [isRenewalMode, setIsRenewalMode] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [packsData, purchasedIds, packStatus] = await Promise.all([
                    packGamefyApi.getAllPacks(),
                    packGamefyApi.getMyPurchasedPacks().catch(() => []),
                    packGamefyApi.getMyPackStatus().catch(() => null),
                ]);
                setPacks(packsData);
                setPurchasedPackIds(purchasedIds);
                setMyPackStatus(packStatus);
            } catch (error) {
                console.error("Failed to fetch packs", error);
                toast.error("Could not load packs. Please try again later.", {
                    style: {
                        background: "#24003E",
                        color: "#FF4D4D",
                        border: "1px solid rgba(255, 77, 77, 0.3)",
                    },
                });
            } finally {
                setLoading(false);
            }
        };

        const fetchCoachingPacks = async () => {
            try {
                const [data, purchasedIds, coachingStatus] = await Promise.all([
                    packCoachingApi.getAllPacks(),
                    packCoachingApi.getMyPurchasedCoachingPacks().catch(() => []),
                    packCoachingApi.getMyCoachingPackStatus().catch(() => null),
                ]);
                setCoachingPacks(data);
                setPurchasedCoachingPackIds(purchasedIds);
                setMyCoachingPackStatus(coachingStatus);
            } catch (error) {
                console.error("Failed to fetch coaching packs", error);
            } finally {
                setCoachingLoading(false);
            }
        };

        fetchData();
        fetchCoachingPacks();
    }, []);

    const openDescription = (pack) => {
        setSelectedPack(pack);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPack(null);
    };

    const handleBuyNow = async (pack) => {
        setSelectedPack(pack);
        setIsProcessingPayment(true);
        setIsRenewalMode(false);
        try {
            const response = await packGamefyApi.createPackPaymentIntent(pack.id);
            setClientSecret(response.clientSecret);
            setIsPaymentModalOpen(true);
        } catch (error) {
            console.error("Failed to create payment intent", error);
            toast.error("Could not start payment process. Please try again.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleRenewPack = async (pack) => {
        setSelectedPack(pack);
        setIsProcessingPayment(true);
        setIsRenewalMode(true);
        try {
            const response = await packGamefyApi.createRenewPaymentIntent(pack.id);
            setClientSecret(response.clientSecret);
            setIsPaymentModalOpen(true);
        } catch (error) {
            console.error("Failed to create renewal payment intent", error);
            toast.error("Could not start renewal process. Please try again.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        setClientSecret("");
        setIsRenewalMode(false);
        // Replace the list because the player only has one active Gamefy pack
        if (selectedPack) {
            setPurchasedPackIds([selectedPack.id]);
            setMyPackStatus({ packId: selectedPack.id, packName: selectedPack.name, status: "ACTIVE" });
        }
    };

    const handleBuyCoachingPack = async (pack) => {
        setSelectedCoachingPack(pack);
        setIsProcessingPayment(true);
        setIsRenewalMode(false);
        try {
            const response = await packCoachingApi.createCoachingPackPaymentIntent(pack.id);
            setClientSecret(response.clientSecret);
            setIsCoachingPaymentModalOpen(true);
        } catch (error) {
            console.error("Failed to create coaching payment intent", error);
            toast.error("Could not start payment process. Please try again.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleRenewCoachingPack = async (pack) => {
        setSelectedCoachingPack(pack);
        setIsProcessingPayment(true);
        setIsRenewalMode(true);
        try {
            const response = await packCoachingApi.createRenewCoachingPackPaymentIntent(pack.id);
            setClientSecret(response.clientSecret);
            setIsCoachingPaymentModalOpen(true);
        } catch (error) {
            console.error("Failed to create coaching renewal payment intent", error);
            toast.error("Could not start renewal process. Please try again.");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleCoachingPaymentSuccess = () => {
        setIsCoachingPaymentModalOpen(false);
        setClientSecret("");
        setIsRenewalMode(false);
        // Replace the list because the player only has one active coaching pack
        if (selectedCoachingPack) {
            setPurchasedCoachingPackIds([selectedCoachingPack.id]);
            setMyCoachingPackStatus({ packId: selectedCoachingPack.id, packName: selectedCoachingPack.name, status: "ACTIVE" });
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#24003E] text-white font-['Inter']">
            <Sidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1400px] mx-auto px-10 md:px-12 pt-8 pb-12 transition-all duration-300">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                        <div className="pl-16 md:pl-0">
                            <h1 className="text-3xl md:text-3xl font-black uppercase font-['Inter'] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8]">
                            Gaming packs
                            </h1>
                         <p className="text-gray-400">Exclusive bundles designed to level up your experience.</p>
                        </div>
                    </div>

                {loading ? (
                    <div className="flex-grow flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1CF3CA]"></div>
                    </div>
                ) : packs.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-3xl border border-white/5 py-20">
                        <Gift size={64} className="mb-4 opacity-20" />
                        <p className="text-xl">No packs available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-20">
                        {packs.map((pack) => (
                            <div
                                key={pack.id}
                                className="group bg-[#24003E]/40 border border-white/5 rounded-3xl p-6 flex flex-col transition-all duration-300 hover:border-[#1CF3CA]/30 hover:bg-[#24003E]/60 hover:shadow-[0_0_30px_rgba(28,243,202,0.1)] h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-2xl bg-[#1CF3CA]/10 text-[#1CF3CA]">
                                        <Gift size={24} />
                                    </div>
                                    <div className="text-right">
                                         <span className="block text-2xl font-bold text-[#1CF3CA]">{Number(pack.price).toFixed(3)} DT</span>

                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Per Pack</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-4 group-hover:text-[#FF89EB] transition-colors">{pack.name}</h3>

                                <div className="flex-grow space-y-3 mb-6">
                                    {pack.benefits?.length > 0 ? (() => {
                                        const pcHoursCount = pack.benefits.filter(
                                            b => b.benefitType === "PC" && b.rateRule === "HOURS"
                                        ).length;
                                        const otherBenefits = pack.benefits.filter(
                                            b => !(b.benefitType === "PC" && b.rateRule === "HOURS")
                                        );
                                        return (
                                            <>
                                                {pcHoursCount > 0 && (
                                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                                        <div className="w-5 h-5 rounded-full bg-[#1CF3CA]/20 flex items-center justify-center flex-shrink-0">
                                                            <Check size={12} className="text-[#1CF3CA]" />
                                                        </div>
                                                        <span>
                                                            PC - HOURS
                                                            {pcHoursCount > 1 && (
                                                                <span className="ml-1 text-[#1CF3CA] font-semibold">
                                                                    × {pcHoursCount}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {otherBenefits.map((benefit, index) => (
                                                    <div key={index} className="flex items-center gap-3 text-sm text-gray-300">
                                                        <div className="w-5 h-5 rounded-full bg-[#1CF3CA]/20 flex items-center justify-center flex-shrink-0">
                                                            <Check size={12} className="text-[#1CF3CA]" />
                                                        </div>
                                                        <span>{benefit.benefitType} - {benefit.rateRule}</span>
                                                    </div>
                                                ))}
                                            </>
                                        );
                                    })() : (
                                        <p className="text-sm text-gray-500 italic">No specific benefits listed.</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => openDescription(pack)}
                                        className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold transition-all hover:bg-white/10 flex items-center justify-center gap-2"
                                    >
                                        <Info size={18} />
                                        Show Description
                                    </button>
                                    {purchasedPackIds.includes(pack.id) ? (
                                        <div className="w-full py-3 px-4 rounded-xl bg-white/5 border border-[#1CF3CA]/30 text-[#1CF3CA] font-semibold flex items-center justify-center gap-2 cursor-default">
                                            <Check size={18} />
                                            You already bought this pack
                                        </div>
                                    ) : myPackStatus && myPackStatus.packId === pack.id && (myPackStatus.status === "EXPIRED" || myPackStatus.status === "CONSUMED") ? (
                                        <button
                                            onClick={() => handleRenewPack(pack)}
                                            disabled={isProcessingPayment && selectedPack?.id === pack.id}
                                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold transition-all hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                        >
                                            {isProcessingPayment && selectedPack?.id === pack.id ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    <RefreshCw size={18} />
                                                    Renew Pack
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleBuyNow(pack)}
                                            disabled={isProcessingPayment && selectedPack?.id === pack.id}
                                            className="w-full py-3 px-4 rounded-xl bg-[#1CF3CA] text-black font-bold transition-all hover:bg-[#1CF3CA]/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(28,243,202,0.2)]"
                                        >
                                            {isProcessingPayment && selectedPack?.id === pack.id ? (
                                                <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    <CreditCard size={18} />
                                                    Buy Now
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Coaching Packs Section ── */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                        <div className="pl-16 md:pl-0">
                            <h1 className="text-3xl md:text-3xl font-black uppercase font-['Inter'] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#FF89EB]">
                                Coaching Packs
                            </h1>
                            <p className="text-gray-400">Level up your skills with personal coaching sessions.</p>
                        </div>
                    </div>

                    {coachingLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF89EB]"></div>
                        </div>
                    ) : coachingPacks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-3xl border border-white/5 py-16">
                            <Clock size={52} className="mb-4 opacity-20" />
                            <p className="text-xl">No coaching packs available at the moment.</p>
                        </div>
                    ) : (
                        <div className="flex gap-5 overflow-x-auto pb-4 coaching-scrollbar snap-x snap-mandatory px-1">
                            {coachingPacks.map((pack) => (
                                <div
                                    key={pack.id}
                                    className="group flex-shrink-0 w-72 snap-start bg-[#24003E]/40 border border-white/5 rounded-3xl p-6 flex flex-col transition-all duration-300 hover:border-[#FF89EB]/30 hover:bg-[#24003E]/60 hover:shadow-[0_0_30px_rgba(255,137,235,0.1)]"
                                >
                                    {/* Icon + Price */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-2xl bg-[#FF89EB]/10 text-[#FF89EB]">
                                            <Clock size={24} />
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-2xl font-bold text-[#FF89EB]">{Number(pack.price).toFixed(3)} DT</span>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Per Pack</span>
                                        </div>
                                    </div>

                                    {/* Pack Name */}
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-[#1CF3CA] transition-colors">{pack.name}</h3>

                                    {/* Hours */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-5 h-5 rounded-full bg-[#FF89EB]/20 flex items-center justify-center flex-shrink-0">
                                            <Clock size={11} className="text-[#FF89EB]" />
                                        </div>
                                        <span className="text-sm text-gray-300">{pack.hours} hours of coaching</span>
                                    </div>

                                    {/* Coach */}
                                    {pack.coachName && (
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-5 h-5 rounded-full bg-[#1CF3CA]/20 flex items-center justify-center flex-shrink-0">
                                                <User size={11} className="text-[#1CF3CA]" />
                                            </div>
                                            <span className="text-sm text-gray-400">
                                                by <span className="text-[#1CF3CA] font-semibold">{pack.coachName}</span>
                                            </span>
                                        </div>
                                    )}
                                    {/* Show Description button */}
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedCoachingPack(pack);
                                                setIsCoachingModalOpen(true);
                                            }}
                                            className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold transition-all hover:bg-[#FF89EB]/10 hover:border-[#FF89EB]/30 flex items-center justify-center gap-2"
                                        >
                                            <Info size={18} />
                                            Show Description
                                        </button>
                                        {purchasedCoachingPackIds.includes(pack.id) ? (
                                            <div className="w-full py-3 px-4 rounded-xl bg-white/5 border border-[#FF89EB]/30 text-[#FF89EB] font-semibold flex items-center justify-center gap-2 cursor-default">
                                                <Check size={18} />
                                                You already bought this pack
                                            </div>
                                        ) : myCoachingPackStatus && myCoachingPackStatus.packId === pack.id && (myCoachingPackStatus.status === "EXPIRED" || myCoachingPackStatus.status === "CONSUMED") ? (
                                            <button
                                                onClick={() => handleRenewCoachingPack(pack)}
                                                disabled={isProcessingPayment && selectedCoachingPack?.id === pack.id}
                                                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold transition-all hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                            >
                                                {isProcessingPayment && selectedCoachingPack?.id === pack.id ? (
                                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                                ) : (
                                                    <>
                                                        <RefreshCw size={18} />
                                                        Renew Pack
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBuyCoachingPack(pack)}
                                                disabled={isProcessingPayment && selectedCoachingPack?.id === pack.id}
                                                className="w-full py-3 px-4 rounded-xl bg-[#FF89EB] text-black font-bold transition-all hover:bg-[#FF89EB]/90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,137,235,0.2)]"
                                            >
                                                {isProcessingPayment && selectedCoachingPack?.id === pack.id ? (
                                                    <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
                                                ) : (
                                                    <>
                                                        <CreditCard size={18} />
                                                        Buy Now
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                </div>
            </main>


            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => { setIsPaymentModalOpen(false); setIsRenewalMode(false); }}
                clientSecret={clientSecret}
                pack={selectedPack}
                onPaymentSuccess={handlePaymentSuccess}
                isRenewal={isRenewalMode}
            />

            <CoachingPaymentModal
                isOpen={isCoachingPaymentModalOpen}
                onClose={() => setIsCoachingPaymentModalOpen(false)}
                clientSecret={clientSecret}
                pack={selectedCoachingPack}
                onPaymentSuccess={handleCoachingPaymentSuccess}
                isRenewal={isRenewalMode}
            />

            <PackDescriptionModal
                isOpen={isModalOpen}
                onClose={closeModal}
                packName={selectedPack?.name}
                description={selectedPack?.description}
            />

            <CoachingPackDescriptionModal
                isOpen={isCoachingModalOpen}
                onClose={() => { setIsCoachingModalOpen(false); setSelectedCoachingPack(null); }}
                pack={selectedCoachingPack}
            />

            <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(28, 243, 202, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(28, 243, 202, 0.4);
        }
        .coaching-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .coaching-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .coaching-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 137, 235, 0.25);
          border-radius: 10px;
        }
        .coaching-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 137, 235, 0.5);
        }
      `}</style>
        </div>
    );
};

export default Packs;
