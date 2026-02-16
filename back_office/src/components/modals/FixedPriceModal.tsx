import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { pricingApi, FixedPriceDto, PC_Type } from "../../api/pricing";
import toast from "react-hot-toast";

interface FixedPriceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const FixedPriceModal: React.FC<FixedPriceModalProps> = ({ isOpen, onClose }) => {
    const [gamingPrices, setGamingPrices] = useState<FixedPriceDto>({
        oneHourPrice: 0,
        twoHoursPrice: 0,
        threeHoursPrice: 0,
        pcType: PC_Type.GAMING
    });

    const [vipPrices, setVipPrices] = useState<FixedPriceDto>({
        oneHourPrice: 0,
        twoHoursPrice: 0,
        threeHoursPrice: 0,
        pcType: PC_Type.VIP
    });

    const [loading, setLoading] = useState(false);
    const [savingGaming, setSavingGaming] = useState(false);
    const [savingVip, setSavingVip] = useState(false);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const allPrices = await pricingApi.getAllFixedPrices();
            const gaming = allPrices.find(p => p.pcType === PC_Type.GAMING);
            const vip = allPrices.find(p => p.pcType === PC_Type.VIP);

            if (gaming) setGamingPrices(gaming);
            if (vip) setVipPrices(vip);
        } catch (error) {
            console.error("Failed to fetch prices", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPrices();
        }
    }, [isOpen]);

    const handleSave = async (type: PC_Type) => {
        const isGaming = type === PC_Type.GAMING;
        const setter = isGaming ? setSavingGaming : setSavingVip;
        const payload = isGaming ? gamingPrices : vipPrices;

        setter(true);
        try {
            await pricingApi.createOrUpdateFixedPrice(payload);
            toast.success(`${isGaming ? "Gaming" : "VIP"} prices saved successfully!`);
        } catch (error: any) {
            toast.error(error.message || `Failed to save ${isGaming ? "Gaming" : "VIP"} prices.`);
        } finally {
            setter(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-0 overflow-hidden bg-white dark:bg-[#0B0E14] border-none">
            <div className="p-6 sm:p-8 flex flex-col gap-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                        Fix PC Hourly Prices
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Configure standard pricing for different PC categories.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500">Loading current prices...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Gaming PC Section */}
                        <div className="flex flex-col gap-5 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center bg-brand-500/10 text-brand-500 rounded-xl">
                                    <span className="text-xl">🎮</span>
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white">Gaming PC</h4>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <Label>1 Hour (TND)</Label>
                                    <Input
                                        type="number"
                                        value={gamingPrices.oneHourPrice}
                                        onChange={(e) => setGamingPrices({ ...gamingPrices, oneHourPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>2 Hours (TND)</Label>
                                    <Input
                                        type="number"
                                        value={gamingPrices.twoHoursPrice}
                                        onChange={(e) => setGamingPrices({ ...gamingPrices, twoHoursPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>3 Hours (TND)</Label>
                                    <Input
                                        type="number"
                                        value={gamingPrices.threeHoursPrice}
                                        onChange={(e) => setGamingPrices({ ...gamingPrices, threeHoursPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full mt-2 bg-brand-500 hover:bg-brand-600 text-black font-bold h-11 rounded-xl shadow-lg shadow-brand-500/20"
                                onClick={() => handleSave(PC_Type.GAMING)}
                                loading={savingGaming}
                            >
                                Save Gaming Prices
                            </Button>
                        </div>

                        {/* VIP PC Section */}
                        <div className="flex flex-col gap-5 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 text-amber-500 rounded-xl">
                                    <span className="text-xl">⭐</span>
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white">VIP PC</h4>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <Label>1 Hour (TND)</Label>
                                    <Input
                                        type="number"
                                        value={vipPrices.oneHourPrice}
                                        onChange={(e) => setVipPrices({ ...vipPrices, oneHourPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>2 Hours (TND)</Label>
                                    <Input
                                        type="number"
                                        value={vipPrices.twoHoursPrice}
                                        onChange={(e) => setVipPrices({ ...vipPrices, twoHoursPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>3 Hours (TND)</Label>
                                    <Input
                                        type="number"
                                        value={vipPrices.threeHoursPrice}
                                        onChange={(e) => setVipPrices({ ...vipPrices, threeHoursPrice: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-black font-bold h-11 rounded-xl shadow-lg shadow-amber-500/20"
                                onClick={() => handleSave(PC_Type.VIP)}
                                loading={savingVip}
                            >
                                Save VIP Prices
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
                    <Button variant="outline" onClick={onClose} className="px-8">Close</Button>
                </div>
            </div>
        </Modal>
    );
};

export default FixedPriceModal;
