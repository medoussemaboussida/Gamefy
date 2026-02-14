import { apiClient } from "./apiClient";

/**
 * @typedef {Object} SignUpRequestDto
 * @property {string} username
 * @property {string} email
 * @property {string} role
 * @property {string} password
 */

/**
 * @typedef {Object} LoginRequestDto
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} ForgotPasswordRequestDto
 * @property {string} email
 * @property {string} clientUrl
 */

/**
 * @typedef {Object} ResetPasswordRequestDto
 * @property {string} token
 * @property {string} newPassword
 */

/**
 * @typedef {Object} GoogleLoginRequestDto
 * @property {string} idToken
 */

/**
 * @typedef {Object} AuthResponseDto
 * @property {string} message
 * @property {string} accessToken
 * @property {string} role
 * @property {number} userId
 */

/**
 * @typedef {Object} MessageResponseDto
 * @property {string} message
 */

export const authApi = {
    /**
     * @param {SignUpRequestDto} dto
     * @returns {Promise<AuthResponseDto>}
     */
    signUp: async (dto) => {
        return apiClient.post("/gamefy/auth/signup", dto);
    },
    /**
     * @param {LoginRequestDto} dto
     * @returns {Promise<AuthResponseDto>}
     */
    login: async (dto) => {
        return apiClient.post("/gamefy/auth/login", dto);
    },
    /**
     * @returns {Promise<MessageResponseDto>}
     */
    logout: async () => {
        return apiClient.post("/gamefy/auth/logout");
    },
    /**
     * @param {ForgotPasswordRequestDto} dto
     * @returns {Promise<MessageResponseDto>}
     */
    forgotPassword: async (dto) => {
        return apiClient.post("/gamefy/auth/forgot-password", dto);
    },
    /**
     * @param {ResetPasswordRequestDto} dto
     * @returns {Promise<MessageResponseDto>}
     */
    resetPassword: async (dto) => {
        return apiClient.post("/gamefy/auth/reset-password", dto);
    },
    /**
     * @param {GoogleLoginRequestDto} dto
     * @returns {Promise<AuthResponseDto>}
     */
    googleLogin: async (dto) => {
        return apiClient.post("/gamefy/auth/google", dto);
    },
    
        /**
     * @param {SignUpRequestDto} dto
     * @returns {Promise<AuthResponseDto>}
     */
    signUpCoach: async (dto) => {
        return apiClient.post("/gamefy/auth/signup/coach", dto);
    },
};
