import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { confirmReservationCardPayment } from "../../api/reservation";

const ReservationCheckoutForm = ({ onPaymentSuccess, amount, reservationId }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + "/player/rooms?payment_success=true",
            },
            redirect: "if_required",
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
                toast.error(error.message);
            } else {
                setMessage("An unexpected error occurred.");
                toast.error("An unexpected error occurred.");
            }
        } else {
            // Payment succeeded — confirm to backend
            try {
                await confirmReservationCardPayment(reservationId);
            } catch (err) {
                const detail = err?.message || String(err) || "Unknown error";
                console.error("Failed to confirm reservation payment with backend:", detail);
                toast.error(`Confirmation failed: ${detail}`, { duration: 8000 });
                setIsLoading(false);
                return;
            }

            toast.success("Payment successful! Your reservation is confirmed.", {
                duration: 6000,
                style: {
                    background: "#24003E",
                    color: "#1CF3CA",
                    border: "1px solid #1CF3CA",
                },
            });
            onPaymentSuccess();
        }

        setIsLoading(false);
    };

    return (
        <form id="reservation-payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Reservation</label>
                <div className="text-xl font-bold text-[#1CF3CA]">Gaming Session</div>
                <div className="text-2xl font-bold text-white mt-1">{amount?.toFixed(3)} DT</div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <PaymentElement
                    id="reservation-payment-element"
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                id="reservation-submit"
                className="w-full py-4 rounded-2xl bg-[#1CF3CA] text-black font-bold text-lg hover:bg-[#1CF3CA]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(28,243,202,0.3)]"
            >
                <span id="button-text">
                    {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full mx-auto"></div> : "Pay Now"}
                </span>
            </button>

            {message && (
                <div id="reservation-payment-message" className="text-red-500 text-sm text-center mt-4">
                    {message}
                </div>
            )}
        </form>
    );
};

export default ReservationCheckoutForm;
