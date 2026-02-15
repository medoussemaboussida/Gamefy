import { apiClient } from "./apiClient";

export const profileApi = {
    /**
     * Get user profile by ID
     * @param {number} userId 
     * @returns {Promise<Object>}
     */
    getProfile: async (userId) => {
        return apiClient.get(`/gamefy/users/${userId}`);
    },

    /**
     * Update user profile
     * @param {Object} dto 
     * @returns {Promise<Object>}
     */
    updateProfile: async (dto) => {
        return apiClient.put("/gamefy/users/profile", dto);
    },

    /**
     * Upload profile photo
     * @param {File} file 
     * @returns {Promise<Object>}
     */
    uploadPhoto: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post("/gamefy/users/profile/photo", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    }
};
