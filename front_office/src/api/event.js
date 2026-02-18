import { apiClient } from "./apiClient";

export const eventApi = {
    /**
     * Get all events
     * @returns {Promise<Array>}
     */
    getAllEvents: async () => {
        return apiClient.get("/gamefy/events");
    },

    /**
     * Get event by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getEventById: async (id) => {
        return apiClient.get(`/gamefy/events/${id}`);
    }
};
