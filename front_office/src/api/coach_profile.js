import { apiClient } from "./apiClient";

export const coachProfileApi = {
    /**
     * Get the authenticated coach's profile
     * @returns {Promise<Object>}
     */
    getMyProfile: async () => {
        return apiClient.get("/gamefy/coaches/profile/me");
    },

    /**
     * Create the coach's profile for the first time
     * @param {Object} dto { game, hourlyPrice }
     * @returns {Promise<Object>}
     */
    saveProfile: async (dto) => {
        return apiClient.post("/gamefy/coaches/profile/me", dto);
    },

    /**
     * Update the coach's existing profile
     * @param {Object} dto { game, hourlyPrice }
     * @returns {Promise<Object>}
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
