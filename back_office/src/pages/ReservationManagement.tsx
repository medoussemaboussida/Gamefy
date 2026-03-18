import { useEffect, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { reservationApi, ReservationDto, Reservation_Status, Reservation_Type } from "../api/reservation";
import toast from "react-hot-toast";
import Pagination from "../components/ui/pagination/Pagination";
import Badge from "../components/ui/badge/Badge";
import Button from "../components/ui/button/Button";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { ChevronDownIcon, TrashBinIcon } from "../icons";
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";

export default function ReservationManagement() {
    const [reservations, setReservations] = useState<ReservationDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedType, setSelectedType] = useState<string>("ALL");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRes, setSelectedRes] = useState<{id: number, playerName: string} | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const itemsPerPage = 5;

    const typeOptions = [
        { value: "ALL", label: "All Types" },
        { value: Reservation_Type.PC_ROOM, label: "PC Room" },
        { value: Reservation_Type.VIP_ROOM, label: "VIP Room" },
        { value: Reservation_Type.COACHING_ROOM, label: "Coaching" },
    ];

    const statusOptions = [
        { value: "ALL", label: "All Statuses" },
        { value: Reservation_Status.PENDING, label: "Pending" },
        { value: Reservation_Status.CONFIRMED, label: "Confirmed" },
        { value: Reservation_Status.CANCELLED, label: "Cancelled" },
    ];

    const fetchReservations = async () => {
        try {
            const data = await reservationApi.getAllReservations();
            setReservations(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch reservations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedType, selectedStatus]);

    const filteredReservations = (reservations || []).filter((res) => {
        const typeMatch = selectedType === "ALL" || res.reservationType === selectedType;
        const statusMatch = selectedStatus === "ALL" || res.status === selectedStatus;
        return typeMatch && statusMatch;
    });

    const totalItems = filteredReservations.length;
    const currentReservations = filteredReservations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const handleDeleteClick = (id: number, playerName: string) => {
        setSelectedRes({ id, playerName });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedRes) return;
        
        setDeleteLoading(true);
        try {
            await reservationApi.deleteReservation(selectedRes.id);
            toast.success("Reservation deleted successfully");
            fetchReservations();
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete reservation");
        } finally {
            setDeleteLoading(false);
        }
    };

    const getStatusColor = (status: Reservation_Status) => {
        switch (status) {
            case Reservation_Status.CONFIRMED:
                return "success";
            case Reservation_Status.PENDING:
                return "warning";
            case Reservation_Status.CANCELLED:
                return "error";
            default:
                return "light";
        }
    };

    const getTypeColor = (type: Reservation_Type) => {
        switch (type) {
            case Reservation_Type.COACHING_ROOM:
                return "info";
            case Reservation_Type.VIP_ROOM:
                return "warning";
            case Reservation_Type.PC_ROOM:
                return "success";
            default:
                return "light";
        }
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <>
            <PageMeta
                title="Reservation Management | Gamefy Admin"
                description="Monitor all user bookings"
            />
            <PageBreadcrumb pageTitle="Reservation Management" />

            <div className="space-y-6">
                <ComponentCard title="All Reservations">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <div className="relative">
                            <Button
                                onClick={() => setIsTypeOpen(!isTypeOpen)}
                                variant="primary"
                                size="sm"
                                className="w-40 dropdown-toggle"
                                endIcon={
                                    <ChevronDownIcon
                                        className={`w-5 h-5 transition-transform duration-200 ${isTypeOpen ? "rotate-180" : ""}`}
                                    />
                                }
                            >
                                {typeOptions.find(opt => opt.value === selectedType)?.label}
                            </Button>
                            <Dropdown
                                isOpen={isTypeOpen}
                                onClose={() => setIsTypeOpen(false)}
                                className="w-40 mt-2"
                            >
                                {typeOptions.map((option) => (
                                    <DropdownItem
                                        key={option.value}
                                        onClick={() => {
                                            setSelectedType(option.value);
                                            setIsTypeOpen(false);
                                        }}
                                        className={selectedType === option.value ? "bg-brand-50 text-brand-500" : ""}
                                    >
                                        {option.label}
                                    </DropdownItem>
                                ))}
                            </Dropdown>
                        </div>

                        <div className="relative">
                            <Button
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                                variant="primary"
                                size="sm"
                                className="w-40 dropdown-toggle"
                                endIcon={
                                    <ChevronDownIcon
                                        className={`w-5 h-5 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`}
                                    />
                                }
                            >
                                {statusOptions.find(opt => opt.value === selectedStatus)?.label}
                            </Button>
                            <Dropdown
                                isOpen={isStatusOpen}
                                onClose={() => setIsStatusOpen(false)}
                                className="w-40 mt-2"
                            >
                                {statusOptions.map((option) => (
                                    <DropdownItem
                                        key={option.value}
                                        onClick={() => {
                                            setSelectedStatus(option.value);
                                            setIsStatusOpen(false);
                                        }}
                                        className={selectedStatus === option.value ? "bg-brand-50 text-brand-500" : ""}
                                    >
                                        {option.label}
                                    </DropdownItem>
                                ))}
                            </Dropdown>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        {/* Desktop Table */}
                        <div className="hidden lg:block max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Type
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Player
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Coach
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            PC / Game
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Price
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Schedule
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Status
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                                                Loading reservations...
                                            </TableCell>
                                        </TableRow>
                                    ) : currentReservations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                                                No reservations found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentReservations.map((res) => (
                                            <TableRow key={res.id}>
                                                <TableCell className="px-5 py-4 text-start cursor-default">
                                                    <Badge size="sm" color={getTypeColor(res.reservationType)}>
                                                        {res.reservationType.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                    {res.playerName}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                                    {res.coachName || "—"}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                                            PCs: {res.pcNumbers.join(', ')}
                                                        </span>
                                                        {res.game && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                                {res.game}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start font-semibold text-gray-900 dark:text-white">
                                                    DT {res.priceTime.toFixed(3)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <div className="flex flex-col text-xs text-gray-500 gap-1 uppercase">
                                                        <span className="font-medium text-brand-500">{formatDateTime(res.startTime)}</span>
                                                        <span>To</span>
                                                        <span className="font-medium text-brand-500">{formatDateTime(res.endTime)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <Badge size="sm" color={getStatusColor(res.status)}>
                                                        {res.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDeleteClick(res.id, res.playerName)}
                                                            className="p-2 transition-colors duration-200 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                                                            title="Delete Reservation"
                                                        >
                                                            <TrashBinIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile/Tablet Card View */}
                        <div className="lg:hidden divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <div className="p-10 text-center text-gray-500">Loading reservations...</div>
                            ) : currentReservations.length === 0 ? (
                                <div className="p-10 text-center text-gray-500">No reservations found</div>
                            ) : (
                                currentReservations.map((res) => (
                                    <div key={res.id} className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge size="sm" color={getTypeColor(res.reservationType)}>
                                                    {res.reservationType.replace('_', ' ')}
                                                </Badge>
                                                <h4 className="mt-2 font-semibold text-gray-900 dark:text-white">
                                                    {res.playerName}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge size="sm" color={getStatusColor(res.status)}>
                                                    {res.status}
                                                </Badge>
                                                <button
                                                    onClick={() => handleDeleteClick(res.id, res.playerName)}
                                                    className="p-1 px-2 transition-colors duration-200 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                                                >
                                                    <TrashBinIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">Coach</p>
                                                <p className="font-medium text-gray-800 dark:text-white/90">{res.coachName || "—"}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">Price</p>
                                                <p className="font-semibold text-brand-500 dark:text-brand-400">DT {res.priceTime.toFixed(3)}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">PCs / Game</p>
                                                <p className="font-medium text-gray-800 dark:text-white/90">
                                                    PCs: {res.pcNumbers.join(', ')} {res.game && `| ${res.game}`}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase mb-1">Schedule</p>
                                                <div className="flex items-center gap-2 text-brand-500 font-medium font-medium">
                                                    <span>{formatDateTime(res.startTime)}</span>
                                                    <span className="text-gray-400">→</span>
                                                    <span>{formatDateTime(res.endTime)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                </ComponentCard>
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                userName={selectedRes?.playerName || "this reservation"}
                loading={deleteLoading}
            />
        </>
    );
}
