import React, { useState } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { packGamefyApi } from "../../api/packGamefy";

const CheckoutForm = ({ onPaymentSuccess, amount, packName, packId }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL for post-payment redirection
                // In a real app, you'd handle this URL in your routing
                return_url: window.location.origin + "/player/packs?payment_success=true",
            },
            // If you want to handle the success manually without redirection (for single page apps),
            // you can set redirect: 'if_required'
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
                await packGamefyApi.confirmPackPayment(packId);
            } catch (err) {
                const detail = err?.message || String(err) || "Unknown error";
                console.error("Failed to confirm payment with backend:", detail);
                toast.error(`Activation failed: ${detail}`, { duration: 8000 });
                setIsLoading(false);
                return;
            }

            toast.success(`Success! You have purchased the ${packName}.`, {
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
                <label className="block text-sm font-medium text-gray-400 mb-2">Pack</label>
                <div className="text-xl font-bold text-[#1CF3CA]">{packName}</div>
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
                className="w-full py-4 rounded-2xl bg-[#1CF3CA] text-black font-bold text-lg hover:bg-[#1CF3CA]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(28,243,202,0.3)]"
            >
                <span id="button-text">
                    {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full mx-auto"></div> : "Pay Now"}
                </span>
            </button>

            {/* Show any error or success messages */}
            {message && (
                <div id="payment-message" className="text-red-500 text-sm text-center mt-4">
                    {message}
                </div>
            )}
        </form>
    );
};

export default CheckoutForm;
