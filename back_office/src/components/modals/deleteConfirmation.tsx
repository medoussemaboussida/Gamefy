import React from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { TrashBinIcon } from "../../icons";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    loading?: boolean;
    /** Override default delete-user copy (e.g. pack removal) */
    title?: string;
    description?: string;
    confirmLabel?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    userName,
    loading = false,
    title = "Delete this item",
    description,
    confirmLabel = "Delete",
}) => {
    const defaultDescription = (
        <>
            Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone and will notify the user via email.
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[400px] p-6 sm:p-8">
            <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-error-50 dark:bg-error-500/10">
                    <TrashBinIcon className="w-6 h-6 text-error-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    {title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {description ?? defaultDescription}
                </p>

                <div className="flex items-center justify-center w-full gap-3 mt-8">
                    <Button variant="outline" onClick={onClose} type="button" disabled={loading} className="flex-1">
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={onConfirm} loading={loading} className="flex-1 bg-error-500 hover:bg-error-600 border-error-500">
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteConfirmationModal;
