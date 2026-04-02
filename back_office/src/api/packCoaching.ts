import { apiClient } from "./apiClient";

export interface PackCoachingDto {
    id: number;
    name: string;
    hours: string; // HH:mm
    description?: string;
    price: number;
    coachId: number;
    coachName: string;
}

export const packCoachingApi = {
    /**
     * Get all coaching packs (Admin)
     */
    getAllPacks: async (): Promise<PackCoachingDto[]> => {
        return await apiClient.get("/gamefy/pack-coachings/all");
    },

    /**
     * Delete a coaching pack (Admin)
     */
    deletePack: async (id: number): Promise<void> => {
        return await apiClient.delete(`/gamefy/pack-coachings/admin/${id}`);
    }
};
