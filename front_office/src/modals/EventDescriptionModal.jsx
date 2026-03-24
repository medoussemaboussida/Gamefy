import React from "react";
import { X } from "lucide-react";

const EventDescriptionModal = ({ open, title, description, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-[#320141]/95 backdrop-blur-xl border border-white/10 rounded-[30px] shadow-2xl max-w-[500px] w-full p-8 z-10 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all"
                >
                    <X size={18} />
                </button>
                <h3 className="text-xl font-black font-[inter] uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#2BDFC8] pr-10 mb-4">
                    {title}
                </h3>
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventDescriptionModal;
