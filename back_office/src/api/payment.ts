import { apiClient } from "./apiClient";

export interface AllPaymentResponseDto {
    id: number;
    userName: string;
    paidFor: string;
    totalPrice: number;
    createdAt: string;
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
    /**
     * Delete a payment (ADMIN only)
     */
    deletePayment: async (id: number): Promise<void> => {
        return apiClient.delete(`/gamefy/payments/${id}`);
    },

    /**
     * Export all payments to Excel
     */
    exportPaymentsToExcel: async (filename?: string): Promise<void> => {
        const response = await apiClient.get('/gamefy/payments/export', {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response as any]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || `payments_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};
