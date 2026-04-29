import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Zap, Star, LayoutGrid, CheckCircle2, AlertCircle, Loader2, Award, UserCheck, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { packGamefyApi } from '../api/packGamefy';
import { packCoachingApi } from '../api/packCoaching';
import toast from 'react-hot-toast';

const PackConsumptionModal = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('gamefy'); // 'gamefy' or 'coaching'
    const [gamefyData, setGamefyData] = useState(null);
    const [coachingData, setCoachingData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [gamefy, coaching] = await Promise.allSettled([
                    packGamefyApi.getMyPackDetails(),
                    packCoachingApi.getMyPackDetails()
                ]);

                if (gamefy.status === 'fulfilled') setGamefyData(gamefy.value);
                if (coaching.status === 'fulfilled') setCoachingData(coaching.value);
            } catch (error) {
                console.error("Error fetching pack data:", error);
                toast.error("Failed to load some pack details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const ProgressCircle = ({ percentage, color = '#1CF3CA', size = 120 }) => {
        const radius = (size - 10) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white">{Math.round(percentage)}%</span>
                </div>
            </div>
        );
    };

    const ProgressBar = ({ label, current, total, color = '#1CF3CA', icon: Icon }) => {
        const percentage = total > 0 ? (current / total) * 100 : 0;
        return (
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-white/70 font-medium">
                        {Icon && <Icon size={14} className={color === '#1CF3CA' ? 'text-[#1CF3CA]' : 'text-[#DD00B8]'} />}
                        {label}
                    </div>
                    <span className="text-white font-bold">{current.toFixed(1)} / {total.toFixed(0)}h</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${color}CC, ${color})`, boxShadow: `0 0 10px ${color}44` }}
                    />
                </div>
            </div>
        );
    };

    const StatusBadge = ({ status }) => {
        const configs = {
            'ACTIVE': { color: '#1CF3CA', text: 'Active', bg: 'bg-[#1CF3CA]/10', border: 'border-[#1CF3CA]/30' },
            'EXPIRED': { color: '#FFA500', text: 'Expired', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
            'CONSUMED': { color: '#9CA3AF', text: 'Consumed', bg: 'bg-gray-500/10', border: 'border-gray-500/30' }
        };
        const config = configs[status] || configs['ACTIVE'];
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.bg} ${config.border}`} style={{ color: config.color }}>
                {config.text}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-300 font-['Inter']">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-4xl bg-[#320141] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#DD00B8]/10 via-transparent to-[#1CF3CA]/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-[#1CF3CA] to-[#0CB697] rounded-2xl shadow-[0_0_20px_rgba(28,243,202,0.3)]">
                                <Package className="text-black" size={28} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none">
                                    My Pack Tracker
                                </h2>
                                <p className="text-white/40 text-sm mt-2 font-medium">Monitor your benefits and consumption</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 hover:bg-white/5 rounded-full transition-all text-white/30 hover:text-white hover:rotate-90 duration-300"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-10 flex gap-2 p-1.5 bg-black/20 rounded-[24px] w-fit border border-white/5">
                        {['gamefy', 'coaching'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-8 py-3 rounded-[18px] text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                                    activeTab === tab ? 'text-black' : 'text-white/40 hover:text-white/60'
                                }`}
                            >
                                {activeTab === tab && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-[#1CF3CA] rounded-[18px] shadow-[0_0_15px_rgba(28,243,202,0.4)]"
                                    />
                                )}
                                <span className="relative z-10">
                                    {tab === 'gamefy' ? '🎮 Pack Gamefy' : '🎓 Coaching Pack'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    {loading ? (
                        <div className="h-96 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-[#1CF3CA]/20 border-t-[#1CF3CA] rounded-full animate-spin" />
                                <div className="absolute inset-0 bg-[#1CF3CA] blur-xl opacity-20 animate-pulse" />
                            </div>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Synchronizing Data...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'gamefy' ? (
                                <motion.div
                                    key="gamefy"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-10"
                                >
                                    {!gamefyData ? (
                                        <EmptyState title="No Active Gaming Pack" message="Purchase a Gamefy Pack to enjoy premium benefits and tracking." />
                                    ) : (
                                        <>
                                            {/* Overview Card */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="md:col-span-2 p-8 bg-white/5 rounded-[32px] border border-white/5 flex flex-col justify-between group hover:border-[#1CF3CA]/30 transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <h3 className="text-2xl font-black text-white">{gamefyData.packName}</h3>
                                                            <p className="text-[#1CF3CA] font-bold">{gamefyData.packPrice.toFixed(2)} DT</p>
                                                        </div>
                                                        <StatusBadge status={gamefyData.status} />
                                                    </div>
                                                    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                                                        <div>
                                                            <p className="text-[10px] uppercase font-black text-white/30 tracking-tighter">Activated</p>
                                                            <p className="text-white/70 font-medium text-sm">{formatDate(gamefyData.activatedAt)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] uppercase font-black text-white/30 tracking-tighter">Expires On</p>
                                                            <p className={`font-medium text-sm ${new Date(gamefyData.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'text-red-400' : 'text-white/70'}`}>
                                                                {formatDate(gamefyData.expiresAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-8 bg-[#1CF3CA]/5 rounded-[32px] border border-[#1CF3CA]/20 flex flex-col items-center justify-center text-center space-y-4">
                                                    <div className="p-4 bg-[#1CF3CA]/10 rounded-2xl">
                                                        <Clock className="text-[#1CF3CA]" size={32} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase font-black text-[#1CF3CA] tracking-widest">Total Valid Duration</p>
                                                        <p className="text-3xl font-black text-white">{gamefyData.durationMonths} Months</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hours Consumption */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <Zap className="text-[#1CF3CA]" size={20} />
                                                    <h4 className="text-lg font-bold text-white uppercase tracking-tight">Hours Consumption</h4>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-black/20 rounded-[32px] border border-white/5">
                                                    <div className="space-y-6">
                                                        <ProgressBar 
                                                            label="PC Regular Hours" 
                                                            current={gamefyData.remainingPcHours} 
                                                            total={gamefyData.totalPcHours} 
                                                            icon={LayoutGrid} 
                                                        />
                                                        <ProgressBar 
                                                            label="VIP Room Hours" 
                                                            current={gamefyData.remainingVipHours} 
                                                            total={gamefyData.totalVipHours} 
                                                            color="#DD00B8" 
                                                            icon={Award} 
                                                        />
                                                        <ProgressBar 
                                                            label="Coaching Bonus Hours" 
                                                            current={gamefyData.remainingCoachingHours} 
                                                            total={gamefyData.totalCoachingHours} 
                                                            icon={UserCheck} 
                                                        />
                                                    </div>
                                                    <div className="flex flex-col justify-center items-center space-y-4 border-l border-white/5 pl-8">
                                                        <ProgressCircle percentage={
                                                            ((gamefyData.remainingPcHours + gamefyData.remainingVipHours + gamefyData.remainingCoachingHours) / 
                                                            (gamefyData.totalPcHours + gamefyData.totalVipHours + gamefyData.totalCoachingHours)) * 100
                                                        } />
                                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Overall Usage</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Benefits Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                {/* Free Items */}
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <Package className="text-[#1CF3CA]" size={20} />
                                                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">Free Items</h4>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {gamefyData.itemBenefits.map((item) => (
                                                            <div key={item.benefitId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${item.remainingQuantity > 0 ? 'bg-[#1CF3CA]/10 text-[#1CF3CA]' : 'bg-white/5 text-white/20'}`}>
                                                                        <Zap size={16} />
                                                                    </div>
                                                                    <span className="text-white font-bold text-sm">{item.itemName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-white/40 text-xs font-medium">{item.consumedQuantity}/{item.totalQuantity}</span>
                                                                    {item.remainingQuantity > 0 ? (
                                                                        <span className="px-2 py-0.5 bg-[#1CF3CA]/20 text-[#1CF3CA] text-[9px] font-black rounded-md">{item.remainingQuantity} Left</span>
                                                                    ) : (
                                                                        <CheckCircle2 size={16} className="text-white/20" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Discounts */}
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3">
                                                        <Star className="text-[#DD00B8]" size={20} />
                                                        <h4 className="text-lg font-bold text-white uppercase tracking-tight">One-Time Discounts</h4>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {gamefyData.discountBenefits.map((disc) => (
                                                            <div key={disc.benefitId} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                                                disc.available ? 'bg-white/5 border-white/5' : 'bg-black/20 border-white/5 opacity-50'
                                                            }`}>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${disc.available ? 'bg-[#DD00B8]/10 text-[#DD00B8]' : 'bg-white/5 text-white/20'}`}>
                                                                        <Star size={16} />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-white font-bold text-sm">
                                                                            {disc.discountValue}{disc.discountType === 'PERCENTAGE' ? '%' : ' DT'} off {disc.benefitType}
                                                                        </span>
                                                                        <span className="text-white/20 text-[10px] uppercase font-black tracking-tighter">{disc.rateRule}</span>
                                                                    </div>
                                                                </div>
                                                                {disc.available ? (
                                                                    <span className="text-[#1CF3CA] font-black text-[9px] uppercase tracking-widest flex items-center gap-1">
                                                                        <CheckCircle2 size={14} /> Available
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-white/20 font-black text-[9px] uppercase tracking-widest">Consumed</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="coaching"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full"
                                >
                                    {!coachingData ? (
                                        <EmptyState title="No Active Coaching Pack" message="Ready to level up? Purchase a coaching pack to track your sessions." />
                                    ) : (
                                        <div className="space-y-10">
                                            {/* Coaching Header */}
                                            <div className="flex flex-col md:flex-row gap-8">
                                                <div className="flex-1 p-10 bg-gradient-to-br from-[#320141] to-[#24003E] rounded-[40px] border border-white/5 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                                        <Award size={160} />
                                                    </div>
                                                    <div className="flex flex-col h-full justify-between space-y-8 relative z-10">
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <StatusBadge status={coachingData.status} />
                                                                <span className="text-white/40 font-black text-[10px] tracking-[0.2em] uppercase">Coaching Program</span>
                                                            </div>
                                                            <h3 className="text-4xl font-black text-white mt-4 uppercase leading-tight md:max-w-md">
                                                                {coachingData.packName}
                                                            </h3>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-[#1CF3CA]/30">
                                                                    <UserCheck className="text-[#1CF3CA]" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Lead Coach</p>
                                                                    <p className="text-white font-bold">{coachingData.coachName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-8">
                                                                <div>
                                                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Expiration</p>
                                                                    <p className="text-white font-bold">{formatDate(coachingData.expiresAt)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Investment</p>
                                                                    <p className="text-[#1CF3CA] font-bold">{coachingData.packPrice.toFixed(2)} DT</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Circular Progress */}
                                                <div className="w-full md:w-[320px] p-8 bg-black/20 rounded-[40px] border border-white/5 flex flex-col items-center justify-center space-y-6">
                                                    <ProgressCircle percentage={(coachingData.consumedHours / coachingData.totalHours) * 100} size={180} />
                                                    <div className="text-center space-y-1">
                                                        <p className="text-3xl font-black text-white">{coachingData.remainingHours.toFixed(1)}h</p>
                                                        <p className="text-[#1CF3CA] font-black text-[10px] uppercase tracking-[0.3em]">Hours Remaining</p>
                                                    </div>
                                                    <div className="w-full pt-6 border-t border-white/5 flex justify-between px-4">
                                                        <div className="text-center">
                                                            <p className="text-white font-bold">{coachingData.totalHours.toFixed(0)}h</p>
                                                            <p className="text-white/20 text-[9px] uppercase font-black">Total</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-white/70 font-bold">{coachingData.consumedHours.toFixed(1)}h</p>
                                                            <p className="text-white/20 text-[9px] uppercase font-black">Done</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info Tip */}
                                            <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                                <div className="p-3 bg-[#1CF3CA]/10 rounded-xl">
                                                    <ShieldCheck className="text-[#1CF3CA]" />
                                                </div>
                                                <p className="text-white/60 text-sm leading-relaxed">
                                                    Your coaching hours are valid for <span className="text-white font-bold">{coachingData.durationMonths} months</span>. 
                                                    Need to reschedule? Contact your coach at least 24 hours in advance.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-black/20">
                    <button 
                        onClick={onClose}
                        className="w-full py-5 bg-[#1CF3CA] hover:bg-[#19d4b0] text-black rounded-[24px] font-black uppercase tracking-[0.2em] text-[12px] transition-all active:scale-95 shadow-[0_10px_20px_rgba(28,243,202,0.2)]"
                    >
                        Close Tracker
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const EmptyState = ({ title, message }) => (
    <div className="h-96 flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-8 bg-white/5 rounded-full border border-white/5 border-dashed">
            <AlertCircle size={48} className="text-white/10" />
        </div>
        <div>
            <h4 className="text-xl font-bold text-white/80">{title}</h4>
            <p className="text-white/30 max-w-sm mt-2">{message}</p>
        </div>
    </div>
);

export default PackConsumptionModal;
