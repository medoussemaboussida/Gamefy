import { apiClient } from "./apiClient";

/**
 * @typedef {Object} PackCoachingDto
 * @property {number} [id]
 * @property {string} name
 * @property {string} hours - LocalTime formatted as HH:mm
 * @property {number} price
 * @property {number} [coachId]
 */

export const packCoachingApi = {
    /**
     * Fetch all coaching packs (Admin / WebMaster / Player)
     * @returns {Promise<PackCoachingDto[]>} List of all packs
     */
    getAllPacks: async () => {
        try {
            const response = await apiClient.get("/gamefy/pack-coachings/all");
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Fetch all coaching packs belonging to the current coach
     * @returns {Promise<PackCoachingDto[]>} List of packs
     */
    getMyPacks: async () => {
        try {
            const response = await apiClient.get("/gamefy/pack-coachings/my-packs");
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get a single coaching pack by ID
     * @param {number} id 
     * @returns {Promise<PackCoachingDto>} Pack details
     */
    getPackById: async (id) => {
        try {
            const response = await apiClient.get(`/gamefy/pack-coachings/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a new coaching pack
     * @param {PackCoachingDto} data 
     * @returns {Promise<PackCoachingDto>} 
     */
    createPack: async (data) => {
        try {
            const response = await apiClient.post("/gamefy/pack-coachings", data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update an existing coaching pack
     * @param {number} id 
     * @param {PackCoachingDto} data 
     * @returns {Promise<PackCoachingDto>} 
     */
    updatePack: async (id, data) => {
        try {
            const response = await apiClient.put(`/gamefy/pack-coachings/${id}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a coaching pack
     * @param {number} id 
     * @returns {Promise<void>} 
     */
    deletePack: async (id) => {
        try {
            await apiClient.delete(`/gamefy/pack-coachings/${id}`);
        } catch (error) {
            throw error;
        }
    }
};
