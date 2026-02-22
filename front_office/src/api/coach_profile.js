import { apiClient } from "./apiClient";

/**
 * @typedef {Object} CoachProfileDto
 * @property {number} id
 * @property {number} coachId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} game
 * @property {number} hourlyPrice
 * @property {string} bio
 */

/**
 * @typedef {Object} UpdateCoachProfileDto
 * @property {string} game
 * @property {number} hourlyPrice
 * @property {string} bio
 */

export const coachProfileApi = {
    /**
     * Get the authenticated coach's profile
     * @returns {Promise<CoachProfileDto>}
     */
    getMyProfile: async () => {
        return apiClient.get("/gamefy/coaches/profile/me");
    },

    /**
     * Create the coach's profile for the first time
     * @param {UpdateCoachProfileDto} dto
     * @returns {Promise<CoachProfileDto>}
     */
    saveProfile: async (dto) => {
        return apiClient.post("/gamefy/coaches/profile/me", dto);
    },

    /**
     * Update the coach's existing profile
     * @param {UpdateCoachProfileDto} dto
     * @returns {Promise<CoachProfileDto>}
     */
    updateProfile: async (dto) => {
        return apiClient.put("/gamefy/coaches/profile/me", dto);
    },

    /**
     * Delete the authenticated coach's profile
     * @returns {Promise<void>}
     */
    deleteProfile: async () => {
        return apiClient.delete("/gamefy/coaches/profile/me");
    }
};

