import { useEffect, useRef, useState } from "react";
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
import { userApi, UserResponseDto } from "../api/user";
import toast from "react-hot-toast";
import Pagination from "../components/ui/pagination/Pagination";
import Badge, { BadgeColor } from "../components/ui/badge/Badge";
import Button from "../components/ui/button/Button";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { ChevronDownIcon, TrashBinIcon, TimeIcon, AlertIcon } from "../icons";
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";
import StatusChangeModal from "../components/modals/StatusChangeModal";

// ─── Countdown Timer ─────────────────────────────────────────────────────────

const CountdownTimer = ({ createdAt }: { createdAt: string }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calc = () => {
            const created = new Date(createdAt.includes("Z") ? createdAt : createdAt + "Z");
            const expiresAt = new Date(created.getTime() + 24 * 60 * 60 * 1000);
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft("Expired");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${hours}h ${mins}m`);
            setIsUrgent(hours < 2);
        };

        calc();
        const interval = setInterval(calc, 60000);
        return () => clearInterval(interval);
    }, [createdAt]);

    if (isExpired) {
        return (
            <span className="flex items-center gap-1 mt-1 text-error-500 text-[10px] font-medium uppercase">
                <AlertIcon className="w-3 h-3" /> Expired
            </span>
        );
    }

    return (
        <span className={`flex items-center gap-1 mt-1 text-[10px] font-medium uppercase ${isUrgent ? "text-error-500" : "text-warning-500"}`}>
            <TimeIcon className="w-3 h-3" /> {timeLeft} left
        </span>
    );
};

// ─── Status Dropdown Cell ────────────────────────────────────────────────────

interface StatusCellProps {
    res: ReservationDto;
    onStatusChange: (res: ReservationDto, status: Reservation_Status) => void;
}

function StatusCell({ res, onStatusChange }: StatusCellProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const getStatusColor = (status: Reservation_Status) => {
        switch (status) {
            case Reservation_Status.CONFIRMED: return "success";
            case Reservation_Status.PENDING: return "warning";
            case Reservation_Status.CANCELLED: return "error";
            default: return "light";
        }
    };

    const allStatuses = [
        Reservation_Status.PENDING,
        Reservation_Status.CONFIRMED,
        Reservation_Status.CANCELLED,
    ];

    const getPaymentBadge = () => {
        if (!res.paymentType) return null;
        let color: BadgeColor = "warning";
        let label = "Cash";
        if (res.paymentType === "PACK_COVERED") {
            color = "success";
            label = "Pack";
        } else if (res.paymentType === "CARD_PAYMENT") {
            color = "info";
            label = "Card";
        }
        return (
            <Badge size="sm" variant="solid" color={color} className="text-[9px] py-0 px-1.5 leading-tight mb-1 uppercase tracking-tight">
                {label}
            </Badge>
        );
    };

    return (
        <div ref={ref} className="relative inline-block">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex flex-col items-start gap-0.5 group"
                title="Click to change status"
            >
                {getPaymentBadge()}
                <div className="flex items-center gap-1">
                    <Badge size="sm" color={getStatusColor(res.status)}>
                        {res.status}
                    </Badge>
                    <ChevronDownIcon
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                </div>
                {(res.status === Reservation_Status.PENDING || res.status === Reservation_Status.CANCELLED) && (
                    <CountdownTimer createdAt={res.createdAt} />
                )}
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1 z-20 min-w-[140px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] rounded-xl shadow-lg py-1">
                    {allStatuses.map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setOpen(false);
                                if (s !== res.status) onStatusChange(res, s);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.05]
                                ${s === res.status ? "opacity-40 cursor-default" : "cursor-pointer"}`}
                        >
                            <Badge size="sm" color={getStatusColor(s)}>{s}</Badge>
                            {s === res.status && <span className="text-xs text-gray-400">(current)</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ReservationManagement() {
    const [reservations, setReservations] = useState<ReservationDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedType, setSelectedType] = useState<string>("ALL");
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [selectedCoachId, setSelectedCoachId] = useState<string>("ALL");
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [coaches, setCoaches] = useState<UserResponseDto[]>([]);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isCoachOpen, setIsCoachOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRes, setSelectedRes] = useState<{ id: number, playerName: string } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Status change modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusChangeTarget, setStatusChangeTarget] = useState<{ res: ReservationDto; status: Reservation_Status } | null>(null);
    const [statusChangeLoading, setStatusChangeLoading] = useState(false);

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

    const fetchCoaches = async () => {
        try {
            const data = await userApi.getCoaches();
            setCoaches(data);
        } catch (error: any) {
            console.error("Failed to fetch coaches", error);
        }
    };

    useEffect(() => {
        fetchReservations();
        fetchCoaches();
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            try {
                if (searchKeyword.trim()) {
                    const data = await reservationApi.searchReservations(searchKeyword.trim());
                    setReservations(data);
                } else {
                    const data = await reservationApi.getAllReservations();
                    setReservations(data);
                }
            } catch (error: any) {
                toast.error(error.message || "Search failed");
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchKeyword]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedType, selectedStatus, selectedCoachId, sortOrder, searchKeyword]);

    const filteredReservations = (reservations || [])
        .filter((res) => {
            const typeMatch = selectedType === "ALL" || res.reservationType === selectedType;
            const statusMatch = selectedStatus === "ALL" || res.status === selectedStatus;
            const coachMatch = selectedCoachId === "ALL" || res.coachId === Number(selectedCoachId);
            return typeMatch && statusMatch && coachMatch;
        })
        .sort((a, b) => {
            const dateA = new Date(a.startTime.endsWith("Z") ? a.startTime : a.startTime + "Z").getTime();
            const dateB = new Date(b.startTime.endsWith("Z") ? b.startTime : b.startTime + "Z").getTime();
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

    const totalItems = filteredReservations.length;
    const currentReservations = filteredReservations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    // ── Delete handlers ──────────────────────────────────────────────────────

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

    // ── Status change handlers ───────────────────────────────────────────────

    const handleStatusChange = (res: ReservationDto, status: Reservation_Status) => {
        setStatusChangeTarget({ res, status });
        setIsStatusModalOpen(true);
    };

    const handleConfirmStatusChange = async () => {
        if (!statusChangeTarget) return;
        setStatusChangeLoading(true);
        try {
            const updated = await reservationApi.updateStatus(statusChangeTarget.res.id, statusChangeTarget.status);
            // Update in place
            setReservations((prev) =>
                prev.map((r) => (r.id === updated.id ? updated : r))
            );

            if (statusChangeTarget.status === Reservation_Status.CONFIRMED) {
                toast.success("Reservation confirmed & payment record created!");
            } else if (statusChangeTarget.status === Reservation_Status.CANCELLED) {
                toast.success("Reservation cancelled. It will be auto-deleted after 24 hours.");
            } else {
                toast.success("Reservation status updated to PENDING.");
            }

            setIsStatusModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setStatusChangeLoading(false);
        }
    };

    // ── Helpers ──────────────────────────────────────────────────────────────

    const getTypeColor = (type: Reservation_Type) => {
        switch (type) {
            case Reservation_Type.COACHING_ROOM: return "info";
            case Reservation_Type.VIP_ROOM: return "warning";
            case Reservation_Type.PC_ROOM: return "success";
            default: return "light";
        }
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr.endsWith("Z") ? dateStr : dateStr + "Z");
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
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                id="reservation-search-input"
                                type="text"
                                placeholder="Search by player or coach name..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="h-[38px] w-72 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-brand-500"
                            />
                            {searchKeyword && (
                                <button
                                    onClick={() => setSearchKeyword("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

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

                        {/* Coach Filter */}
                        <div className="relative">
                            <Button
                                onClick={() => setIsCoachOpen(!isCoachOpen)}
                                variant="primary"
                                size="sm"
                                className="w-48 dropdown-toggle"
                                endIcon={
                                    <ChevronDownIcon
                                        className={`w-5 h-5 transition-transform duration-200 ${isCoachOpen ? "rotate-180" : ""}`}
                                    />
                                }
                            >
                                {selectedCoachId === "ALL" ? "All Coaches" : coaches.find(c => String(c.id) === selectedCoachId)?.firstName + ' ' + coaches.find(c => String(c.id) === selectedCoachId)?.lastName}
                            </Button>
                            <Dropdown
                                isOpen={isCoachOpen}
                                onClose={() => setIsCoachOpen(false)}
                                className="w-48 mt-2 max-h-64 overflow-y-auto"
                            >
                                <DropdownItem
                                    onClick={() => {
                                        setSelectedCoachId("ALL");
                                        setIsCoachOpen(false);
                                    }}
                                    className={selectedCoachId === "ALL" ? "bg-brand-50 text-brand-500" : ""}
                                >
                                    All Coaches
                                </DropdownItem>
                                {coaches.map((coach) => (
                                    <DropdownItem
                                        key={coach.id}
                                        onClick={() => {
                                            setSelectedCoachId(String(coach.id));
                                            setIsCoachOpen(false);
                                        }}
                                        className={selectedCoachId === String(coach.id) ? "bg-brand-50 text-brand-500" : ""}
                                    >
                                        {coach.firstName} {coach.lastName}
                                    </DropdownItem>
                                ))}
                            </Dropdown>
                        </div>

                        {/* Sort Order */}
                        <div className="relative">
                            <Button
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                variant="primary"
                                size="sm"
                                className="w-40 dropdown-toggle"
                                endIcon={
                                    <ChevronDownIcon
                                        className={`w-5 h-5 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                                    />
                                }
                            >
                                {sortOrder === "newest" ? "Newest " : "Oldest"}
                            </Button>
                            <Dropdown
                                isOpen={isSortOpen}
                                onClose={() => setIsSortOpen(false)}
                                className="w-40 mt-2"
                            >
                                <DropdownItem
                                    onClick={() => {
                                        setSortOrder("newest");
                                        setIsSortOpen(false);
                                    }}
                                    className={sortOrder === "newest" ? "bg-brand-50 text-brand-500" : ""}
                                >
                                    Newest First
                                </DropdownItem>
                                <DropdownItem
                                    onClick={() => {
                                        setSortOrder("oldest");
                                        setIsSortOpen(false);
                                    }}
                                    className={sortOrder === "oldest" ? "bg-brand-50 text-brand-500" : ""}
                                >
                                    Oldest First
                                </DropdownItem>
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
                                            <TableCell colSpan={8} className="px-5 py-10 text-center text-gray-500">
                                                Loading reservations...
                                            </TableCell>
                                        </TableRow>
                                    ) : currentReservations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="px-5 py-10 text-center text-gray-500">
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
                                                    <StatusCell res={res} onStatusChange={handleStatusChange} />
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
                                                <StatusCell res={res} onStatusChange={handleStatusChange} />
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
                                                <div className="flex items-center gap-2 text-brand-500 font-medium">
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

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                userName={selectedRes ? `the reservation of ${selectedRes.playerName}` : "this reservation"}
                loading={deleteLoading}
            />

            {/* Status Change Modal */}
            <StatusChangeModal
                isOpen={isStatusModalOpen}
                reservation={statusChangeTarget?.res ?? null}
                targetStatus={statusChangeTarget?.status ?? null}
                loading={statusChangeLoading}
                onConfirm={handleConfirmStatusChange}
                onClose={() => setIsStatusModalOpen(false)}
            />
        </>
    );
}
