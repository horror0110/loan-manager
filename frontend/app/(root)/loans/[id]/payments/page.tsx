// app/dashboard/loans/[id]/payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Trash2,
  Plus,
  FileText,
  TrendingDown,
  Clock,
} from "lucide-react";
import GanaaDataTable from "@/components/datatable/GanaaDataTable";
import { Column, Action, HeaderStatistic } from "@/types/table.types";
import axiosInstance from "@/lib/axios";

interface Payment {
  id: number;
  amount: number;
  description?: string;
  paymentDate: string;
  createdAt: string;
}

interface Loan {
  id: number;
  amount: number;
  remainingAmount: number;
  description?: string;
  otherParty: string;
  type: "BORROWED" | "LENT";
  status: string;
  payments: Payment[];
}

export default function PaymentHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params.id;
  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [loanId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loanResponse, paymentsResponse] = await Promise.all([
        axiosInstance.get(`/api/loans/${loanId}`),
        axiosInstance.get(`/api/loans/${loanId}/payments`),
      ]);
      setLoan(loanResponse.data);
      setPayments(paymentsResponse.data);
    } catch (err) {
      alert("Мэдээлэл татахад алдаа гарлаа");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (payment: Payment) => {
    if (!confirm(`${payment.amount}₮ Төлөлтийг устгах уу?`)) return;
    try {
      await axiosInstance.delete(`/api/loans/${loanId}/payments/${payment.id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Алдаа гарлаа");
    }
  };

  const handleAddPayment = () => {
    router.push(`/loans/${loanId}/add-payment`);
  };

  const totalPaid = loan ? loan.amount - loan.remainingAmount : 0;
  const paymentPercentage = loan
    ? ((totalPaid / loan.amount) * 100).toFixed(1)
    : "0";

  const columns: Column[] = [
    {
      key: "paymentDate",
      label: "Огноо",
      sortable: true,
      render: (value) =>
        new Date(value).toLocaleDateString("mn-MN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    },
    {
      key: "amount",
      label: "Дүн",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {value.toLocaleString()}₮
        </span>
      ),
    },
    {
      key: "description",
      label: "Тайлбар",
      render: (value) => value || "-",
    },
    {
      key: "createdAt",
      label: "Бүртгэсэн",
      render: (value) => new Date(value).toLocaleDateString("mn-MN"),
    },
  ];

  const actions: Action[] = [
    {
      title: "Устгах",
      icon: Trash2,
      onClick: handleDeletePayment,
      className: "text-red-600 hover:text-red-700",
    },
  ];

  const headerStatistics: HeaderStatistic[] = [
    {
      label: "Нийт дүн",
      value: loan ? `${loan.amount.toLocaleString()}₮` : "0₮",
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      label: "Төлсөн",
      value: `${totalPaid.toLocaleString()}₮`,
      icon: TrendingDown,
      color: "text-green-500",
    },
    {
      label: "Үлдэгдэл",
      value: loan ? `${loan.remainingAmount.toLocaleString()}₮` : "0₮",
      icon: Clock,
      color: "text-orange-500",
    },
    {
      label: "Гүйцэтгэл",
      value: `${paymentPercentage}%`,
      icon: Calendar,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Буцах
        </button>

        {loan && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {loan.otherParty}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {loan.description || "Тайлбаргүй"}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  loan.type === "BORROWED"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                }`}
              >
                {loan.type === "BORROWED" ? "Авсан" : "Өгсөн"}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Төлөлтийн явц</span>
                <span className="font-semibold">{paymentPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${paymentPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <GanaaDataTable
        data={payments}
        loading={loading}
        columns={columns}
        title="Төлөлтийн түүх"
        subtitle={`Нийт ${payments.length} Төлөлт бүртгэгдсэн`}
        headerIcon={DollarSign}
        headerStatistics={headerStatistics}
        primaryAction={
          loan?.status !== "PAID"
            ? {
                label: "Төлөлт нэмэх",
                icon: Plus,
                onClick: handleAddPayment,
                variant: "default",
              }
            : undefined
        }
        actions={actions}
        onRefresh={fetchData}
        enableColumnVisibility
        enableMobileCards
      />
    </div>
  );
}
