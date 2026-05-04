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
import Badge from "../components/ui/badge/Badge";
import { Modal } from "../components/ui/modal";
import { packGamefyApi, PackGamefyDto } from "../api/packGamefy";
import { getUserRole } from "../utils/jwt";
import toast from "react-hot-toast";
import Button from "../components/ui/button/Button";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { TrashBinIcon, PencilIcon, ChevronDownIcon, EyeIcon, GroupIcon } from "../icons";
import PackModal from "../components/modals/PackModal";
import PackPlayersModal from "../components/modals/PackPlayersModal";
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";
import Pagination from "../components/ui/pagination/Pagination";

export default function PackManagement() {
    const [packs, setPacks] = useState<PackGamefyDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<"name" | "price">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isPackModalOpen, setIsPackModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
    const [selectedPack, setSelectedPack] = useState<PackGamefyDto | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const [isSortFieldOpen, setIsSortFieldOpen] = useState(false);
    const [isSortOrderOpen, setIsSortOrderOpen] = useState(false);

    const currentUserRole = getUserRole();
    const isAdmin = currentUserRole === "ADMIN";

    const fetchPacks = async () => {
        try {
            const data = await packGamefyApi.getAllPacks();
            setPacks(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch packs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPacks();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [sortField, sortOrder]);

    const sortedPacks = [...packs].sort((a, b) => {
        let comparison = 0;
        if (sortField === "name") {
            comparison = a.name.localeCompare(b.name);
        } else if (sortField === "price") {
            comparison = a.price - b.price;
        }
        return sortOrder === "asc" ? comparison : -comparison;
    });

    const totalItems = sortedPacks.length;
    const currentPacks = sortedPacks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    const handleConfirmDelete = async () => {
        if (!selectedPack) return;
        setDeleteLoading(true);
        try {
            await packGamefyApi.deletePack(selectedPack.id);
            toast.success("Pack deleted successfully!");
            fetchPacks();
            setIsDeleteModalOpen(false);
            setSelectedPack(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete pack");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEdit = (pack: PackGamefyDto) => {
        setSelectedPack(pack);
        setIsPackModalOpen(true);
    };

    const handleDelete = (pack: PackGamefyDto) => {
        setSelectedPack(pack);
        setIsDeleteModalOpen(true);
    };

    const getAggregatedBenefits = (benefits: any[]) => {
        const counts: { [key: string]: { count: number; label: string } } = {};
        benefits.forEach((b) => {
            if (b.rateRule === "HOURS") {
                const hrs = b.hours || 1;
                const key = `${b.benefitType}_HOURS`;
                if (!counts[key]) {
                    counts[key] = { count: 0, label: `${b.benefitType}_HOURS` };
                }
                counts[key].count += hrs;
                return;
            }
            if (b.rateRule === "DISCOUNT" && b.discountType && b.discountValue !== undefined) {
                const detail = b.discountType === "PERCENTAGE" ? ` (${b.discountValue}%)` : ` (${b.discountValue.toFixed(3)} TND)`;
                const key = `${b.benefitType}_DISCOUNT${detail}`;
                if (!counts[key]) {
                    counts[key] = { count: 0, label: `${b.benefitType}_DISCOUNT${detail}` };
                }
                counts[key].count++;
                return;
            }
            if (b.rateRule === "FREE_ITEM" && b.itemName) {
                const qty = b.itemQuantity || 1;
                const key = `FREE_ITEM_${b.itemName}_${qty}`;
                if (!counts[key]) {
                    counts[key] = { count: 0, label: `🎁 ${b.itemName} × ${qty}` };
                }
                counts[key].count++;
                return;
            }
            const key = `${b.benefitType}_${b.rateRule}`;
            if (!counts[key]) {
                counts[key] = { count: 0, label: `${b.benefitType}_${b.rateRule}` };
            }
            counts[key].count++;
        });
        return Object.values(counts);
    };

    return (
        <>
            <PageMeta
                title="Pack Management | Gamefy Admin"
                description="Manage gaming packs and benefits"
            />
            <PageBreadcrumb pageTitle="Pack Management" />
            <div className="space-y-6">
                <ComponentCard title="Gaming Packs">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Sort Field Dropdown */}
                            <div className="relative">
                                <Button
                                    onClick={() => setIsSortFieldOpen(!isSortFieldOpen)}
                                    variant="primary"
                                    size="sm"
                                    className="w-40 dropdown-toggle"
                                    endIcon={<ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isSortFieldOpen ? "rotate-180" : ""}`} />}
                                >
                                    Sort by: {sortField.charAt(0).toUpperCase() + sortField.slice(1)}
                                </Button>
                                <Dropdown isOpen={isSortFieldOpen} onClose={() => setIsSortFieldOpen(false)} className="w-40 mt-2">
                                    <DropdownItem
                                        onClick={() => { setSortField("name"); setIsSortFieldOpen(false); }}
                                        className={sortField === "name" ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10" : ""}
                                    >
                                        Pack Name
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={() => { setSortField("price"); setIsSortFieldOpen(false); }}
                                        className={sortField === "price" ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10" : ""}
                                    >
                                        Price
                                    </DropdownItem>
                                </Dropdown>
                            </div>

                            {/* Sort Order Dropdown */}
                            <div className="relative">
                                <Button
                                    onClick={() => setIsSortOrderOpen(!isSortOrderOpen)}
                                    variant="primary"
                                    size="sm"
                                    className="w-40 dropdown-toggle"
                                    endIcon={<ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isSortOrderOpen ? "rotate-180" : ""}`} />}
                                >
                                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                                </Button>
                                <Dropdown isOpen={isSortOrderOpen} onClose={() => setIsSortOrderOpen(false)} className="w-40 mt-2">
                                    <DropdownItem
                                        onClick={() => { setSortOrder("asc"); setIsSortOrderOpen(false); }}
                                        className={sortOrder === "asc" ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10" : ""}
                                    >
                                        Ascending
                                    </DropdownItem>
                                    <DropdownItem
                                        onClick={() => { setSortOrder("desc"); setIsSortOrderOpen(false); }}
                                        className={sortOrder === "desc" ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10" : ""}
                                    >
                                        Descending
                                    </DropdownItem>
                                </Dropdown>
                            </div>
                        </div>

                        <Button
                            onClick={() => {
                                setSelectedPack(null);
                                setIsPackModalOpen(true);
                            }}
                            variant="primary"
                            size="sm"
                        >
                            Add New Pack
                        </Button>
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
                                            Price (DT)
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Benefits
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Description
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="px-5 py-10 text-center text-gray-500">
                                                Loading packs...
                                            </TableCell>
                                        </TableRow>
                                    ) : currentPacks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="px-5 py-10 text-center text-gray-500">
                                                No packs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        currentPacks.map((pack) => (
                                            <TableRow key={pack.id}>
                                                <TableCell className="px-5 py-4 text-start font-medium text-gray-800 dark:text-white/90">
                                                    {pack.name}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start text-gray-500 dark:text-gray-400 font-bold">
                                                    {pack.price.toFixed(3)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <div className="flex flex-wrap gap-1">
                                                        {getAggregatedBenefits(pack.benefits).map((b, i) => (
                                                            <Badge key={i} size="sm" color="info">
                                                                {b.label.includes("_HOURS") ? `${b.label} ${b.count}h` : `${b.label}${b.count > 1 ? ` x ${b.count}` : ""}`}
                                                            </Badge>
                                                        ))}
                                                        {pack.benefits.length === 0 && (
                                                            <span className="text-xs text-gray-400 italic">No benefits</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPack(pack);
                                                            setIsDescriptionModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-1.5 text-brand-500 hover:text-brand-600 font-medium transition-colors"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                        <span>Check</span>
                                                    </button>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-start flex items-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPack(pack);
                                                            setIsPlayersModalOpen(true);
                                                        }}
                                                        className="text-gray-500 hover:text-brand-500 transition-colors"
                                                        title="View Players"
                                                    >
                                                        <GroupIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(pack)}
                                                        className="text-gray-500 hover:text-brand-500 transition-colors"
                                                        title="Edit Pack"
                                                    >
                                                        <PencilIcon className="w-5 h-5" />
                                                    </button>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(pack)}
                                                            className="text-gray-500 hover:text-error-500 transition-colors"
                                                            title="Delete Pack"
                                                        >
                                                            <TrashBinIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </ComponentCard>
            </div>

            <PackModal
                isOpen={isPackModalOpen}
                onClose={() => {
                    setIsPackModalOpen(false);
                    setSelectedPack(null);
                }}
                onSuccess={fetchPacks}
                pack={selectedPack}
            />

            <Modal
                isOpen={isDescriptionModalOpen}
                onClose={() => {
                    setIsDescriptionModalOpen(false);
                    setSelectedPack(null);
                }}
                className="max-w-[500px] p-6 sm:p-8"
            >
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {selectedPack?.name} - Description
                    </h3>
                    <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar">
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed px-1">
                            {selectedPack?.description || "No description provided for this pack."}
                        </p>
                    </div>
                    <div className="flex justify-end mt-2">
                        <Button variant="outline" onClick={() => setIsDescriptionModalOpen(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedPack(null);
                }}
                onConfirm={handleConfirmDelete}
                userName={selectedPack?.name || "this pack"}
                loading={deleteLoading}
            />

            <PackPlayersModal
                isOpen={isPlayersModalOpen}
                onClose={() => {
                    setIsPlayersModalOpen(false);
                    setSelectedPack(null);
                }}
                packId={selectedPack?.id || null}
                packName={selectedPack?.name || ""}
            />
        </>
    );
}
