// app/(root)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Wallet,
} from "lucide-react";
import GanaaDataTable from "@/components/datatable/GanaaDataTable";
import { Column, Action, HeaderStatistic, Filter } from "@/types/table.types";
import axiosInstance from "@/lib/axios";
import { hasValidTokens } from "@/lib/token";

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
  loanDate: string;
  dueDate?: string;
  status: "ACTIVE" | "PAID" | "OVERDUE";
  type: "BORROWED" | "LENT";
  otherParty: string;
  payments: Payment[];
  _count?: {
    payments: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface LoanStats {
  borrowed: { count: number; total: number };
  lent: { count: number; total: number };
  netBalance: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!hasValidTokens()) {
      router.replace("/");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansResponse, statsResponse] = await Promise.all([
        axiosInstance.get("/api/loans"),
        axiosInstance.get("/api/loans/stats"),
      ]);
      setLoans(loansResponse.data);
      setStats(statsResponse.data);
    } catch (err: any) {
      if (err.response?.status === 401) router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = () => router.push("/loans/create");
  const handleEditLoan = (loan: Loan) => router.push(`/loans/${loan.id}/edit`);
  const handleViewPayments = (loan: Loan) =>
    router.push(`/loans/${loan.id}/payments`);

  const handleDeleteLoan = async (loan: Loan) => {
    const confirmed = window.confirm(
      `"${loan.otherParty}" - ${loan.amount}₮ зээлийг устгах уу?`
    );
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/api/loans/${loan.id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Зээл устгахад алдаа гарлаа");
    }
  };

  const handleMarkAsPaid = async (loan: Loan) => {
    const confirmed = window.confirm(
      `"${loan.otherParty}" - ${loan.remainingAmount}₮ үлдэгдлийг бүтэн төлөх үү?`
    );
    if (!confirmed) return;

    try {
      await axiosInstance.patch(`/api/loans/${loan.id}/paid`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Алдаа гарлаа");
    }
  };

  const handleAddPayment = (loan: Loan) => {
    router.push(`/loans/${loan.id}/add-payment`);
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.otherParty.toLowerCase().includes(searchValue.toLowerCase()) ||
      loan.description?.toLowerCase().includes(searchValue.toLowerCase());
    const matchesType = filterType === "all" || loan.type === filterType;
    const matchesStatus =
      filterStatus === "all" || loan.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLoans.length / pageSize);
  const paginatedLoans = filteredLoans.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: Column[] = [
    {
      key: "type",
      label: "Төрөл",
      sortable: true,
      type: "badge",
      badgeConfig: {
        BORROWED:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        LENT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        labels: { BORROWED: "Авсан", LENT: "Өгсөн" },
      },
    },
    {
      key: "otherParty",
      label: "Харилцагч",
      sortable: true,
    },
    {
      key: "amount",
      label: "Нийт дүн",
      sortable: true,
      render: (value) => `${value.toLocaleString()}₮`,
    },
    {
      key: "remainingAmount",
      label: "Үлдэгдэл",
      sortable: true,
      render: (value, item) => (
        <div className="flex flex-col">
          <span className="font-semibold">{value.toLocaleString()}₮</span>
          <span className="text-xs text-gray-500">
            {((value / item.amount) * 100).toFixed(0)}%
          </span>
        </div>
      ),
    },
    {
      key: "_count",
      label: "Төлсөн тоо",
      render: (value) => value?.payments || 0,
    },
    {
      key: "status",
      label: "Төлөв",
      sortable: true,
      type: "badge",
      badgeConfig: {
        ACTIVE:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        labels: { ACTIVE: "Идэвхтэй", PAID: "Төлөгдсөн", OVERDUE: "Хэтэрсэн" },
      },
    },
    {
      key: "loanDate",
      label: "Зээлсэн огноо",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("mn-MN"),
    },
    {
      key: "dueDate",
      label: "Төлөлт хийх огноо",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("mn-MN"),
    },
  ];

  const actions: Action[] = [
    {
      title: "Төлөлт нэмэх",
      icon: Wallet,
      onClick: handleAddPayment,
      disabled: (loan) => loan.status === "PAID",
    },
    {
      title: "Түүх харах",
      icon: History,
      onClick: handleViewPayments,
    },
    {
      title: "Бүтэн төлөх",
      icon: CheckCircle,
      onClick: handleMarkAsPaid,
      disabled: (loan) => loan.status === "PAID",
    },
    {
      title: "Засах",
      icon: Edit,
      onClick: handleEditLoan,
    },
    {
      title: "Устгах",
      icon: Trash2,
      onClick: handleDeleteLoan,
      className: "text-red-600 hover:text-red-700",
    },
  ];

  const headerStatistics: HeaderStatistic[] = [
    {
      label: "Авсан зээл",
      value: stats ? `${stats.borrowed.total.toLocaleString()}₮` : "0₮",
      icon: ArrowDownRight,
      color: "text-red-500",
    },
    {
      label: "Өгсөн зээл",
      value: stats ? `${stats.lent.total.toLocaleString()}₮` : "0₮",
      icon: ArrowUpRight,
      color: "text-green-500",
    },
    {
      label: "Баланс",
      value: stats ? `${stats.netBalance.toLocaleString()}₮` : "0₮",
      icon: DollarSign,
      color: stats && stats.netBalance >= 0 ? "text-green-500" : "text-red-500",
    },
  ];

  const filters: Filter[] = [
    {
      key: "type",
      label: "Төрөл",
      type: "select",
      value: filterType,
      options: [
        { value: "all", label: "Бүгд" },
        { value: "BORROWED", label: "Авсан" },
        { value: "LENT", label: "Өгсөн" },
      ],
    },
    {
      key: "status",
      label: "Төлөв",
      type: "select",
      value: filterStatus,
      options: [
        { value: "all", label: "Бүгд" },
        { value: "ACTIVE", label: "Идэвхтэй" },
        { value: "PAID", label: "Төлөгдсөн" },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <GanaaDataTable
        data={paginatedLoans}
        loading={loading}
        columns={columns}
        title="Зээлийн удирдлага"
        subtitle="Таны авсан болон өгсөн зээлүүдийн бүртгэл"
        headerIcon={DollarSign}
        headerStatistics={headerStatistics}
        primaryAction={{
          label: "Шинэ зээл",
          icon: PlusCircle,
          onClick: handleCreateLoan,
          variant: "default",
        }}
        actions={actions}
        searchPlaceholder="Харилцагч, тайлбараар хайх..."
        onSearch={setSearchValue}
        searchValue={searchValue}
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "type") setFilterType(value);
          else if (key === "status") setFilterStatus(value);
          setCurrentPage(1);
        }}
        onClearFilters={() => {
          setFilterType("all");
          setFilterStatus("all");
          setSearchValue("");
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={filteredLoans.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onRefresh={fetchData}
        enableColumnVisibility
        enableMobileCards
      />
    </div>
  );
}
