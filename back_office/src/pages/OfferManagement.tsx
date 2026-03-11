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
import { offerApi } from "../api/offer";
import { getUserRole } from "../utils/jwt";
import toast from "react-hot-toast";
import Button from "../components/ui/button/Button";
import { ChevronDownIcon, TrashBinIcon, PencilIcon } from "../icons";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import OfferModal from "../components/modals/addOffer"; // adjust path if needed
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";
import Pagination from "../components/ui/pagination/Pagination";

interface Offer {
  id: number;
  offerName: string;
  reduction: number;
  status: string;
}

export default function OfferManagement() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);

  const currentUserRole = getUserRole();
  const isAdmin = currentUserRole === "ADMIN";
  const canManage = currentUserRole === "ADMIN" || currentUserRole === "WEB_MASTER";

  const statusOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  const fetchOffers = async () => {
    try {
      const data = await offerApi.getAllOffers();
      setOffers(data as Offer[]);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const filteredOffers = offers.filter((offer) => {
    return selectedStatus === "ALL" || offer.status === selectedStatus;
  });

  const totalItems = filteredOffers.length;
  const currentOffers = filteredOffers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusLabel = (value: string) =>
    statusOptions.find((opt) => opt.value === value)?.label || value;

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return;
    setDeleteLoading(true);
    try {
      await offerApi.deleteOffer(offerToDelete.id);
      toast.success("Offer deleted successfully!");
      fetchOffers();
      setIsDeleteModalOpen(false);
      setOfferToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete offer");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (offerId: number, newStatus: string) => {
    const previousOffers = [...offers];
    setOffers(offers.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o)));
    setStatusDropdownOpen(null);

    const promise = (async () => {
      const offer = offers.find((o) => o.id === offerId);
      if (!offer) throw new Error("Offer not found");
      await offerApi.updateOffer(offerId, { ...offer, status: newStatus });
    })();

    toast.promise(promise, {
      loading: "Updating status...",
      success: "Status updated successfully!",
      error: (err) => {
        setOffers(previousOffers);
        return err.message || "Failed to update offer status";
      },
    });
  };

  const getStatusBadgeColor = (status: string): any => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "error";
      default:
        return "light";
    }
  };

  const openAddModal = () => {
    setSelectedOffer(null);
    setIsOfferModalOpen(true);
  };

  const openEditModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsOfferModalOpen(true);
  };

  return (
    <>
      <PageMeta
        title="Offer Management | Gamefy Admin"
        description="Manage promotional offers"
      />
      <PageBreadcrumb pageTitle="Offer Management" />

      <div className="space-y-6">
        <ComponentCard title="Platform Offers">
          <div className="flex flex-wrap items-center justify-start gap-3 mb-4">
            {/* Status Filter */}
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

            {/* Add Button */}
            {canManage && (
              <Button variant="primary" size="sm" onClick={openAddModal}>
                Add Offer
              </Button>
            )}
          </div>

          <div className="overflow-auto rounded-lg border border-gray-200 dark:border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-white/5">
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Offer Name
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Reduction (%)
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Status
                  </TableCell>
                  {canManage && (
                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 4 : 3} className="px-5 py-10 text-center text-gray-500">
                      Loading offers...
                    </TableCell>
                  </TableRow>
                ) : currentOffers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 5 : 4}
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No offers match the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  currentOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="px-5 py-4 sm:px-6 text-start">
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {offer.offerName}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {offer.reduction}%
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-900 text-start text-theme-sm dark:text-gray-400">
                        {canManage ? (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setStatusDropdownOpen(statusDropdownOpen === offer.id ? null : offer.id)
                              }
                              className="dropdown-toggle flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                              <Badge size="sm" color={getStatusBadgeColor(offer.status)}>
                                {offer.status}
                              </Badge>
                              <ChevronDownIcon
                                className={`w-3 h-3 text-gray-400 transition-transform duration-200 ease-in-out ${statusDropdownOpen === offer.id ? "rotate-180" : ""}`}
                              />
                            </button>

                            <Dropdown
                              isOpen={statusDropdownOpen === offer.id}
                              onClose={() => setStatusDropdownOpen(null)}
                            >
                              {statusOptions
                                .filter((opt) => opt.value !== "ALL")
                                .map((opt) => (
                                  <DropdownItem
                                    key={opt.value}
                                    className="text-white"
                                    onClick={() => handleStatusChange(offer.id, opt.value)}
                                  >
                                    {opt.label}
                                  </DropdownItem>
                                ))}
                            </Dropdown>
                          </div>
                        ) : (
                          <Badge size="sm" color={getStatusBadgeColor(offer.status)}>
                            {offer.status}
                          </Badge>
                        )}
                      </TableCell>

                      {canManage && (
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(offer)}
                            className="text-gray-500 hover:text-brand-500 transition-colors"
                            title="Edit Offer"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setOfferToDelete(offer);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-gray-500 hover:text-error-500 transition-colors"
                              title="Delete Offer"
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

      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false);
          setSelectedOffer(null);
        }}
        onSuccess={fetchOffers}
        offerData={selectedOffer}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setOfferToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        userName={offerToDelete ? offerToDelete.offerName : ""}
        loading={deleteLoading}
      />
    </>
  );
}