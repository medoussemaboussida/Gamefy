import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { PackGamefyDto, packGamefyApi } from "../../api/packGamefy";
import toast from "react-hot-toast";
import { BoxIcon } from "../../icons";

interface AssignPackModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
    onSuccess: () => void;
}

const AssignPackModal: React.FC<AssignPackModalProps> = ({ isOpen, onClose, userId, userName, onSuccess }) => {
    const [packs, setPacks] = useState<PackGamefyDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchPacks = async () => {
        setLoading(true);
        try {
            const data = await packGamefyApi.getAllPacks();
            setPacks(data);
        } catch (err: any) {
            toast.error("Failed to load packs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPacks();
        }
    }, [isOpen]);

    const handleAssign = async (packId: number) => {
        setActionLoading(packId);
        try {
            await packGamefyApi.assignPackToPlayer({ userId, packId });
            toast.success("Pack assigned successfully to player!");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to assign pack");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-0 overflow-hidden">
            <div className="p-6 sm:p-8 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                            Assign Gamefy pack
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Choose a pack for <span className="font-semibold text-brand-500">{userName}</span>
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500">Loading packs...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory px-2">
                            {packs.map((pack) => (
                                <div
                                    key={pack.id}
                                    className="flex-shrink-0 w-64 snap-start p-5 rounded-2xl border transition-all duration-300 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-brand-500/50"
                                >
                                    <div className="flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500">
                                                <BoxIcon width="20" height="20" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-800 dark:text-white">{pack.price.toFixed(3)} DT</p>
                                            </div>
                                        </div>

                                        <h4 className="text-md font-bold text-gray-800 dark:text-white mb-2">{pack.name}</h4>

                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                            {pack.description}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/10">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleAssign(pack.id)}
                                                loading={actionLoading === pack.id}
                                                disabled={actionLoading !== null}
                                            >
                                                Assign pack
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-end pt-6 border-t border-gray-100 dark:border-white/10">
                            <Button variant="outline" size="sm" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(100, 116, 139, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(100, 116, 139, 0.4);
                }
            `}</style>
        </Modal>
    );
};

export default AssignPackModal;
