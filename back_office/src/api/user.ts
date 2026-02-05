import { apiClient } from "./apiClient";

export const userApi = {
    getAllUsers: async () => {
        return apiClient.get("/gamefy/users");
    },
};
