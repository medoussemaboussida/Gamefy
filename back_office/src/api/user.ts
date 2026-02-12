import { apiClient } from "./apiClient";

export interface CreateUserRequestDto {
    username: string;
    email: string;
    role: string;
    password?: string;
}

export interface UserResponseDto {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    profilePhoto: string | null;
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
    getUserById: async (id: number): Promise<UserResponseDto> => {
        return apiClient.get(`/gamefy/users/${id}`);
    },
    updateProfile: async (dto: any): Promise<UserResponseDto> => {
        return apiClient.put("/gamefy/users/profile", dto);
    },
    uploadProfilePhoto: async (file: File): Promise<UserResponseDto> => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post("/gamefy/users/profile/photo", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};
