import { apiClient } from "./apiClient";

export interface CreateUserRequestDto {
    username: string;
    email: string;
    role: string;
    password?: string;
}

export interface UserResponseDto {
    id: number;
    username: string;
    email: string;
    role: string;
    active: boolean;
}

export const userApi = {
    getAllUsers: async (): Promise<UserResponseDto[]> => {
        return apiClient.get("/gamefy/users");
    },
    createUser: async (dto: CreateUserRequestDto): Promise<UserResponseDto> => {
        return apiClient.post("/gamefy/users", dto);
    },
    deleteUser: async (id: number): Promise<void> => {
        return apiClient.delete(`/gamefy/users/${id}`);
    },
    updateUserStatus: async (id: number, enabled: boolean): Promise<UserResponseDto> => {
        return apiClient.put(`/gamefy/users/${id}/status`, null, {
            params: { enabled }
        });
    },
};
