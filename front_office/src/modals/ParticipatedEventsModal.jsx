import React from 'react';
import { X, Calendar, MapPin, FileText, Trash2, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ParticipatedEventsModal = ({ events, onClose, onCancel, onShowDescription }) => {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-300 font-['Inter']">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-3xl bg-[#320141] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#FF89EB]/10 to-[#1CF3CA]/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-[#FF89EB] to-[#DD00B8] rounded-2xl shadow-[0_0_20px_rgba(255,137,235,0.3)]">
                                <Calendar className="text-white" size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                                    My Participated Events
                                </h2>
                                <p className="text-white/40 text-sm mt-2 font-medium">Manage your event registrations</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 hover:bg-white/5 rounded-full transition-all text-white/30 hover:text-white hover:rotate-90 duration-300"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                    {events.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="p-6 bg-white/5 rounded-full border border-white/5 border-dashed">
                                <Info size={40} className="text-white/10" />
                            </div>
                            <div>
                                <p className="text-white/60 font-bold">No active registrations</p>
                                <p className="text-white/20 text-sm mt-1">Explore upcoming events to join the community!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div 
                                    key={event.id}
                                    className="group relative p-6 bg-white/5 border border-white/5 rounded-[30px] hover:border-[#1CF3CA]/30 hover:bg-white/[0.08] transition-all duration-300"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-[#1CF3CA] transition-colors leading-tight">
                                                {event.title}
                                            </h3>
                                            
                                            <div className="flex flex-wrap gap-6">
                                                <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                                                    <Calendar size={16} className="text-[#1CF3CA]" />
                                                    {formatDate(event.startTime)}
                                                </div>
                                                <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                                                    <MapPin size={16} className="text-[#FF89EB]" />
                                                    {event.place}
                                                </div>
                                            </div>

                                            <div className="flex gap-4 pt-2">
                                                <button
                                                    onClick={() => onShowDescription(event)}
                                                    className="inline-flex items-center gap-2 text-[#1CF3CA] hover:text-[#19d4b0] text-[11px] font-black uppercase tracking-wider transition-all"
                                                >
                                                    <FileText size={14} />
                                                    Read Description
                                                </button>
                                                {event.registerLink && (
                                                    <a
                                                        href={event.registerLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-[#FF89EB] hover:text-[#ff6bd9] text-[11px] font-black uppercase tracking-wider transition-all"
                                                    >
                                                        <ExternalLink size={14} />
                                                        External Link
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                                            <button
                                                onClick={() => onCancel(event.id)}
                                                className="group/btn flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-500 hover:text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-[0_4px_15px_rgba(239,68,68,0.1)]"
                                            >
                                                <Trash2 size={14} className="group-hover/btn:animate-pulse" />
                                                Cancel Participation
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-black/10">
                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95"
                    >
                        Close Registry
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ParticipatedEventsModal;
