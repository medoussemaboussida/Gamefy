import { apiClient } from "./apiClient";

export const authApi = {
    signUp: async (userData) => {
        return apiClient.post("/gamefy/auth/signup", userData);
    },
    login: async (email, password) => {
        return apiClient.post("/gamefy/auth/login", { email, password });
    },
    logout: async () => {
        return apiClient.post("/gamefy/auth/logout");
    },
    forgotPassword: async (email, clientUrl) => {
        return apiClient.post("/gamefy/auth/forgot-password", { email, clientUrl });
    },
    resetPassword: async (token, newPassword) => {
        return apiClient.post("/gamefy/auth/reset-password", { token, newPassword });
    },
};
