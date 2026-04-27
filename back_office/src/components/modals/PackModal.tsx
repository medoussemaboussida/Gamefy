import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { packGamefyApi, CreatePackGamefyDto, PackGamefyDto } from "../../api/packGamefy";
import toast from "react-hot-toast";
import { TrashBinIcon, PlusIcon } from "../../icons";

interface PackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    pack?: PackGamefyDto | null;
}

const BENEFIT_TYPES = [
    { value: "PC", label: "PC Access" },
    { value: "VIP", label: "VIP Status" },
    { value: "COACH", label: "Coaching Sessions" },
];

const RATE_RULES = [
    { value: "HOURS", label: "Hours Based" },
    { value: "DISCOUNT", label: "Discount Based" },
    { value: "FREE_ITEM", label: "Free Item" },
];

const DISCOUNT_TYPES = [
    { value: "PERCENTAGE", label: "Percentage (%)" },
    { value: "FIXED_AMOUNT", label: "Fixed Amount (TND)" },
];

const PackModal: React.FC<PackModalProps> = ({ isOpen, onClose, onSuccess, pack }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreatePackGamefyDto>({
        name: "",
        price: 0,
        description: "",
        benefits: [],
    });

    useEffect(() => {
        if (pack) {
            setFormData({
                name: pack.name,
                price: pack.price,
                description: pack.description || "",
                durationMonths: pack.durationMonths,
                benefits: pack.benefits.map(b => ({
                    benefitType: b.benefitType,
                    rateRule: b.rateRule,
                    discountType: b.discountType,
                    discountValue: b.discountValue,
                })),
            });
        } else {
            setFormData({
                name: "",
                price: 0,
                description: "",
                benefits: [],
            });
        }
    }, [pack, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "price" ? parseFloat(value) : name === "durationMonths" ? parseInt(value) : value
        }));
    };

    const addBenefit = () => {
        setFormData(prev => ({
            ...prev,
            benefits: [...prev.benefits, { benefitType: "PC", rateRule: "HOURS", discountType: undefined, discountValue: undefined, itemName: undefined, itemQuantity: undefined }]
        }));
    };

    const removeBenefit = (index: number) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.filter((_, i) => i !== index)
        }));
    };

    const updateBenefit = (index: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.map((b, i) => i === index ? { 
                ...b, 
                [field]: field === "discountValue" ? parseFloat(value) : value 
            } : b)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (pack) {
                await packGamefyApi.updatePack(pack.id, formData);
                toast.success("Pack updated successfully! 🚀");
            } else {
                await packGamefyApi.createPack(formData);
                toast.success("Pack created successfully! 🚀");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save pack.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-6 sm:p-8">
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        {pack ? "Update Pack" : "Add New Pack"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {pack ? "Modify the pack details and benefits." : "Create a new gaming pack with custom benefits."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <Label>Pack Name</Label>
                            <Input
                                name="name"
                                placeholder="e.g. Pro Gamer Pack"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Price (TND)</Label>
                            <Input
                                type="number"
                                name="price"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Duration (Months)</Label>
                        <Input
                            type="number"
                            name="durationMonths"
                            placeholder="6"
                            value={formData.durationMonths}
                            onChange={handleChange}
                            min={"1"}
                            max={"36"}
                            required
                        />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <textarea
                            name="description"
                            className="w-full h-24 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none text-sm"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter pack description..."
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <Label>Benefits</Label>
                            <button
                                type="button"
                                onClick={addBenefit}
                                className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" /> Add Benefit
                            </button>
                        </div>
                        <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto no-scrollbar p-1">
                            {formData.benefits.length === 0 ? (
                                <p className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
                                    No benefits added yet.
                                </p>
                            ) : (
                                formData.benefits.map((benefit, index) => (
                                    <div key={index} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                        <div className="flex items-end gap-3">
                                            {benefit.rateRule !== "FREE_ITEM" && (
                                                <div className="flex-1">
                                                    <Label className="text-[10px] mb-1">Type</Label>
                                                    <Select
                                                        options={BENEFIT_TYPES}
                                                        defaultValue={benefit.benefitType}
                                                        onChange={(val) => updateBenefit(index, "benefitType", val)}
                                                    />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <Label className="text-[10px] mb-1">Rule</Label>
                                                <Select
                                                    options={RATE_RULES}
                                                    defaultValue={benefit.rateRule}
                                                     onChange={(val) => {
                                                        updateBenefit(index, "rateRule", val);
                                                        if (val === "HOURS") {
                                                            // Clear discount and item fields when switching to HOURS
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                benefits: prev.benefits.map((b, i) => i === index
                                                                    ? { ...b, rateRule: val, discountType: undefined, discountValue: undefined, itemName: undefined, itemQuantity: undefined }
                                                                    : b)
                                                            }));
                                                        } else if (val === "DISCOUNT") {
                                                            // Set default discount values when switching to DISCOUNT
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                benefits: prev.benefits.map((b, i) => i === index
                                                                    ? { ...b, rateRule: val, discountType: "PERCENTAGE", discountValue: 0, itemName: undefined, itemQuantity: undefined }
                                                                    : b)
                                                            }));
                                                        } else if (val === "FREE_ITEM") {
                                                            // Set default item values when switching to FREE_ITEM, clear benefitType
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                benefits: prev.benefits.map((b, i) => i === index
                                                                    ? { ...b, rateRule: val, benefitType: undefined, discountType: undefined, discountValue: undefined, itemName: "", itemQuantity: 1 }
                                                                    : b)
                                                            }));
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeBenefit(index)}
                                                className="p-2.5 text-gray-400 hover:text-error-500 transition-colors"
                                            >
                                                <TrashBinIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        {benefit.rateRule === "DISCOUNT" && (
                                            <div className="flex items-end gap-3 pt-1 pl-2 border-l-2 border-brand-300 dark:border-brand-600 ml-1">
                                                <div className="flex-1">
                                                    <Label className="text-[10px] mb-1">Discount Type</Label>
                                                    <Select
                                                        options={DISCOUNT_TYPES}
                                                        defaultValue={benefit.discountType || "PERCENTAGE"}
                                                        onChange={(val) => updateBenefit(index, "discountType", val)}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-[10px] mb-1">Value</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder={benefit.discountType === "FIXED_AMOUNT" ? "e.g. 5 TND" : "e.g. 20%"}
                                                        value={benefit.discountValue ?? ""}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                            updateBenefit(index, "discountValue", e.target.value)
                                                        }
                                                        min={"0"}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {benefit.rateRule === "FREE_ITEM" && (
                                            <div className="flex items-end gap-3 pt-1 pl-2 border-l-2 border-success-300 dark:border-success-600 ml-1">
                                                <div className="flex-1">
                                                    <Label className="text-[10px] mb-1">Item Name</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="e.g. Cookie, Soda"
                                                        value={benefit.itemName ?? ""}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                            updateBenefit(index, "itemName", e.target.value)
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label className="text-[10px] mb-1">Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="1"
                                                        value={benefit.itemQuantity ?? ""}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                            updateBenefit(index, "itemQuantity", e.target.value)
                                                        }
                                                        min={"1"}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={onClose} type="button" disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" loading={loading}>
                            {pack ? "Update Pack" : "Create Pack"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default PackModal;
