import { apiClient } from "./apiClient";

/**
 * @typedef {Object} PackBenefitDto
 * @property {number} [id]
 * @property {string} benefitType - PC | VIP | COACH
 * @property {string} rateRule - HOURS | DISCOUNT
 */

/**
 * @typedef {Object} PackGamefyDto
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {string} description
 * @property {PackBenefitDto[]} benefits
 */

export const packGamefyApi = {
    /**
     * Fetch all gaming packs
     * @returns {Promise<PackGamefyDto[]>} List of packs
     */
    getAllPacks: async () => {
        try {
            const response = await apiClient.get("/gamefy/pack-gamefies");
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get a single pack by ID
     * @param {number} id 
     * @returns {Promise<PackGamefyDto>} Pack details
     */
    getPackById: async (id) => {
        try {
            const response = await apiClient.get(`/gamefy/pack-gamefies/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a Stripe PaymentIntent for a pack
     * @param {number} packId 
     * @returns {Promise<{clientSecret: string, publishableKey: string}>}
     */
    createPackPaymentIntent: async (packId) => {
        try {
            const response = await apiClient.post("/gamefy/payments/create-pack-intent", { packId });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Confirm pack purchase with the backend after Stripe payment succeeds
     * @param {number} packId 
     * @returns {Promise<string>} Confirmation message
     */
    confirmPackPayment: async (packId) => {
        try {
            const response = await apiClient.post("/gamefy/payments/confirm-pack-payment", { packId, paymentIntentId: "" });
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get list of pack IDs the current user has already purchased
     * @returns {Promise<number[]>} Array of purchased pack IDs
     */
    getMyPurchasedPacks: async () => {
        try {
            const response = await apiClient.get("/gamefy/payments/my-purchased-packs");
            return response;
        } catch (error) {
            throw error;
        }
    }
};
