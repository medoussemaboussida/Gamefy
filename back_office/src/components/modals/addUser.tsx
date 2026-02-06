import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Select from "../form/Select";
import Label from "../form/Label";
import { userApi } from "../../api/user";
import toast from "react-hot-toast";

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "WEB_MASTER", // Default role
    });

    const roleOptions = [
        { value: "ADMIN", label: "Admin" },
        { value: "WEB_MASTER", label: "Web Master" },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value: string) => {
        setFormData((prev) => ({ ...prev, role: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await userApi.createUser(formData);
            toast.success("User created successfully! Email sent. 📧");
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                role: "WEB_MASTER",
            });
        } catch (error: any) {
            console.error("Failed to create user:", error);
            toast.error(error.message || "Failed to create user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 sm:p-8">
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Add New Administrative User
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Enter the details below. A random password will be generated and emailed to the user.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <Label>First Name</Label>
                            <Input
                                name="firstName"
                                placeholder="Enter first name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label>Last Name</Label>
                            <Input
                                name="lastName"
                                placeholder="Enter last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Email Address</Label>
                        <Input
                            type="email"
                            name="email"
                            placeholder="example@gamefy.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label>Role</Label>
                        <Select
                            options={roleOptions}
                            defaultValue={formData.role}
                            onChange={handleRoleChange}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-2">
                        <Button variant="outline" onClick={onClose} type="button" disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" loading={loading}>
                            Create User
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default AddUserModal;
