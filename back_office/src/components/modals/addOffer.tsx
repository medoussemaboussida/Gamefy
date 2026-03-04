import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Label from "../form/Label";
import { offerApi } from "../../api/offer";
import toast from "react-hot-toast";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  offerData?: any | null;
}

const OfferModal: React.FC<OfferModalProps> = ({ isOpen, onClose, onSuccess, offerData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    offerName: "",
    reduction: 0,
    status: "ACTIVE",
  });
  const [fieldErrors, setFieldErrors] = useState<{ offerName?: string; reduction?: string }>({});

  const isEdit = !!offerData;

  useEffect(() => {
    if (offerData) {
      setFormData({
        offerName: offerData.offerName,
        reduction: offerData.reduction,
        status: offerData.status,
      });
    } else {
      setFormData({
        offerName: "",
        reduction: 0,
        status: "ACTIVE",
      });
    }
  }, [offerData]);

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  const validateField = (name: string, value: any) => {
    let errorMsg = "";
    if (name === "offerName") {
      if (!value.trim()) {
        errorMsg = "Offer name is required";
      }
    } else if (name === "reduction") {
      const numValue = Number(value);
      if (value === "" || isNaN(numValue)) {
        errorMsg = "Reduction is required and must be a number";
      } else if (numValue < 0 || numValue > 100) {
        errorMsg = "Reduction must be between 0 and 100";
      }
    }
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const finalValue = name === "reduction" ? (value === "" ? "" : Number(value)) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    validateField(name, value);
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateField("offerName", formData.offerName);
    const reductionErr = validateField("reduction", formData.reduction);

    if (nameErr || reductionErr) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    setFieldErrors({});
    try {
      if (isEdit && offerData?.id) {
        await offerApi.updateOffer(offerData.id, formData);
        toast.success("Offer updated successfully!");
      } else {
        await offerApi.createOffer(formData);
        toast.success("Offer created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save offer:", error);
      const errorMessage = error.message || `Failed to ${isEdit ? "update" : "create"} offer`;

      // Map server-side validation error messages to fields
      if (errorMessage.toLowerCase().includes("offer name")) {
        setFieldErrors(prev => ({ ...prev, offerName: errorMessage }));
      } else if (errorMessage.toLowerCase().includes("reduction")) {
        setFieldErrors(prev => ({ ...prev, reduction: errorMessage }));
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[480px] p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {isEdit ? "Edit Offer" : "Add New Offer"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEdit ? "Update" : "Enter"} the offer details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <Label>Offer Name *</Label>
            <Input
              name="offerName"
              placeholder="Summer Discount 2025"
              value={formData.offerName}
              onChange={handleChange}
              error={!!fieldErrors.offerName}
              hint={fieldErrors.offerName}
            />
          </div>

          <div>
            <Label>Reduction (%) *</Label>
            <Input
              type="number"
              name="reduction"
              placeholder="25"
              value={formData.reduction}
              onChange={handleChange}
              error={!!fieldErrors.reduction}
              hint={fieldErrors.reduction}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              options={statusOptions}
              defaultValue={formData.status}
              onChange={handleSelectChange}
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <Button variant="outline" onClick={onClose} type="button" disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              {isEdit ? "Update Offer" : "Create Offer"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default OfferModal;