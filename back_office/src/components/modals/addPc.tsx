import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Label from "../form/Label";
import { pcApi } from "../../api/pc";
import toast from "react-hot-toast";

interface PCModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pcData?: any | null;
}

const PCModal: React.FC<PCModalProps> = ({ isOpen, onClose, onSuccess, pcData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pcNumber: 0,
    status: "AVAILABLE",
    games: "FC26",
    pcType: "GAMING",
    pcLocation: "SOUKRA",
  });

  const isEdit = !!pcData;

  useEffect(() => {
    if (pcData) {
      setFormData({
        pcNumber: pcData.pcNumber,
        status: pcData.status,
        games: pcData.games,
        pcType: pcData.pcType,
        pcLocation: pcData.pcLocation || "SOUKRA",
      });
    } else {
      setFormData({
        pcNumber: 0,
        status: "AVAILABLE",
        games: "FC26",
        pcType: "GAMING",
        pcLocation: "SOUKRA",
      });
    }
  }, [pcData]);

  const statusOptions = [
    { value: "AVAILABLE",      label: "Available"      },
    { value: "OUT_OF_SERVICE", label: "Out of Service" },
    { value: "MAINTENANCE",    label: "Maintenance"    },
  ];

  const gamesOptions = [
    { value: "FC26",              label: "FC 26"              },
    { value: "VALORANT",          label: "Valorant"           },
    { value: "CS_GO",             label: "CS:GO"              },
    { value: "LEAGUE_OF_LEGENDS", label: "League of Legends" },
  ];

  const typeOptions = [
    { value: "GAMING", label: "Gaming" },
    { value: "VIP",    label: "VIP"    },
  ];

  const locationOptions = [
    { value: "SOUKRA", label: "Soukra" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pcNumber" ? Number(value) : value,
    }));
  };

  const handleSelect = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pcNumber <= 0) {
      toast.error("PC number must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      if (isEdit && pcData?.id) {
        await pcApi.updatePC(pcData.id, formData);
        toast.success("PC updated successfully!");
      } else {
        await pcApi.createPC(formData);
        toast.success("PC created successfully!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} PC`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {isEdit ? "Edit PC" : "Add New PC"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isEdit ? "Update" : "Enter"} the PC configuration below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <Label>PC Number *</Label>
            <Input
              type="number"
              name="pcNumber"
              placeholder="1, 2, 3..."
              value={formData.pcNumber}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              options={statusOptions}
              defaultValue={formData.status}
              onChange={handleSelect("status")}
            />
          </div>

          <div>
            <Label>Games</Label>
            <Select
              options={gamesOptions}
              defaultValue={formData.games}
              onChange={handleSelect("games")}
            />
          </div>

          <div>
            <Label>PC Type</Label>
            <Select
              options={typeOptions}
              defaultValue={formData.pcType}
              onChange={handleSelect("pcType")}
            />
          </div>

          <div>
            <Label>Location</Label>
            <Select
              options={locationOptions}
              defaultValue={formData.pcLocation}
              onChange={handleSelect("pcLocation")}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              {isEdit ? "Update PC" : "Create PC"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PCModal;