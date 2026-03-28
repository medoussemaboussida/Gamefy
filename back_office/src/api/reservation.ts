import { apiClient } from "./apiClient";

export enum Reservation_Status {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
}

export enum Reservation_Type {
    PC_ROOM = "PC_ROOM",
    VIP_ROOM = "VIP_ROOM",
    COACHING_ROOM = "COACHING_ROOM",
}

export interface ReservationDto {
    id: number;
    reservationType: Reservation_Type;
    startTime: string;
    endTime: string;
    status: Reservation_Status;
    pcNumbers: number[];
    playerName: string;
    priceTime: number;
    paymentType: string;
    createdAt: string;
    coachId: number | null;
    coachName: string | null;
    game: string | null;
}

export const reservationApi = {
    getAllReservations: async (): Promise<ReservationDto[]> => {
        return apiClient.get("/gamefy/reservations");
    },

    searchReservations: async (keyword: string): Promise<ReservationDto[]> => {
        return apiClient.get("/gamefy/reservations/search", { params: { keyword } });
    },

    deleteReservation: async (id: number): Promise<void> => {
        await apiClient.delete(`/gamefy/reservations/${id}`);
    },

    updateStatus: async (id: number, status: Reservation_Status): Promise<ReservationDto> => {
        return apiClient.put(`/gamefy/reservations/${id}/status`, { status });
    },
};
