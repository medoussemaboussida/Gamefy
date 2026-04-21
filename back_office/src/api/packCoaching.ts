import { apiClient } from "./apiClient";
import { UserPackResponseDto } from "./packGamefy";

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
    },

    /**
     * Assign a coaching pack to a player (Admin / WebMaster)
     */
    assignPackToPlayer: async (dto: { userId: number; packId: number }): Promise<string> => {
        return await apiClient.post("/gamefy/pack-coachings/assign-to-player", dto);
    },

    /**
     * Remove a coaching pack from a player (Admin / WebMaster)
     */
    removePackFromPlayer: async (userId: number): Promise<string> => {
        return await apiClient.post(`/gamefy/pack-coachings/remove-from-player/${userId}`);
    },

    /**
     * Renew a coaching pack for a player (Admin / WebMaster)
     */
    renewPackForPlayer: async (dto: any): Promise<string> => {
        return apiClient.post("/gamefy/pack-coachings/renew-pack", dto);
    },

    getPackPlayers: async (id: number): Promise<UserPackResponseDto[]> => {
        return apiClient.get(`/gamefy/pack-coachings/${id}/players`);
    }
};
