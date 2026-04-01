import React from "react";
import { X, FileText } from "lucide-react";

const PackDescriptionModal = ({ isOpen, onClose, description, packName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-[#1a0b2e] border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-[#FF89EB]/10 text-[#FF89EB]">
                            <FileText size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white pr-8">
                            {packName} Description
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all shadow-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
                    {description ? (
                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {description}
                        </p>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-center py-10">
                            <FileText size={40} className="mb-2" />
                            <p className="italic">No description provided for this pack.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full h-14 bg-white/5 border border-white/10 text-white font-medium rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PackDescriptionModal;
