import { apiClient } from "./apiClient";

/**
 * @typedef {Object} CoachingSessionDto
 * @property {number} [id]
 * @property {string} day - DayOfWeek enum: "MONDAY", "TUESDAY", etc.
 * @property {string} month
 * @property {string} year
 * @property {string} startTime - "HH:mm:ss"
 * @property {string} endTime - "HH:mm:ss"
 * @property {string} status - "AVAILABLE" or "NOT_AVAILABLE"
 * @property {number} coachId
 */

export const coachingSessionApi = {
    /**
     * Get all coaching session schedules
     * @returns {Promise<CoachingSessionDto[]>}
     */
    getAllSchedules: async () => {
        return apiClient.get("/gamefy/coaching-sessions");
    },

    /**
     * Get schedules by coach ID
     * @param {number} coachId
     * @returns {Promise<CoachingSessionDto[]>}
     */
    getSchedulesByCoach: async (coachId) => {
        return apiClient.get(`/gamefy/coaching-sessions/coach/${coachId}`);
    },

    /**
     * Get a schedule by ID
     * @param {number} id
     * @returns {Promise<CoachingSessionDto>}
     */
    getScheduleById: async (id) => {
        return apiClient.get(`/gamefy/coaching-sessions/${id}`);
    },

    /**
     * Create or upsert a schedule
     * @param {CoachingSessionDto} dto
     * @returns {Promise<CoachingSessionDto>}
     */
    createSchedule: async (dto) => {
        return apiClient.post("/gamefy/coaching-sessions", dto);
    },

    /**
     * Update an existing schedule
     * @param {number} id
     * @param {CoachingSessionDto} dto
     * @returns {Promise<CoachingSessionDto>}
     */
    updateSchedule: async (id, dto) => {
        return apiClient.put(`/gamefy/coaching-sessions/${id}`, dto);
    },

    /**
     * Delete a schedule
     * @param {number} id
     * @returns {Promise<void>}
     */
    deleteSchedule: async (id) => {
        return apiClient.delete(`/gamefy/coaching-sessions/${id}`);
    },
};
