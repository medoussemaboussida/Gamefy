import { useEffect, useState } from "react";
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

export default function PaymentManagement() {
    const [payments, setPayments] = useState<AllPaymentResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <>
            <PageMeta
                title="Payment History | Gamefy Admin"
                description="View all platform transactions"
            />
            <PageBreadcrumb pageTitle="Payment History" />

            <div className="space-y-6">
                <ComponentCard title="Platform Transactions">
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
                                ) : payments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="px-5 py-10 text-center text-gray-500">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((payment) => (
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
                                                    DT {payment.totalPrice.toFixed(1)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </ComponentCard>
            </div>
        </>
    );
}
