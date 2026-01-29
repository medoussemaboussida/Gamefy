import { apiClient } from "./apiClient";

export interface LoginResponse {
    message: string;
    accessToken: string;
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        return apiClient("/gamefy/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        return apiClient("/gamefy/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
    },

    resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
        return apiClient("/gamefy/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ token, newPassword }),
        });
    },
};
