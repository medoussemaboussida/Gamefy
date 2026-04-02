import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface PackDescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
}

export default function PackDescriptionModal({ isOpen, onClose, title, description }: PackDescriptionModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[600px] p-6"
        >
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                Coaching Pack Description
            </h4>
            <p className="text-sm font-medium text-brand-500 mb-4">
                {title}
            </p>
            <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar">
                {description ? (
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {description}
                    </p>
                ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-sm italic">
                        No description provided for this pack.
                    </p>
                )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10 flex justify-end">
                <Button
                    onClick={onClose}
                    variant="outline"
                    size="sm"
                >
                    Close
                </Button>
            </div>
        </Modal>
    );
}
