import { apiClient } from "./apiClient";

export interface PackBenefitDto {
    id?: number;
    benefitType: string;
    rateRule: string;
}

export interface PackGamefyDto {
    id: number;
    name: string;
    price: number;
    description: string;
    benefits: PackBenefitDto[];
}

export interface CreatePackGamefyDto {
    name: string;
    price: number;
    description: string;
    benefits: {
        benefitType: string;
        rateRule: string;
    }[];
}

export interface AssignPackDto {
    userId: number;
    packId: number;
}

export const packGamefyApi = {
    getAllPacks: async (): Promise<PackGamefyDto[]> => {
        return apiClient.get("/api/pack-gamefies");
    },

    getPackById: async (id: number): Promise<PackGamefyDto> => {
        return apiClient.get(`/api/pack-gamefies/${id}`);
    },

    createPack: async (dto: CreatePackGamefyDto): Promise<PackGamefyDto> => {
        return apiClient.post("/api/pack-gamefies", dto);
    },

    updatePack: async (id: number, dto: CreatePackGamefyDto): Promise<PackGamefyDto> => {
        return apiClient.put(`/api/pack-gamefies/${id}`, dto);
    },

    deletePack: async (id: number): Promise<void> => {
        return apiClient.delete(`/api/pack-gamefies/${id}`);
    },

    assignPackToPlayer: async (dto: AssignPackDto): Promise<string> => {
        return apiClient.post("/api/pack-gamefies/assign-to-player", dto);
    },

    removePackFromPlayer: async (userId: number): Promise<string> => {
        return apiClient.post(`/api/pack-gamefies/remove-from-player/${userId}`);
    }
};
