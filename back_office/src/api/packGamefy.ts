import { apiClient } from "./apiClient";

export interface PackBenefitDto {
    id?: number;
    benefitType: string;
    rateRule: string;
    discountType?: string;
    discountValue?: number;
}

export interface PackGamefyDto {
    id: number;
    name: string;
    price: number;
    description: string;
    durationMonths: number;
    benefits: PackBenefitDto[];
}

export interface CreatePackGamefyDto {
    name: string;
    price: number;
    description: string;
    durationMonths?: number;
    benefits: {
        benefitType: string;
        rateRule: string;
        discountType?: string;
        discountValue?: number;
    }[];
}

export interface AssignPackDto {
    userId: number;
    packId: number;
}

export const packGamefyApi = {
    getAllPacks: async (): Promise<PackGamefyDto[]> => {
        return apiClient.get("/gamefy/pack-gamefies");
    },

    getPackById: async (id: number): Promise<PackGamefyDto> => {
        return apiClient.get(`/gamefy/pack-gamefies/${id}`);
    },

    createPack: async (dto: CreatePackGamefyDto): Promise<PackGamefyDto> => {
        return apiClient.post("/gamefy/pack-gamefies", dto);
    },

    updatePack: async (id: number, dto: CreatePackGamefyDto): Promise<PackGamefyDto> => {
        return apiClient.put(`/gamefy/pack-gamefies/${id}`, dto);
    },

    deletePack: async (id: number): Promise<void> => {
        return apiClient.delete(`/gamefy/pack-gamefies/${id}`);
    },

    assignPackToPlayer: async (dto: AssignPackDto): Promise<string> => {
        return apiClient.post("/gamefy/pack-gamefies/assign-to-player", dto);
    },

    removePackFromPlayer: async (userId: number): Promise<string> => {
        return apiClient.post(`/gamefy/pack-gamefies/remove-from-player/${userId}`);
    },

    renewPackForPlayer: async (dto: AssignPackDto): Promise<string> => {
        return apiClient.post("/gamefy/pack-gamefies/renew-pack", dto);
    }
};
