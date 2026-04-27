import { apiClient } from "./apiClient";

export interface PackBenefitDto {
    id?: number;
    benefitType: string;
    rateRule: string;
    discountType?: string;
    discountValue?: number;
    itemName?: string;
    itemQuantity?: number;
}

export interface PackGamefyDto {
    id: number;
    name: string;
    price: number;
    description: string;
    durationMonths: number;
    benefits: PackBenefitDto[];
}

export interface ItemBenefitStatus {
    benefitId: number;
    itemName: string;
    itemQuantity: number;
    consumedQuantity: number;
}

export interface UserPackResponseDto {
    firstName: string;
    lastName: string;
    email: string;
    status: "ACTIVE" | "CONSUMED" | "EXPIRED";
    userId: number;
    userPackId: number;
    itemBenefits: ItemBenefitStatus[];
}

export interface CreatePackGamefyDto {
    name: string;
    price: number;
    description: string;
    durationMonths?: number;
    benefits: {
        benefitType?: string;
        rateRule: string;
        discountType?: string;
        discountValue?: number;
        itemName?: string;
        itemQuantity?: number;
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
    },

    getPackPlayers: async (id: number): Promise<UserPackResponseDto[]> => {
        return apiClient.get(`/gamefy/pack-gamefies/${id}/players`);
    },

    consumeItemBenefit: async (userPackId: number, benefitId: number): Promise<string> => {
        return apiClient.put(`/gamefy/pack-gamefies/user-packs/${userPackId}/consume-item/${benefitId}`);
    },

    unconsumeItemBenefit: async (userPackId: number, benefitId: number): Promise<string> => {
        return apiClient.put(`/gamefy/pack-gamefies/user-packs/${userPackId}/unconsume-item/${benefitId}`);
    },
};
