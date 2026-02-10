import { apiClient } from "./apiClient";

export interface LoginRequestDto {
    email: string;
    password: string;
}

export interface ForgotPasswordRequestDto {
    email: string;
}

export interface ResetPasswordRequestDto {
    token: string;
    newPassword: string;
}

export interface GoogleLoginRequestDto {
    idToken: string;
}

export interface AuthResponseDto {
    message: string;
    accessToken: string;
    role: string;
    userId: number;
}

export interface MessageResponseDto {
    message: string;
}

export const authApi = {
    login: async (dto: LoginRequestDto): Promise<AuthResponseDto> => {
        return apiClient.post("/gamefy/auth/login", dto);
    },

    forgotPassword: async (dto: ForgotPasswordRequestDto): Promise<MessageResponseDto> => {
        return apiClient.post("/gamefy/auth/forgot-password", dto);
    },

    resetPassword: async (dto: ResetPasswordRequestDto): Promise<MessageResponseDto> => {
        return apiClient.post("/gamefy/auth/reset-password", dto);
    },

    googleLogin: async (dto: GoogleLoginRequestDto): Promise<AuthResponseDto> => {
        return apiClient.post("/gamefy/auth/google", dto);
    },

    refreshToken: async (): Promise<AuthResponseDto> => {
        return apiClient.post("/gamefy/auth/refresh");
    },

    logout: async (): Promise<MessageResponseDto> => {
        return apiClient.post("/gamefy/auth/logout");
    },
};
