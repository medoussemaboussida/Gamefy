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
                    rateRule: b.rateRule
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
            benefits: [...prev.benefits, { benefitType: "PC", rateRule: "HOURS" }]
        }));
    };

    const removeBenefit = (index: number) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.filter((_, i) => i !== index)
        }));
    };

    const updateBenefit = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.map((b, i) => i === index ? { ...b, [field]: value } : b)
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
                                    <div key={index} className="flex items-end gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                                        <div className="flex-1">
                                            <Label className="text-[10px] mb-1">Type</Label>
                                            <Select
                                                options={BENEFIT_TYPES}
                                                defaultValue={benefit.benefitType}
                                                onChange={(val) => updateBenefit(index, "benefitType", val)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Label className="text-[10px] mb-1">Rule</Label>
                                            <Select
                                                options={RATE_RULES}
                                                defaultValue={benefit.rateRule}
                                                onChange={(val) => updateBenefit(index, "rateRule", val)}
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
