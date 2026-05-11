import { apiClient } from "./apiClient";
import { getUserId } from "../utils/jwt";

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
    requires2FA?: boolean;
    twoFaActivated?: boolean;
}

export namespace TwoFaDto {
    export interface VerifyTwoFaRequest {
        userId: number;
        code: string;
    }

    export interface ToggleTwoFaRequest {
        enabled: boolean;
    }
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

    verify2FA: async (dto: TwoFaDto.VerifyTwoFaRequest): Promise<AuthResponseDto> => {
        return apiClient.post("/gamefy/auth/verify-2fa", dto);
    },

    toggle2FA: async (dto: TwoFaDto.ToggleTwoFaRequest): Promise<MessageResponseDto> => {
        const userId = getUserId();
        return apiClient.post("/gamefy/auth/toggle-2fa", dto, {
            headers: { userId: userId?.toString() }
        });
    },
};
