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
import { pcApi } from "../api/pc";
import { getUserRole } from "../utils/jwt";
import toast from "react-hot-toast";
import Button from "../components/ui/button/Button";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { ChevronDownIcon, TrashBinIcon, PencilIcon } from "../icons";
import PCModal from "../components/modals/addPc";
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";
import Pagination from "../components/ui/pagination/Pagination";

interface PC {
  id: number;
  pcNumber: number;
  status: string;
  games: string[];
  pcType: string;
  pcLocation: string;
}

export default function PCManagement() {
  const [pcs, setPcs] = useState<PC[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedGame, setSelectedGame] = useState<string>("ALL");
  const [availableGames, setAvailableGames] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [isGameFilterOpen, setIsGameFilterOpen] = useState(false);
  const [isPCModalOpen, setIsPCModalOpen] = useState(false);
  const [selectedPC, setSelectedPC] = useState<PC | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pcToDelete, setPcToDelete] = useState<PC | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);

  const currentUserRole = getUserRole();
  const isAdmin = currentUserRole === "ADMIN";
  const isWebMasterOrAdmin =
    currentUserRole === "ADMIN" || currentUserRole === "WEB_MASTER";

  // ──────────────────────────────────────────────
  // Corrected enums (as per your backend)
  // ──────────────────────────────────────────────
  const statusOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "AVAILABLE", label: "Available" },
    { value: "OUT_OF_SERVICE", label: "Out of Service" },
    { value: "MAINTENANCE", label: "Maintenance" },
  ];

  const typeOptions = [
    { value: "ALL", label: "All Types" },
    { value: "GAMING", label: "Gaming" },
    { value: "VIP", label: "VIP" },
  ];

  const gameOptions = [
    { value: "ALL", label: "All Games" },
    ...availableGames.map((game) => ({
      value: game,
      label: game.replace(/_/g, " "),
    })),
  ];


  const fetchPCs = async () => {
    try {
      const data = await pcApi.getAllPCs();
      setPcs(data as PC[]);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch PCs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPCs();
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const data = await pcApi.getAllPCGames();
      setAvailableGames(data);
    } catch (error: any) {
      console.error("Failed to fetch games:", error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedType, selectedGame]);


  const filteredPCs = pcs.filter((pc) => {
    const statusMatch = selectedStatus === "ALL" || pc.status === selectedStatus;
    const typeMatch = selectedType === "ALL" || pc.pcType === selectedType;
    const gameMatch = selectedGame === "ALL" || (Array.isArray(pc.games) && pc.games.includes(selectedGame));
    return statusMatch && typeMatch && gameMatch;
  });


  const totalItems = filteredPCs.length;
  const currentPCs = filteredPCs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusLabel = (value: string) =>
    statusOptions.find((opt) => opt.value === value)?.label || value;

  const getTypeLabel = (value: string) =>
    typeOptions.find((opt) => opt.value === value)?.label || value;

  const getGameLabel = (value: string) =>
    gameOptions.find((opt) => opt.value === value)?.label || value;


  const handleConfirmDelete = async () => {
    if (!pcToDelete) return;
    setDeleteLoading(true);
    try {
      await pcApi.deletePC(pcToDelete.id);
      toast.success("PC deleted successfully!");
      fetchPCs();
      setIsDeleteModalOpen(false);
      setPcToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete PC");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (pcId: number, newStatus: string) => {
    const previousPcs = [...pcs];
    setPcs(pcs.map((p) => (p.id === pcId ? { ...p, status: newStatus } : p)));
    setStatusDropdownOpen(null);

    const promise = (async () => {
      const pc = pcs.find((p) => p.id === pcId);
      if (!pc) throw new Error("PC not found");
      await pcApi.updatePC(pcId, { ...pc, status: newStatus });
    })();

    toast.promise(promise, {
      loading: "Updating status...",
      success: "Status updated successfully!",
      error: (err) => {
        setPcs(previousPcs);
        return err.message || "Failed to update PC status";
      },
    });
  };

  const getStatusBadgeColor = (status: string): any => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "OUT_OF_SERVICE":
        return "error";
      case "MAINTENANCE":
        return "warning";
      default:
        return "light";
    }
  };

  const getTypeBadgeColor = (type: string): any => {
    switch (type) {
      case "GAMING":
        return "primary";
      case "VIP":
        return "info";
      default:
        return "light";
    }
  };

  const openAddModal = () => {
    setSelectedPC(null);
    setIsPCModalOpen(true);
  };

  const openEditModal = (pc: PC) => {
    setSelectedPC(pc);
    setIsPCModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="PC Management | Gamefy Admin"
        description="Manage your platform PCs"
      />
      <PageBreadcrumb pageTitle="PC Management" />
      <div className="space-y-6">
        <ComponentCard title="Gamefy PCs">
          {/* ──────────────────────────────────────────────
              Filters + Add button grouped on the LEFT
          ────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-start gap-3 mb-4">
            {/* Status Filter Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                variant="primary"
                size="sm"
                className="w-40 dropdown-toggle"
                endIcon={
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${isStatusFilterOpen ? "rotate-180" : ""}`}
                  />
                }
              >
                {getStatusLabel(selectedStatus)}
              </Button>
              <Dropdown
                isOpen={isStatusFilterOpen}
                onClose={() => setIsStatusFilterOpen(false)}
                className="w-40 mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-800"
              >
                {statusOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    onClick={() => {
                      setSelectedStatus(option.value);
                      setIsStatusFilterOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${selectedStatus === option.value
                        ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      }`}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            {/* Type Filter Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
                variant="primary"
                size="sm"
                className="w-40 dropdown-toggle"
                endIcon={
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${isTypeFilterOpen ? "rotate-180" : ""}`}
                  />
                }
              >
                {getTypeLabel(selectedType)}
              </Button>
              <Dropdown
                isOpen={isTypeFilterOpen}
                onClose={() => setIsTypeFilterOpen(false)}
                className="w-40 mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-800"
              >
                {typeOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    onClick={() => {
                      setSelectedType(option.value);
                      setIsTypeFilterOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${selectedType === option.value
                        ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      }`}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            {/* Game Filter Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setIsGameFilterOpen(!isGameFilterOpen)}
                variant="primary"
                size="sm"
                className="w-40 dropdown-toggle"
                endIcon={
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${isGameFilterOpen ? "rotate-180" : ""}`}
                  />
                }
              >
                {getGameLabel(selectedGame)}
              </Button>
              <Dropdown
                isOpen={isGameFilterOpen}
                onClose={() => setIsGameFilterOpen(false)}
                className="w-40 mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-800"
              >
                {gameOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    onClick={() => {
                      setSelectedGame(option.value);
                      setIsGameFilterOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left ${selectedGame === option.value
                        ? "bg-brand-50 text-brand-500 dark:bg-brand-500/10"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      }`}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>


            {/* Add Button */}
            {isWebMasterOrAdmin && (
              <Button variant="primary" size="sm" onClick={openAddModal}>
                Add PC
              </Button>
            )}
          </div>

          <div className="overflow-auto rounded-lg border border-gray-200 dark:border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-white/5">
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    PC Number
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Games
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Location
                  </TableCell>
                  {isWebMasterOrAdmin && (
                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={isWebMasterOrAdmin ? 6 : 5}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      Loading PCs...
                    </TableCell>
                  </TableRow>
                ) : currentPCs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isWebMasterOrAdmin ? 6 : 5}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No PCs match the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPCs.map((pc) => (
                    <TableRow key={pc.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {pc.pcNumber}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-900 text-start text-theme-sm dark:text-gray-400">
                        {isWebMasterOrAdmin ? (
                          <div className="relative w-fit">
                            <button
                              onClick={() =>
                                setStatusDropdownOpen(
                                  statusDropdownOpen === pc.id ? null : pc.id,
                                )
                              }
                              className="dropdown-toggle flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <Badge
                                size="sm"
                                color={getStatusBadgeColor(pc.status)}
                              >
                                {pc.status}
                              </Badge>
                              <ChevronDownIcon
                                className={`w-3 h-3 text-gray-400 transition-transform duration-200 ease-in-out ${statusDropdownOpen === pc.id ? "rotate-180" : ""}`}
                              />
                            </button>

                            <Dropdown
                              isOpen={statusDropdownOpen === pc.id}
                              onClose={() => setStatusDropdownOpen(null)}
                              className="w-44 mt-2"
                            >
                              {statusOptions
                                .filter((opt) => opt.value !== "ALL")
                                .map((opt) => (
                                  <DropdownItem
                                    key={opt.value}
                                    className="text-white"
                                    onClick={() =>
                                      handleStatusChange(pc.id, opt.value)
                                    }
                                  >
                                    {opt.label}
                                  </DropdownItem>
                                ))}
                            </Dropdown>
                          </div>
                        ) : (
                          <Badge
                            size="sm"
                            color={getStatusBadgeColor(pc.status)}
                          >
                            {pc.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(pc.games) ? (
                            pc.games.map((game) => (
                              <Badge key={game} size="sm" color="light">
                                {getGameLabel(game)}
                              </Badge>
                            ))
                          ) : (
                            <Badge size="sm" color="light">
                              {getGameLabel(pc.games)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color={getTypeBadgeColor(pc.pcType)}>
                          {pc.pcType}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {pc.pcLocation || "N/A"}
                      </TableCell>
                      {isWebMasterOrAdmin && (
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(pc)}
                            className="text-gray-500 hover:text-brand-500 transition-colors"
                            title="Edit PC"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setPcToDelete(pc);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-gray-500 hover:text-error-500 transition-colors"
                              title="Delete PC"
                            >
                              <TrashBinIcon className="w-5 h-5" />
                            </button>
                          )}
                        </TableCell>
                      )}
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
        </ComponentCard>
      </div>

      <PCModal
        isOpen={isPCModalOpen}
        onClose={() => {
          setIsPCModalOpen(false);
          setSelectedPC(null);
        }}
        onSuccess={fetchPCs}
        pcData={selectedPC}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPcToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        userName={pcToDelete ? `PC #${pcToDelete.pcNumber}` : ""}
        loading={deleteLoading}
      />
    </>
  );
}