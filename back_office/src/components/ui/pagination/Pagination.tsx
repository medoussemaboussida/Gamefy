import React from "react";
import { AngleLeftIcon, AngleRightIcon } from "../../../icons";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 px-5 py-4 border-t border-gray-100 sm:flex-row dark:border-white/[0.05]">

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                >
                    <AngleLeftIcon className="w-5 h-5 transition-transform duration-200" />
                </button>

                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20 px-4"
                                : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/[0.05]"
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-9 h-9 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 dark:border-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                >
                    <AngleRightIcon className="w-5 h-5 transition-transform duration-200" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
