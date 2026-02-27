import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { X } from "lucide-react";

const PaymentModal = ({ isOpen, onClose, clientSecret, pack, onPaymentSuccess }) => {
    if (!isOpen || !clientSecret || !pack) return null;

    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
        console.error("Stripe publishable key is not configured.");
        return null;
    }

    // Initialize Stripe lazily only when the modal is actually open
    const stripePromise = loadStripe(publishableKey);

    const appearance = {
        theme: 'night',
        variables: {
            colorPrimary: '#1CF3CA',
            colorBackground: '#1a0135',
            colorText: '#ffffff',
            colorDanger: '#df1b41',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '12px',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="bg-[#1a0135] border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-6 md:p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Secure Checkout</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm
                            onPaymentSuccess={onPaymentSuccess}
                            amount={pack.price}
                            packName={pack.name}
                            packId={pack.id}
                        />
                    </Elements>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
