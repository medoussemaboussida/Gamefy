import { apiClient } from "./apiClient";

export enum PC_Type {
    GAMING = "GAMING",
    VIP = "VIP"
}

export interface FixedPriceDto {
    id?: number;
    oneHourPrice: number;
    twoHoursPrice: number;
    threeHoursPrice: number;
    pcType: PC_Type;
}

export const pricingApi = {
    /**
     * Get all fixed prices
     */
    getAllFixedPrices: async (): Promise<FixedPriceDto[]> => {
        return apiClient.get("/gamefy/fixed-prices");
    },

    /**
     * Get fixed price by PC type
     */
    getFixedPriceByPcType: async (pcType: PC_Type): Promise<FixedPriceDto> => {
        return apiClient.get(`/gamefy/fixed-prices/${pcType}`);
    },

    /**
     * Create or update fixed price (upsert)
     */
    createOrUpdateFixedPrice: async (dto: FixedPriceDto): Promise<FixedPriceDto> => {
        return apiClient.post("/gamefy/fixed-prices", dto);
    },
};
