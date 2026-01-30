import { apiClient } from "./apiClient";

export interface LoginResponse {
    message: string;
    accessToken: string;
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        return apiClient.post("/gamefy/auth/login", { email, password });
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        return apiClient.post("/gamefy/auth/forgot-password", { email });
    },

    resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
        return apiClient.post("/gamefy/auth/reset-password", { token, newPassword });
    },

    googleLogin: async (idToken: string): Promise<LoginResponse> => {
        return apiClient.post("/gamefy/auth/google", { idToken });
    },

    refreshToken: async (): Promise<LoginResponse> => {
        return apiClient.post("/gamefy/auth/refresh");
    },

    logout: async (): Promise<{ message: string }> => {
        return apiClient.post("/gamefy/auth/logout");
    },
};
