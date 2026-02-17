import { apiClient } from "./apiClient";

export interface PCDto {
    id?: number;
    pcNumber: number;
    status: string;       // PC_Status enum as string, e.g. "AVAILABLE", "IN_USE", "MAINTENANCE"
    games: string;        // PC_Games enum as string, e.g. "FORTNITE", "VALORANT", "ALL_GAMES"
    pcType: string;       // PC_Type enum as string, e.g. "HIGH_END", "MID_RANGE", "BASIC"
    pcLocation?: string;  // Location enum as string or null/undefined, e.g. "ZONE_A", "ZONE_B"
}

export const pcApi = {
    /**
     * Get all PCs
     */
    getAllPCs: async (): Promise<PCDto[]> => {
        return apiClient.get("/gamefy/pcs");
    },

    /**
     * Get a single PC by ID
     */
    getPCById: async (id: number): Promise<PCDto> => {
        return apiClient.get(`/gamefy/pcs/${id}`);
    },

    /**
     * Create a new PC
     */
    createPC: async (dto: PCDto): Promise<PCDto> => {
        return apiClient.post("/gamefy/pcs", dto);
    },

    /**
     * Update an existing PC
     */
    updatePC: async (id: number, dto: PCDto): Promise<PCDto> => {
        return apiClient.put(`/gamefy/pcs/${id}`, dto);
    },

    /**
     * Delete a PC (only ADMIN allowed)
     */
    deletePC: async (id: number): Promise<void> => {
        return apiClient.delete(`/gamefy/pcs/${id}`);
    },
};