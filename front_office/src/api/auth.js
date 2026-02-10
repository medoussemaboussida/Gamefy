import { apiClient } from "./apiClient";

export const authApi = {
    signUp: async (dto) => {
        return apiClient.post("/gamefy/auth/signup", dto);
    },
    login: async (dto) => {
        return apiClient.post("/gamefy/auth/login", dto);
    },
    logout: async () => {
        return apiClient.post("/gamefy/auth/logout");
    },
    forgotPassword: async (dto) => {
        return apiClient.post("/gamefy/auth/forgot-password", dto);
    },
    resetPassword: async (dto) => {
        return apiClient.post("/gamefy/auth/reset-password", dto);
    },
    googleLogin: async (dto) => {
        return apiClient.post("/gamefy/auth/google", dto);
    },
};
