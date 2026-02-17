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
import { eventApi, EventDto, EventStatus } from "../api/event";
import { getUserRole } from "../utils/jwt";
import toast from "react-hot-toast";
import Button from "../components/ui/button/Button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import AddEventModal from "../components/modals/AddEventModal";
import DeleteConfirmationModal from "../components/modals/deleteConfirmation";
import { Modal } from "../components/ui/modal";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "../icons";

export default function EventManagement() {
    const [events, setEvents] = useState<EventDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    const currentUserRole = getUserRole();
    const isAdmin = currentUserRole === "ADMIN";

    const statusOptions = [
        { value: "ALL", label: "All Statuses" },
        { value: EventStatus.SCHEDULED, label: "Scheduled" },
        { value: EventStatus.ONGOING, label: "Ongoing" },
        { value: EventStatus.COMPLETED, label: "Completed" },
        { value: EventStatus.CANCELLED, label: "Cancelled" },
    ];

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const data = await eventApi.getAllEvents();
            setEvents(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const filteredEvents = events.filter((event) => {
        return selectedStatus === "ALL" || event.eventStatus === selectedStatus;
    });

    const getStatusLabel = (value: string) =>
        statusOptions.find((opt) => opt.value === value)?.label || value;

    const handleEdit = (event: EventDto) => {
        setSelectedEvent(event);
        setIsAddModalOpen(true);
    };

    const handleDeleteClick = (event: EventDto) => {
        setSelectedEvent(event);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedEvent?.id) return;
        setDeleteLoading(true);
        try {
            await eventApi.deleteEvent(selectedEvent.id);
            toast.success("Event deleted successfully!");
            fetchEvents();
            setIsDeleteModalOpen(false);
            setSelectedEvent(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete event");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleViewPhoto = (event: EventDto) => {
        setSelectedEvent(event);
        setIsPhotoModalOpen(true);
    };

    const getStatusBadgeColor = (status: EventStatus): any => {
        switch (status) {
            case EventStatus.SCHEDULED: return "primary";
            case EventStatus.ONGOING: return "success";
            case EventStatus.COMPLETED: return "info";
            case EventStatus.CANCELLED: return "error";
            default: return "light";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <>
            <PageMeta
                title="Event Management | Gamefy Admin"
                description="Manage platform events"
            />
            <PageBreadcrumb pageTitle="Event Management" />
            <div className="space-y-6">
                <ComponentCard title="Events List">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Button
                            onClick={() => {
                                setSelectedEvent(null);
                                setIsAddModalOpen(true);
                            }}
                            variant="primary"
                            size="sm"
                            startIcon={<Plus />}
                        >
                            Add Event
                        </Button>

                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <Button
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                                variant="primary"
                                size="sm"
                                className="w-40 dropdown-toggle"
                                endIcon={
                                    <ChevronDownIcon
                                        className={`w-5 h-5 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                }
                            >
                                {getStatusLabel(selectedStatus)}
                            </Button>
                            <Dropdown
                                isOpen={isStatusOpen}
                                onClose={() => setIsStatusOpen(false)}
                                className="w-40 mt-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-900 dark:border-gray-800"
                            >
                                {statusOptions.map((option) => (
                                    <DropdownItem
                                        key={option.value}
                                        onClick={() => {
                                            setSelectedStatus(option.value);
                                            setIsStatusOpen(false);
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
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Photo
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Title
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Place
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Start Time
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            End Time
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
                                                Loading events...
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredEvents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="px-5 py-10 text-center text-gray-500">
                                                No events found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEvents.map((event) => (
                                            <TableRow key={event.id}>
                                                <TableCell className="px-5 py-4">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                        {event.photo ? (
                                                            <img
                                                                src={`http://localhost:8080/api/uploads/event_photos/${event.photo}`}
                                                                alt={event.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full h-full text-gray-400">
                                                                <Eye size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {event.title}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {event.place}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                                    {formatDate(event.startTime)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                                                    {formatDate(event.endTime)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge size="sm" color={getStatusBadgeColor(event.eventStatus)}>
                                                        {event.eventStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewPhoto(event)}
                                                            className="p-2 text-gray-500 hover:text-brand-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-lg"
                                                            title="View Event Photo"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(event)}
                                                            className="p-2 text-gray-500 hover:text-brand-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-lg"
                                                            title="Edit Event"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleDeleteClick(event)}
                                                                className="p-2 text-gray-500 hover:text-error-500 transition-colors bg-gray-50 dark:bg-white/5 rounded-lg"
                                                                title="Delete Event"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
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
                    </div>
                </ComponentCard>
            </div>

            <AddEventModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                eventToEdit={selectedEvent}
                onSuccess={fetchEvents}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedEvent(null);
                }}
                onConfirm={handleConfirmDelete}
                userName={selectedEvent?.title || "this event"}
                loading={deleteLoading}
            />

            <Modal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                className="max-w-[800px] p-0 overflow-hidden bg-black/90 border-none"
            >
                <div className="relative group">
                    <img
                        src={`http://localhost:8080/api/uploads/event_photos/${selectedEvent?.photo}`}
                        alt={selectedEvent?.title}
                        className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                    />
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={() => setIsPhotoModalOpen(false)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
                        >
                            <Plus className="w-6 h-6 rotate-45" />
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <h4 className="text-xl font-bold text-white">{selectedEvent?.title}</h4>
                        <p className="text-white/70 text-sm mt-1">{selectedEvent?.place}</p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
