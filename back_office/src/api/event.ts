import { apiClient } from "./apiClient";

export enum EventStatus {
    SCHEDULED = "SCHEDULED",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export interface EventDto {
    id?: number;
    title: string;
    description: string;
    place: string;
    startTime: string; // LocalDateTime from backend, will be handled as ISO strings
    endTime: string;   // LocalDateTime from backend, will be handled as ISO strings
    eventStatus: EventStatus;
    photo?: string;
    registerLink?: string;
}

export const eventApi = {
    /**
     * Get all events
     */
    getAllEvents: async (): Promise<EventDto[]> => {
        return apiClient.get("/gamefy/events");
    },

    /**
     * Get event by ID
     */
    getEventById: async (id: number): Promise<EventDto> => {
        return apiClient.get(`/gamefy/events/${id}`);
    },

    /**
     * Create a new event
     */
    createEvent: async (dto: EventDto): Promise<EventDto> => {
        return apiClient.post("/gamefy/events", dto);
    },

    /**
     * Update an existing event
     */
    updateEvent: async (id: number, dto: EventDto): Promise<EventDto> => {
        return apiClient.put(`/gamefy/events/${id}`, dto);
    },

    /**
     * Delete an event
     */
    deleteEvent: async (id: number): Promise<void> => {
        return apiClient.delete(`/gamefy/events/${id}`);
    },

    /**
     * Upload event photo
     */
    uploadPhoto: async (id: number, file: File): Promise<EventDto> => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post(`/gamefy/events/${id}/photo`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};
