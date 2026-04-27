import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { packGamefyApi, UserPackResponseDto } from "../../api/packGamefy";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Button from "../ui/button/Button";
import toast from "react-hot-toast";

interface PackPlayersModalProps {
    isOpen: boolean;
    onClose: () => void;
    packId: number | null;
    packName: string;
}

const PackPlayersModal: React.FC<PackPlayersModalProps> = ({
    isOpen,
    onClose,
    packId,
    packName,
}) => {
    const [players, setPlayers] = useState<UserPackResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && packId) {
            fetchPlayers();
            setExpandedPlayer(null);
        }
    }, [isOpen, packId]);

    const fetchPlayers = async () => {
        if (!packId) return;
        setLoading(true);
        try {
            const data = await packGamefyApi.getPackPlayers(packId);
            setPlayers(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch players");
        } finally {
            setLoading(false);
        }
    };

    const handleConsume = async (userPackId: number, benefitId: number) => {
        const key = `${userPackId}-${benefitId}-consume`;
        setActionLoading(key);
        try {
            await packGamefyApi.consumeItemBenefit(userPackId, benefitId);
            toast.success("Item consumed ✓");
            await fetchPlayers();
        } catch (error: any) {
            toast.error(error.message || "Failed to consume item");
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnconsume = async (userPackId: number, benefitId: number) => {
        const key = `${userPackId}-${benefitId}-unconsume`;
        setActionLoading(key);
        try {
            await packGamefyApi.unconsumeItemBenefit(userPackId, benefitId);
            toast.success("Item unconstumed");
            await fetchPlayers();
        } catch (error: any) {
            toast.error(error.message || "Failed to unconsume item");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "success";
            case "CONSUMED":
                return "warning";
            case "EXPIRED":
                return "error";
            default:
                return "info";
        }
    };

    const hasAnyItemBenefits = players.some(
        (p) => p.itemBenefits && p.itemBenefits.length > 0
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[800px] p-6 sm:p-8"
        >
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Players for Pack: {packName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Listing all users who have purchased this pack.
                        {hasAnyItemBenefits && " Click a row to manage free item consumption."}
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto max-h-[500px] overflow-y-auto scrollbar">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.03]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Player Name
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Email
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Status
                                    </TableCell>
                                    {hasAnyItemBenefits && (
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Items
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={hasAnyItemBenefits ? 4 : 3} className="px-5 py-10 text-center text-gray-500">
                                            Loading players...
                                        </TableCell>
                                    </TableRow>
                                ) : players.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={hasAnyItemBenefits ? 4 : 3} className="px-5 py-10 text-center text-gray-500">
                                            No players found for this pack.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    players.map((player, index) => {
                                        const totalItems = player.itemBenefits?.reduce((sum, ib) => sum + ib.itemQuantity, 0) || 0;
                                        const totalConsumed = player.itemBenefits?.reduce((sum, ib) => sum + ib.consumedQuantity, 0) || 0;

                                        return (
                                            <React.Fragment key={index}>
                                                <TableRow
                                                    className={
                                                        player.itemBenefits && player.itemBenefits.length > 0
                                                            ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                                            : ""
                                                    }
                                                    onClick={() => {
                                                        if (player.itemBenefits && player.itemBenefits.length > 0) {
                                                            setExpandedPlayer(expandedPlayer === index ? null : index);
                                                        }
                                                    }}
                                                >
                                                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                        {player.firstName} {player.lastName}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                                        {player.email}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-start">
                                                        <Badge size="sm" color={getStatusColor(player.status)}>
                                                            {player.status}
                                                        </Badge>
                                                    </TableCell>
                                                    {hasAnyItemBenefits && (
                                                        <TableCell className="px-5 py-4 text-start">
                                                            {player.itemBenefits && player.itemBenefits.length > 0 ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {totalConsumed}/{totalItems} used
                                                                    </span>
                                                                    <span className="text-xs text-brand-500">
                                                                        {expandedPlayer === index ? "▲" : "▼"}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">—</span>
                                                            )}
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                                {/* Expandable item benefits row */}
                                                {expandedPlayer === index && player.itemBenefits && player.itemBenefits.length > 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={hasAnyItemBenefits ? 4 : 3} className="px-5 py-0">
                                                            <div className="py-3 pl-6 pr-2 bg-gray-50/50 dark:bg-white/[0.01] rounded-lg my-1">
                                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                                                                    🎁 Free Items
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    {player.itemBenefits.map((item) => {
                                                                        const remaining = item.itemQuantity - item.consumedQuantity;
                                                                        const fullyConsumed = remaining <= 0;
                                                                        const consumeKey = `${player.userPackId}-${item.benefitId}-consume`;
                                                                        const unconsumeKey = `${player.userPackId}-${item.benefitId}-unconsume`;
                                                                        const isConsuming = actionLoading === consumeKey;
                                                                        const isUnconsuming = actionLoading === unconsumeKey;

                                                                        return (
                                                                            <div
                                                                                key={item.benefitId}
                                                                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                                                                    fullyConsumed
                                                                                        ? "bg-success-50 border-success-200 dark:bg-success-500/5 dark:border-success-500/20"
                                                                                        : "bg-white border-gray-200 dark:bg-white/[0.02] dark:border-white/10"
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <span className="text-lg">
                                                                                        {fullyConsumed ? "✅" : "🎁"}
                                                                                    </span>
                                                                                    <div>
                                                                                        <span className={`text-sm font-medium ${
                                                                                            fullyConsumed
                                                                                                ? "text-success-600 dark:text-success-400"
                                                                                                : "text-gray-800 dark:text-white/90"
                                                                                        }`}>
                                                                                            {item.itemName}
                                                                                        </span>
                                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                                            <span className={`text-xs font-semibold ${
                                                                                                fullyConsumed
                                                                                                    ? "text-success-500"
                                                                                                    : "text-amber-500"
                                                                                            }`}>
                                                                                                {item.consumedQuantity}/{item.itemQuantity} consumed
                                                                                            </span>
                                                                                            {remaining > 0 && (
                                                                                                <span className="text-[10px] text-gray-400">
                                                                                                    ({remaining} remaining)
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    {/* Minus button */}
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleUnconsume(player.userPackId, item.benefitId);
                                                                                        }}
                                                                                        disabled={item.consumedQuantity <= 0 || isUnconsuming}
                                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                                                    >
                                                                                        {isUnconsuming ? (
                                                                                            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                                        ) : "−"}
                                                                                    </button>
                                                                                    {/* Count display */}
                                                                                    <span className="w-8 text-center text-sm font-bold text-gray-800 dark:text-white/90">
                                                                                        {item.consumedQuantity}
                                                                                    </span>
                                                                                    {/* Plus button */}
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleConsume(player.userPackId, item.benefitId);
                                                                                        }}
                                                                                        disabled={fullyConsumed || isConsuming}
                                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-success-500 text-white hover:bg-success-600 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                                                    >
                                                                                        {isConsuming ? (
                                                                                            <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                                                        ) : "+"}
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PackPlayersModal;
