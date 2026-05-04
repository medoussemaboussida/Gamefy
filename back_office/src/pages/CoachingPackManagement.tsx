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
import { packCoachingApi, PackCoachingDto } from "../api/packCoaching";
import { userApi, UserResponseDto } from "../api/user";
import { getUserRole } from "../utils/jwt";
import toast from "react-hot-toast";
import Pagination from "../components/ui/pagination/Pagination";
import Button from "../components/ui/button/Button";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { ChevronDownIcon, TrashBinIcon, InfoIcon, GroupIcon } from "../icons";
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";
import PackDescriptionModal from "../components/modals/PackDescriptionModal";
import CoachingPackPlayersModal from "../components/modals/CoachingPackPlayersModal";

export default function CoachingPackManagement() {
    const [packs, setPacks] = useState<PackCoachingDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCoachId, setSelectedCoachId] = useState<string>("ALL");
    const [coaches, setCoaches] = useState<UserResponseDto[]>([]);
    const [isCoachOpen, setIsCoachOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState("");

    const currentUserRole = getUserRole();
    const isAdmin = currentUserRole === "ADMIN";

    // Modals
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [packToDelete, setPackToDelete] = useState<PackCoachingDto | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [isDescModalOpen, setIsDescModalOpen] = useState(false);
    const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
    const [viewingPack, setViewingPack] = useState<PackCoachingDto | null>(null);

    const itemsPerPage = 8;

    const fetchPacks = async () => {
        try {
            const data = await packCoachingApi.getAllPacks();
            setPacks(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch coaching packs");
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
        fetchPacks();
        fetchCoaches();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCoachId, searchKeyword]);

    const filteredPacks = (packs || [])
        .filter((p) => {
            const nameMatch = p.name.toLowerCase().includes(searchKeyword.toLowerCase());
            const coachMatch = selectedCoachId === "ALL" || p.coachId === Number(selectedCoachId);
            return nameMatch && coachMatch;
        });

    const totalItems = filteredPacks.length;
    const currentPacks = filteredPacks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const handleDeleteClick = (pack: PackCoachingDto) => {
        setPackToDelete(pack);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!packToDelete) return;
        setDeleteLoading(true);
        try {
            await packCoachingApi.deletePack(packToDelete.id);
            toast.success("Coaching pack deleted successfully");
            fetchPacks();
            setIsDeleteModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete pack");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleShowDesc = (pack: PackCoachingDto) => {
        setViewingPack(pack);
        setIsDescModalOpen(true);
    };

    return (
        <>
            <PageMeta
                title="Coaching Pack Management | Gamefy Admin"
                description="Monitor all coaching offers across the platform"
            />
            <PageBreadcrumb pageTitle="Coaching Pack Management" />

            <div className="space-y-6">
                <ComponentCard title="Platform Offers">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="h-[38px] w-64 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-brand-500"
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
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Pack Name
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Coach
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Duration
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Price (DT)
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="px-5 py-10 text-center text-gray-500">
                                                Loading coaching packs...
                                            </TableCell>
                                        </TableRow>
                                    ) : currentPacks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="px-5 py-10 text-center text-gray-500">
                                                No coaching packs found
              </TableCell>
            </TableRow>
          ) : (
                                        currentPacks.map((pack) => (
                                            <TableRow key={pack.id}>
                                                <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                    {pack.name}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                                    {pack.coachName || "Unknown"}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400">
                                                    {pack.hours.split(':')[0].replace(/^0+/, '') || '0'}h {pack.hours.split(':')[1].replace(/^0+/, '') || '0'}m
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start font-semibold text-brand-500">
                                                    DT {pack.price.toFixed(3)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setViewingPack(pack);
                                                                setIsPlayersModalOpen(true);
                                                            }}
                                                            className="p-2 transition-colors duration-200 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                                                            title="View Players"
                                                        >
                                                            <GroupIcon className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleShowDesc(pack)}
                                                            className="p-2 transition-colors duration-200 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                                                            title="View Description"
                                                        >
                                                            <InfoIcon className="w-5 h-5" />
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleDeleteClick(pack)}
                                                                className="p-2 transition-colors duration-200 rounded-lg text-gray-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10"
                                                                title="Delete Pack"
                                                            >
                                                                <TrashBinIcon className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
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
                userName={packToDelete?.name || "this pack"}
                loading={deleteLoading}
            />

            {/* Description Modal */}
            <PackDescriptionModal 
                isOpen={isDescModalOpen}
                onClose={() => setIsDescModalOpen(false)}
                title={viewingPack?.name || ""}
                description={viewingPack?.description || ""}
            />

            <CoachingPackPlayersModal
                isOpen={isPlayersModalOpen}
                onClose={() => {
                    setIsPlayersModalOpen(false);
                    setViewingPack(null);
                }}
                packId={viewingPack?.id || null}
                packName={viewingPack?.name || ""}
            />
        </>
    );
}
