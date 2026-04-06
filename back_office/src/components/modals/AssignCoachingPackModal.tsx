import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { PackCoachingDto, packCoachingApi } from "../../api/packCoaching";
import toast from "react-hot-toast";
import { BoxIcon, ChevronDownIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface AssignCoachingPackModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
    onSuccess: () => void;
}

const AssignCoachingPackModal: React.FC<AssignCoachingPackModalProps> = ({
    isOpen,
    onClose,
    userId,
    userName,
    onSuccess,
}) => {
    const [packs, setPacks] = useState<PackCoachingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [coachFilter, setCoachFilter] = useState("");
    const [isCoachDropdownOpen, setIsCoachDropdownOpen] = useState(false);

    const fetchPacks = async () => {
        setLoading(true);
        try {
            const data = await packCoachingApi.getAllPacks();
            setPacks(data);
        } catch (err: any) {
            toast.error("Failed to load coaching packs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPacks();
            setCoachFilter("");
            setIsCoachDropdownOpen(false);
        }
    }, [isOpen]);

    // Unique sorted coach names for the dropdown
    const coachNames = useMemo(() => {
        const names = packs
            .map((p) => p.coachName)
            .filter((name): name is string => !!name);
        return Array.from(new Set(names)).sort();
    }, [packs]);

    // Filtered packs based on coach name search
    const filteredPacks = useMemo(() => {
        if (!coachFilter.trim()) return packs;
        const search = coachFilter.toLowerCase();
        return packs.filter(
            (p) => p.coachName?.toLowerCase().includes(search)
        );
    }, [packs, coachFilter]);

    const handleAssign = async (packId: number) => {
        setActionLoading(packId);
        try {
            await packCoachingApi.assignPackToPlayer({ userId, packId });
            toast.success("Coaching pack assigned successfully to player!");
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to assign coaching pack");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[740px] p-0 overflow-hidden">
            <div className="p-6 sm:p-8 bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                        Assign Coaching Pack
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Choose a coaching pack for{" "}
                        <span className="font-semibold text-brand-500">{userName}</span>
                    </p>
                </div>

                {/* Filters */}
                {!loading && (
                    <div className="flex flex-wrap items-center gap-3 mb-5">
                        {/* Coach Dropdown */}
                        <div className="relative">
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                                Filter by Coach
                            </label>
                            <Button
                                onClick={() => setIsCoachDropdownOpen(!isCoachDropdownOpen)}
                                variant="outline"
                                size="sm"
                                className="w-48 dropdown-toggle justify-between"
                                endIcon={
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                            isCoachDropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                }
                            >
                                <span className="truncate">{coachFilter || "All Coaches"}</span>
                            </Button>
                            <Dropdown
                                isOpen={isCoachDropdownOpen}
                                onClose={() => setIsCoachDropdownOpen(false)}
                                className="w-48 mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-800"
                            >
                                <DropdownItem
                                    onClick={() => {
                                        setCoachFilter("");
                                        setIsCoachDropdownOpen(false);
                                    }}
                                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                                        coachFilter === ""
                                            ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                                    }`}
                                >
                                    All Coaches
                                </DropdownItem>
                                {coachNames.map((name) => (
                                    <DropdownItem
                                        key={name}
                                        onClick={() => {
                                            setCoachFilter(name);
                                            setIsCoachDropdownOpen(false);
                                        }}
                                        className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                                            coachFilter === name
                                                ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        {name}
                                    </DropdownItem>
                                ))}
                            </Dropdown>
                        </div>
                    </div>
                )}

                {/* Pack Cards */}
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500">Loading packs...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory px-2 min-h-[220px]">
                            {filteredPacks.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center py-10 text-gray-500 text-sm italic">
                                    No coaching packs found for this coach.
                                </div>
                            ) : (
                                filteredPacks.map((pack) => (
                                    <div
                                        key={pack.id}
                                        className="flex-shrink-0 w-64 snap-start p-5 rounded-2xl border transition-all duration-300 bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-brand-500/50 hover:shadow-md"
                                    >
                                        <div className="flex flex-col h-full">
                                            {/* Icon + Price */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 rounded-xl bg-brand-500/10 text-brand-500">
                                                    <BoxIcon width="20" height="20" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                                                        {pack.price.toFixed(3)} TND
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Pack name */}
                                            <h4 className="text-md font-bold text-gray-800 dark:text-white mb-1">
                                                {pack.name}
                                            </h4>

                                            {/* Hours */}
                                            <p className="text-xs text-brand-500 font-medium mb-1">
                                                {pack.hours} Hours
                                            </p>

                                            {/* Coach badge */}
                                            {pack.coachName && (
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <div className="w-4 h-4 rounded-full bg-warning-500/20 flex items-center justify-center">
                                                        <span className="text-[8px] font-bold text-warning-600">C</span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">
                                                        {pack.coachName}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Description */}
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                                                {pack.description || "No description provided."}
                                            </p>

                                            {/* Assign button */}
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
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/10">
                            <p className="text-xs text-gray-400">
                                {filteredPacks.length} pack{filteredPacks.length !== 1 ? "s" : ""} shown
                                {coachFilter ? ` · filtered by "${coachFilter}"` : ""}
                            </p>
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

export default AssignCoachingPackModal;
