import { apiClient } from "./apiClient";

export const userApi = {
    getAllUsers: async () => {
        return apiClient.get("/gamefy/users");
    },
    createUser: async (userData: any) => {
        return apiClient.post("/gamefy/users", userData);
    },
    deleteUser: async (id: number) => {
        return apiClient.delete(`/gamefy/users/${id}`);
    },
};
