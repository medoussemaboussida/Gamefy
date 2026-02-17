import { apiClient } from "./apiClient";

export interface OfferDto {
  id?: number;
  offerName: string;
  reduction: number;
  status: string;
}

export const offerApi = {
  /**
   * Get all offers
   */
  getAllOffers: async (): Promise<OfferDto[]> => {
    return apiClient.get("/gamefy/offers");
  },

  /**
   * Get a single offer by ID
   */
  getOfferById: async (id: number): Promise<OfferDto> => {
    return apiClient.get(`/gamefy/offers/${id}`);
  },

  /**
   * Create a new offer
   */
  createOffer: async (dto: OfferDto): Promise<OfferDto> => {
    return apiClient.post("/gamefy/offers", dto);
  },

  /**
   * Update an existing offer
   */
  updateOffer: async (id: number, dto: OfferDto): Promise<OfferDto> => {
    return apiClient.put(`/gamefy/offers/${id}`, dto);
  },

  /**
   * Delete an offer (only ADMIN allowed)
   */
  deleteOffer: async (id: number): Promise<void> => {
    return apiClient.delete(`/gamefy/offers/${id}`);
  },
};