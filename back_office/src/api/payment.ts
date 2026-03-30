import { apiClient } from "./apiClient";

export interface AllPaymentResponseDto {
    id: number;
    userName: string;
    paidFor: string;
    totalPrice: number;
}

export const paymentApi = {
    /**
     * Get all payments for back-office overview
     */
    getAllPayments: async (): Promise<AllPaymentResponseDto[]> => {
        return apiClient.get("/gamefy/payments");
    },
    searchPayments: async (keyword: string): Promise<AllPaymentResponseDto[]> => {
        return apiClient.get("/gamefy/payments/search", { params: { keyword } });
    },
};
