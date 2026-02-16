import React from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

const DeleteConfirmationModal = ({ title, message, onConfirm, onCancel, isLoading }) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-[#1a0b2e] border border-red-500/20 rounded-[32px] p-8 shadow-2xl shadow-red-500/10">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                    {/* Warning Icon Box */}
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3">
                        {title || "Delete Confirmation"}
                    </h2>

                    <p className="text-white/60 text-sm leading-relaxed mb-8">
                        {message || "Are you sure you want to delete this item? This action cannot be revoked."}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Confirm Deletion"}
                        </button>

                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="w-full h-12 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
