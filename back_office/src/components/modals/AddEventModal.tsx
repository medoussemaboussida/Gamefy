import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { eventApi, EventDto, EventStatus } from "../../api/event";
import toast from "react-hot-toast";

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventToEdit?: EventDto | null;
    onSuccess: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, eventToEdit, onSuccess }) => {
    const [formData, setFormData] = useState<EventDto>({
        title: "",
        description: "",
        place: "",
        startTime: "",
        endTime: "",
        eventStatus: EventStatus.SCHEDULED,
        registerLink: ""
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    // Helper to format ISO string to datetime-local format
    const formatToLocalDatetime = (isoString: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        if (eventToEdit) {
            setFormData({
                ...eventToEdit,
                startTime: formatToLocalDatetime(eventToEdit.startTime),
                endTime: formatToLocalDatetime(eventToEdit.endTime)
            });
        } else {
            setFormData({
                title: "",
                description: "",
                place: "",
                startTime: "",
                endTime: "",
                eventStatus: EventStatus.SCHEDULED,
                registerLink: ""
            });
        }
        setSelectedFile(null);
        setFieldErrors({});
    }, [eventToEdit, isOpen]);

    const validateField = (name: string, value: any) => {
        let errorMsg = "";
        const now = new Date();

        if (name === "title" || name === "description") {
            if (!value || !value.trim()) {
                errorMsg = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
            } else if (value.trim().length < 5) {
                errorMsg = "Minimum 5 characters required";
            }
        } else if (name === "place") {
            if (!value || !value.trim()) {
                errorMsg = "Place is required";
            }
        } else if (name === "startTime") {
            if (!value || !value.trim()) {
                errorMsg = "Start time is required";
            } else {
                const startDate = new Date(value);
                const originalStart = eventToEdit ? formatToLocalDatetime(eventToEdit.startTime) : null;
                const isNewOrChanged = !eventToEdit || value !== originalStart;

                if (isNewOrChanged && startDate < new Date(now.getTime() - 60000)) {
                    errorMsg = "Start time cannot be in the past";
                }
            }
        } else if (name === "endTime") {
            if (!value || !value.trim()) {
                errorMsg = "End time is required";
            } else if (formData.startTime) {
                const startDate = new Date(formData.startTime);
                const endDate = new Date(value);
                if (endDate <= startDate) {
                    errorMsg = "End time must be after start time";
                }
            }
        }

        setFieldErrors((prev) => {
            const newErrors = { ...prev, [name]: errorMsg };
            // If we are validating startTime and it's valid, re-validate endTime to clear cross-field error
            if (name === "startTime" && !errorMsg && formData.endTime) {
                const startDate = new Date(value);
                const endDate = new Date(formData.endTime);
                if (endDate > startDate) {
                    delete newErrors.endTime;
                }
            }
            return newErrors;
        });
        return errorMsg;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const titleErr = validateField("title", formData.title);
        const descErr = validateField("description", formData.description);
        const placeErr = validateField("place", formData.place);
        const startErr = validateField("startTime", formData.startTime);
        const endErr = validateField("endTime", formData.endTime);

        if (titleErr || descErr || placeErr || startErr || endErr) {
            toast.error("Please fix the form");
            return;
        }

        setLoading(true);
        setFieldErrors({});

        try {
            // Convert local datetime to UTC ISO string
            const payload = {
                ...formData,
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString()
            };

            let savedEvent: EventDto;
            if (eventToEdit?.id) {
                savedEvent = await eventApi.updateEvent(eventToEdit.id, payload);
                toast.success("Event updated successfully!");
            } else {
                savedEvent = await eventApi.createEvent(payload);
                toast.success("Event created successfully!");
            }

            // Handle photo upload if a file is selected
            if (selectedFile && savedEvent.id) {
                await eventApi.uploadPhoto(savedEvent.id, selectedFile);
                toast.success("Photo uploaded successfully!");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to save event:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to save event";

            // Map common server errors to fields
            if (errorMessage.toLowerCase().includes("title")) {
                setFieldErrors(prev => ({ ...prev, title: errorMessage }));
            } else if (errorMessage.toLowerCase().includes("description")) {
                setFieldErrors(prev => ({ ...prev, description: errorMessage }));
            } else if (errorMessage.toLowerCase().includes("place")) {
                setFieldErrors(prev => ({ ...prev, place: errorMessage }));
            } else if (errorMessage.toLowerCase().includes("start time")) {
                setFieldErrors(prev => ({ ...prev, startTime: errorMessage }));
            } else if (errorMessage.toLowerCase().includes("end time")) {
                setFieldErrors(prev => ({ ...prev, endTime: errorMessage }));
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-0 overflow-hidden bg-white dark:bg-[#0B0E14] border-none">
            <div className="p-6 sm:p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                        {eventToEdit ? "Edit Event" : "Add New Event"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Fill in the details below to {eventToEdit ? "update" : "create"} an event.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Event Title</Label>
                            <Input
                                placeholder="e.g. Valorant Tournament"
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({ ...formData, title: e.target.value });
                                    validateField("title", e.target.value);
                                }}
                                error={!!fieldErrors.title}
                                hint={fieldErrors.title}
                            />
                        </div>
                        <div>
                            <Label>Place</Label>
                            <Input
                                placeholder="e.g. Gaming Room A"
                                value={formData.place}
                                onChange={(e) => {
                                    setFormData({ ...formData, place: e.target.value });
                                    validateField("place", e.target.value);
                                }}
                                error={!!fieldErrors.place}
                                hint={fieldErrors.place}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Description</Label>
                        <textarea
                            className={`w-full px-4 py-3 rounded-xl border ${fieldErrors.description ? "border-error-500" : "border-gray-200 dark:border-white/10"} bg-transparent dark:text-white focus:border-brand-500 outline-none transition-all min-h-[100px]`}
                            placeholder="Describe the event..."
                            value={formData.description}
                            onChange={(e) => {
                                setFormData({ ...formData, description: e.target.value });
                                validateField("description", e.target.value);
                            }}
                        />
                        {fieldErrors.description && (
                            <p className="mt-1 text-xs text-error-500">{fieldErrors.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Start Time</Label>
                            <Input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => {
                                    setFormData({ ...formData, startTime: e.target.value });
                                    validateField("startTime", e.target.value);
                                }}
                                error={!!fieldErrors.startTime}
                                hint={fieldErrors.startTime}
                            />
                        </div>
                        <div>
                            <Label>End Time</Label>
                            <Input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => {
                                    setFormData({ ...formData, endTime: e.target.value });
                                    validateField("endTime", e.target.value);
                                }}
                                error={!!fieldErrors.endTime}
                                hint={fieldErrors.endTime}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Status</Label>
                            <select
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent dark:text-white focus:border-brand-500 outline-none transition-all "
                                value={formData.eventStatus}
                                onChange={(e) => setFormData({ ...formData, eventStatus: e.target.value as EventStatus })}
                            >
                                {Object.values(EventStatus).map((status) => (
                                    <option key={status} value={status} className="dark:bg-[#141820]">
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Photo (Optional)</Label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Registration Link (Optional)</Label>
                        <Input
                            placeholder="https://..."
                            value={formData.registerLink}
                            onChange={(e) => setFormData({ ...formData, registerLink: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <Button variant="outline" className="flex-1 h-12" onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" className="flex-1 h-12 bg-brand-500 hover:bg-brand-600 text-black font-bold shadow-lg shadow-brand-500/20" loading={loading} type="submit">
                            {eventToEdit ? "Update Event" : "Create Event"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddEventModal;
