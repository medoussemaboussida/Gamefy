import { useEffect, useRef, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { paymentApi, AllPaymentResponseDto } from "../api/payment";
import toast from "react-hot-toast";
import Pagination from "../components/ui/pagination/Pagination";
import Button from "../components/ui/button/Button";
import { Dropdown } from "../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../components/ui/dropdown/DropdownItem";
import { ChevronDownIcon } from "../icons";

export default function PaymentManagement() {
    const [payments, setPayments] = useState<AllPaymentResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedPaidFor, setSelectedPaidFor] = useState<string>("ALL");
    const [isPaidForOpen, setIsPaidForOpen] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const itemsPerPage = 3;

    const paidForOptions = [
        { value: "ALL", label: "All Types" },
        { value: "Reservation", label: "Reservation" },
        { value: "Pack Gamefy", label: "Pack Gamefy" },
        { value: "Pack Coaching", label: "Pack Coaching" },
    ];

    const fetchPayments = async () => {
        try {
            const data = await paymentApi.getAllPayments();
            setPayments(data as AllPaymentResponseDto[]);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Debounced search effect
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            try {
                if (searchKeyword.trim()) {
                    const data = await paymentApi.searchPayments(searchKeyword.trim());
                    setPayments(data as AllPaymentResponseDto[]);
                } else {
                    const data = await paymentApi.getAllPayments();
                    setPayments(data as AllPaymentResponseDto[]);
                }
            } catch (error: any) {
                toast.error(error.message || "Search failed");
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [searchKeyword]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedPaidFor, searchKeyword]);

    const filteredPayments = (payments || []).filter((p) => {
        if (selectedPaidFor === "ALL") return true;
        return p.paidFor.startsWith(selectedPaidFor);
    });

    const totalItems = filteredPayments.length;
    const currentPayments = filteredPayments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );

    return (
        <>
            <PageMeta
                title="Payment History | Gamefy Admin"
                description="View all platform transactions"
            />
            <PageBreadcrumb pageTitle="Payment History" />

            <div className="space-y-6">
                <ComponentCard title="Platform Transactions">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                id="payment-search-input"
                                type="text"
                                placeholder="Search by user name..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="h-[38px] w-72 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 placeholder-gray-400 shadow-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-brand-500"
                            />
                            {searchKeyword && (
                                <button
                                    onClick={() => setSearchKeyword("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Paid For Filter */}
                        <div className="relative">
                            <Button
                                onClick={() => setIsPaidForOpen(!isPaidForOpen)}
                                variant="primary"
                                size="sm"
                                className="w-44 dropdown-toggle"
                                endIcon={
                                    <ChevronDownIcon
                                        className={`w-5 h-5 transition-transform duration-200 ${isPaidForOpen ? "rotate-180" : ""}`}
                                    />
                                }
                            >
                                {paidForOptions.find(opt => opt.value === selectedPaidFor)?.label}
                            </Button>
                            <Dropdown
                                isOpen={isPaidForOpen}
                                onClose={() => setIsPaidForOpen(false)}
                                className="w-44 mt-2"
                            >
                                {paidForOptions.map((option) => (
                                    <DropdownItem
                                        key={option.value}
                                        onClick={() => {
                                            setSelectedPaidFor(option.value);
                                            setIsPaidForOpen(false);
                                        }}
                                        className={selectedPaidFor === option.value ? "bg-brand-50 text-brand-500" : ""}
                                    >
                                        {option.label}
                                    </DropdownItem>
                                ))}
                            </Dropdown>
                        </div>
                    </div>

                    <div className="overflow-auto rounded-lg border border-gray-200 dark:border-white/10">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-white/5">
                                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        ID
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                        User
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 text-center">
                                        Paid For
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-sm font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 text-right">
                                        Amount
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="px-5 py-10 text-center text-gray-500">
                                            Loading transactions...
                                        </TableCell>
                                    </TableRow>
                                ) : currentPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="px-5 py-10 text-center text-gray-500">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="px-5 py-4 text-theme-sm text-gray-500">
                                                #{payment.id}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {payment.userName}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {payment.paidFor}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-right">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    DT {payment.totalPrice.toFixed(3)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </ComponentCard>
            </div>
        </>
    );
}
