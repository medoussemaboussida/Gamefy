import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { packGamefyApi } from "../../api/packGamefy";
import { Gift, Info, X, Check, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import PaymentModal from "../../components/payment/PaymentModal";

const Packs = () => {
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPack, setSelectedPack] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Payment states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [purchasedPackIds, setPurchasedPackIds] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [packsData, purchasedIds] = await Promise.all([
                    packGamefyApi.getAllPacks(),
                    packGamefyApi.getMyPurchasedPacks().catch(() => []),
                ]);
                setPacks(packsData);
                setPurchasedPackIds(purchasedIds);
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

        fetchData();
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

    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        setClientSecret("");
        // Add the purchased pack to the list so the button disables immediately
        if (selectedPack) {
            setPurchasedPackIds(prev => [...prev, selectedPack.id]);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#24003E] text-white font-['Inter']">
            <Sidebar />

            <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#1CF3CA] mb-2 flex items-center gap-3">
                        <Gift className="text-[#FF89EB]" size={36} />
                        Gaming Packs
                    </h1>
                    <p className="text-gray-400">Exclusive bundles designed to level up your experience.</p>
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
                                        <span className="block text-2xl font-bold text-[#1CF3CA]">{pack.price} TND</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">Per Pack</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-4 group-hover:text-[#FF89EB] transition-colors">{pack.name}</h3>

                                <div className="flex-grow space-y-3 mb-6">
                                    {pack.benefits?.length > 0 ? (
                                        pack.benefits.map((benefit, index) => (
                                            <div key={index} className="flex items-center gap-3 text-sm text-gray-300">
                                                <div className="w-5 h-5 rounded-full bg-[#1CF3CA]/20 flex items-center justify-center flex-shrink-0">
                                                    <Check size={12} className="text-[#1CF3CA]" />
                                                </div>
                                                <span>{benefit.benefitType} - {benefit.rateRule}</span>
                                            </div>
                                        ))
                                    ) : (
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
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                clientSecret={clientSecret}
                pack={selectedPack}
                onPaymentSuccess={handlePaymentSuccess}
            />

            {/* Description Modal */}
            {isModalOpen && selectedPack && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#1a0135] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-6 md:p-8 flex flex-col h-full max-h-[80vh]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-[#1CF3CA]">{selectedPack.name}</h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar mb-6">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {selectedPack.description || "No description provided."}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={closeModal}
                                className="w-full py-4 rounded-2xl bg-[#FF89EB] text-black font-bold text-lg hover:bg-[#FF89EB]/90 transition-all shadow-[0_0_20px_rgba(255,137,235,0.3)]"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
      `}</style>
        </div>
    );
};

export default Packs;
