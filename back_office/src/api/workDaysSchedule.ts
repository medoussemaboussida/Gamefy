import { apiClient } from "./apiClient";

export interface WorkDaysScheduleDto {
    id?: number;
    day: string;       // DayOfWeek enum as string: "MONDAY", "TUESDAY", etc.
    month: string;
    year: string;
    startTime: string; // "HH:mm:ss"
    endTime: string;   // "HH:mm:ss"
    status: "OPEN" | "CLOSED";
}

export const workDaysScheduleApi = {
    /**
     * Get all work day schedules
     */
    getAllSchedules: async (): Promise<WorkDaysScheduleDto[]> => {
        return apiClient.get("/gamefy/work-days-schedules");
    },

    /**
     * Get a schedule by ID
     */
    getScheduleById: async (id: number): Promise<WorkDaysScheduleDto> => {
        return apiClient.get(`/gamefy/work-days-schedules/${id}`);
    },

    /**
     * Create a new schedule
     */
    createSchedule: async (dto: WorkDaysScheduleDto): Promise<WorkDaysScheduleDto> => {
        return apiClient.post("/gamefy/work-days-schedules", dto);
    },

    /**
     * Update an existing schedule
     */
    updateSchedule: async (id: number, dto: WorkDaysScheduleDto): Promise<WorkDaysScheduleDto> => {
        return apiClient.put(`/gamefy/work-days-schedules/${id}`, dto);
    },

    /**
     * Delete a schedule
     */
    deleteSchedule: async (id: number): Promise<void> => {
        return apiClient.delete(`/gamefy/work-days-schedules/${id}`);
    },
};
