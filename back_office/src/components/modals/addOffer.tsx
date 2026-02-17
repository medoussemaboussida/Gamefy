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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "reduction" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.offerName.trim()) {
      toast.error("Offer name is required");
      return;
    }
    if (formData.reduction < 0 || formData.reduction > 100) {
      toast.error("Reduction must be between 0 and 100");
      return;
    }

    setLoading(true);
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
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} offer`);
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
              required
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
              min="0"
              max="100"
              required
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