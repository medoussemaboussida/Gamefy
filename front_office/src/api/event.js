import { apiClient } from "./apiClient";

/**
 * @typedef {Object} EventDto
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} place
 * @property {string} startTime
 * @property {string} endTime
 * @property {string} eventStatus - SCHEDULED | ONGOING | COMPLETED | CANCELLED
 * @property {string} photo
 * @property {string} registerLink
 */

/**
 * @typedef {Object} ParticipantDto
 * @property {number} id
 * @property {number} eventId
 * @property {number} userId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} participantStatus - PENDING | CONFIRMED | CANCELLED
 */

export const eventApi = {

    /**
     * Get active events (SCHEDULED, ONGOING, COMPLETED) - for Coach/WebMaster
     * @returns {Promise<EventDto[]>}
     */
    getActiveEvents: async () => {
        return apiClient.get("/gamefy/events/active");
    },

    /**
     * Get event by ID
     * @param {number} id 
     * @returns {Promise<EventDto>}
     */
    getEventById: async (id) => {
        return apiClient.get(`/gamefy/events/${id}`);
    },

    /**
     * Participate in an event
     * @param {number} eventId 
     * @returns {Promise<ParticipantDto>}
     */
    participateInEvent: async (eventId) => {
        return apiClient.post(`/gamefy/participants/participate/${eventId}`);
    },

    /**
     * Cancel participation in an event
     * @param {number} eventId 
     * @returns {Promise<ParticipantDto>}
     */
    cancelParticipation: async (eventId) => {
        return apiClient.delete(`/gamefy/participants/cancel/${eventId}`);
    },

    /**
     * Get current user's participations
     * @returns {Promise<ParticipantDto[]>}
     */
    getMyParticipations: async () => {
        return apiClient.get("/gamefy/participants/me");
    }
};
