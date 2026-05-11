import { apiClient } from "./apiClient";
import { OfferDto } from "./offer";

export interface DashboardStatsDto {
    totalReservations: number;
    activePacksCount: number;
    pcCountByType: Record<string, number>;
    activeOffer: OfferDto | null;
}

export const dashboardApi = {
    /**
     * Get aggregated dashboard statistics
     */
    getStats: async (): Promise<DashboardStatsDto> => {
        return apiClient.get("/gamefy/dashboard/stats");
    },
};
