import { apiClient } from "./apiClient";

/**
 * @typedef {Object} UserProfileDto
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} role
 * @property {string} status
 * @property {string|null} profilePhoto
 */

/**
 * @typedef {Object} UpdateProfileDto
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [password]
 * @property {string} [profilePhoto]
 */

export const profileApi = {
    /**
     * Get user profile by ID
     * @param {number} userId 
     * @returns {Promise<UserProfileDto>}
     */
    getProfile: async (userId) => {
        return apiClient.get(`/gamefy/users/${userId}`);
    },

    /**
     * Update user profile
     * @param {UpdateProfileDto} dto 
     * @returns {Promise<UserProfileDto>}
     */
    updateProfile: async (dto) => {
        return apiClient.put("/gamefy/users/profile", dto);
    },

    /**
     * Upload profile photo
     * @param {File} file 
     * @returns {Promise<UserProfileDto>}
     */
    uploadPhoto: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post("/gamefy/users/profile/photo", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    /**
     * Get staff contacts (admin and webmaster)
     * @returns {Promise<Object>}
     */
    getStaffContacts: async () => {
        return apiClient.get("/gamefy/users/staff-contacts");
    }
};

