import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pagination component for Front Office
 * @param {Object} props
 * @param {number} props.currentPage
 * @param {number} props.totalItems
 * @param {number} props.itemsPerPage
 * @param {Function} props.onPageChange
 */
const Pagination = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-2 p-5 border-t border-white/5 bg-white/[0.02]">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/5 text-white/40 hover:bg-white/5 hover:text-[#1CF3CA] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`flex items-center justify-center min-w-[36px] h-9 px-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            currentPage === page
                                ? "bg-gradient-to-br from-[#1CF3CA] to-blue-500 text-black shadow-lg shadow-[#1CF3CA]/20"
                                : "text-white/40 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/5 text-white/40 hover:bg-white/5 hover:text-[#1CF3CA] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;
