import React from "react";
import Button from "../ui/button/Button";
import { ReservationDto, Reservation_Status } from "../../api/reservation";

interface StatusChangeModalProps {
    isOpen: boolean;
    reservation: ReservationDto | null;
    targetStatus: Reservation_Status | null;
    loading: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({ 
    isOpen, 
    reservation, 
    targetStatus, 
    loading, 
    onConfirm, 
    onClose 
}) => {
    if (!isOpen || !reservation || !targetStatus) return null;

    const statusMessages: Record<Reservation_Status, string> = {
        [Reservation_Status.CONFIRMED]: "This will immediately add a payment record for this reservation.",
        [Reservation_Status.CANCELLED]: "This will mark the reservation as cancelled. It will be automatically deleted after 24 hours.",
        [Reservation_Status.PENDING]: "This will revert the reservation back to pending status. It will be automatically deleted after 24 hours if unpaid.",
    };

    const statusColors: Record<Reservation_Status, string> = {
        [Reservation_Status.CONFIRMED]: "text-success-600",
        [Reservation_Status.CANCELLED]: "text-error-600",
        [Reservation_Status.PENDING]: "text-warning-600",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Change Status to{" "}
                    <span className={statusColors[targetStatus]}>{targetStatus}</span>?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Reservation for <span className="font-medium text-gray-800 dark:text-white">{reservation.playerName}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 mb-6">
                    {statusMessages[targetStatus]}
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Confirm"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StatusChangeModal;
