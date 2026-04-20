import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { packCoachingApi } from "../../api/packCoaching";

const CoachingCheckoutForm = ({ onPaymentSuccess, amount, packName, packId, isRenewal }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + "/player/packs?payment_success=true",
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
            // Payment succeeded! Now confirm to backend to update DB.
            try {
                if (isRenewal) {
                    await packCoachingApi.confirmCoachingPackRenewal(packId);
                } else {
                    await packCoachingApi.confirmCoachingPackPayment(packId);
                }
            } catch (err) {
                const detail = err?.message || String(err) || "Unknown error";
                console.error("Failed to confirm coaching pack payment with backend:", detail);
                toast.error(`Activation failed: ${detail}`, { duration: 8000 });
                setIsLoading(false);
                return;
            }

            const action = isRenewal ? "renewed" : "purchased";
            toast.success(`Success! You have ${action} the ${packName}.`, {
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
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Coaching Pack</label>
                <div className="text-xl font-bold text-[#FF89EB]">{packName}</div>
                <div className="text-2xl font-bold text-white mt-1">{Number(amount).toFixed(3)} DT</div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <PaymentElement
                    id="payment-element"
                    options={{
                        layout: "tabs",
                    }}
                />
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full py-4 rounded-2xl bg-[#FF89EB] text-black font-bold text-lg hover:bg-[#FF89EB]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,137,235,0.3)]"
            >
                <span id="button-text">
                    {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full mx-auto"></div> : "Pay Now"}
                </span>
            </button>

            {message && (
                <div id="payment-message" className="text-red-500 text-sm text-center mt-4">
                    {message}
                </div>
            )}
        </form>
    );
};

export default CoachingCheckoutForm;
