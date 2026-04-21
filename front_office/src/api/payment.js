import { apiClient } from "./apiClient";

export const paymentApi = {
    /**
     * Fetch the connected user's payment history
     * @returns {Promise<Object[]>} List of payments
     */
    getMyPaymentHistory: async () => {
        try {
            const response = await apiClient.get("/gamefy/payments/my-history");
            return response;
        } catch (error) {
            throw error;
        }
    }
};
