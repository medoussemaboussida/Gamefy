import React, { useEffect, useState } from 'react';
import { X, CreditCard, Calendar, ShoppingBag, Receipt, Loader2, Filter, ChevronDown } from 'lucide-react';
import { paymentApi } from '../api/payment';
import toast from 'react-hot-toast';

const PaymentHistoryModal = ({ onClose }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("ALL");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filterOptions = [
        { value: "ALL", label: "All Transactions" },
        { value: "Reservation", label: "Reservations" },
        { value: "Pack Gamefy", label: "Gamefy Packs" },
        { value: "Pack Coaching", label: "Coaching Packs" },
    ];

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await paymentApi.getMyPaymentHistory();
                setPayments(data);
            } catch (error) {
                toast.error("Failed to load payment history");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString + "Z").toLocaleDateString(undefined, options);
    };

    const filteredPayments = payments.filter(p => {
        if (filterType === "ALL") return true;
        return p.paidFor.startsWith(filterType);
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div className="relative w-full max-w-2xl bg-[#320141] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#DD00B8]/10 to-[#1CF3CA]/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#1CF3CA]/10 rounded-2xl">
                                <Receipt className="text-[#1CF3CA]" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white font-['Inter'] uppercase tracking-tight">
                                    Payment History
                                </h2>
                                <p className="text-white/40 text-sm font-medium">Keep track of your transactions</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Filter Dropdown (Styled like Rooms.jsx) */}
                    <div className="mt-8 relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="bg-gradient-to-r from-[#DD00B8] to-[#2BDFC8] px-6 h-[46px] rounded-[18px] text-white font-bold flex items-center gap-2 hover:opacity-90 transition-all text-[15px] whitespace-nowrap shadow-lg shadow-black/20"
                        >
                            <Filter size={18} />
                            <span>{filterOptions.find(opt => opt.value === filterType)?.label}</span>
                            <ChevronDown size={18} className={`transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)}></div>
                                <div className="absolute left-0 mt-3 w-64 bg-[#320141]/95 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl p-2 z-20 animate-in fade-in zoom-in duration-200">
                                    {filterOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setFilterType(option.value);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full flex items-center px-5 py-3 rounded-xl text-[14px] font-bold transition-all ${filterType === option.value
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
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center space-y-4">
                            <Loader2 size={40} className="text-[#1CF3CA] animate-spin" />
                            <p className="text-white/40 font-medium">Loading your records...</p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center">
                            <ShoppingBag size={48} className="text-white/5" />
                            <div>
                                <p className="text-white/60 font-bold">No transactions found</p>
                                <p className="text-white/20 text-sm mt-1">
                                    {filterType === "ALL" 
                                        ? "When you make a purchase, it will appear here." 
                                        : `No transactions found for ${filterOptions.find(o => o.value === filterType)?.label}.`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPayments.map((payment) => (
                                <div 
                                    key={payment.id}
                                    className="group relative p-6 bg-white/5 border border-white/5 rounded-3xl hover:border-[#1CF3CA]/30 hover:bg-white/[0.07] transition-all"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-xl text-white/40 group-hover:text-[#1CF3CA] transition-colors">
                                                <CreditCard size={20} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-white font-bold font-['Inter'] leading-none">
                                                    {payment.paidFor}
                                                </p>
                                                <div className="flex items-center gap-2 text-white/30 text-xs font-medium">
                                                    <Calendar size={12} />
                                                    {formatDate(payment.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#1CF3CA] font-black font-['Inter'] text-lg">
                                                {payment.totalPrice.toFixed(3)} DT
                                            </p>
                                            <span className="text-[10px] uppercase tracking-widest font-black text-white/20">Success</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-black/20">
                    <button 
                        onClick={onClose}
                        className="w-full py-5 bg-[#1CF3CA] hover:bg-[#19d4b0] text-black rounded-[24px] font-black uppercase tracking-[0.5em] text-[13px] transition-all active:scale-95 shadow-[0_10px_20px_rgba(28,243,202,0.2)]"
                    >
                        Close History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistoryModal;
