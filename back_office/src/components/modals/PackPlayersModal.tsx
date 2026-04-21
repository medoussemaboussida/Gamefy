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

    useEffect(() => {
        if (isOpen && packId) {
            fetchPlayers();
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[700px] p-6 sm:p-8"
        >
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Players for Pack: {packName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Listing all users who have purchased this pack.
                    </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto max-h-[400px] overflow-y-auto scrollbar">
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
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="px-5 py-10 text-center text-gray-500">
                                            Loading players...
                                        </TableCell>
                                    </TableRow>
                                ) : players.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="px-5 py-10 text-center text-gray-500">
                                            No players found for this pack.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    players.map((player, index) => (
                                        <TableRow key={index}>
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
                                        </TableRow>
                                    ))
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
