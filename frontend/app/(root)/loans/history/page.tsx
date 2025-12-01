// app/(root)/loans/history/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  History,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Download,
  Filter,
} from "lucide-react";
import GanaaDataTable from "@/components/datatable/GanaaDataTable";
import {
  Column,
  HeaderStatistic,
  Filter as FilterType,
} from "@/types/table.types";
import axiosInstance from "@/lib/axios";
import { hasValidTokens } from "@/lib/token";

interface Payment {
  id: number;
  amount: number;
  description?: string;
  paymentDate: string;
  loanId: number;
}

interface Customer {
  id: number;
  name: string;
  register: string;
  phone: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface Loan {
  id: number;
  amount: number;
  remainingAmount: number;
  description?: string;
  otherParty: string;
  type: "BORROWED" | "LENT";
  status: string;
  loanDate: string;
  customerId?: number | null;
  customer?: Customer | null;
  payments: Payment[];
}

interface HistoryItem {
  id: string;
  date: string;
  type: "loan" | "payment";
  transactionType: "BORROWED" | "LENT";
  otherParty: string;
  customer?: Customer | null;
  amount: number;
  description?: string;
  loanId: number;
  status?: string;
  remainingAmount?: number;
}

export default function LoanHistoryPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTransaction, setFilterTransaction] = useState<string>("all");
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
      const response = await axiosInstance.get("/api/loans");
      const loansData: Loan[] = response.data;
      setLoans(loansData);

      // Бүх зээл болон Төлөлтүүдийг нэгтгэх
      const items: HistoryItem[] = [];

      loansData.forEach((loan) => {
        // Зээлийн бүртгэл
        items.push({
          id: `loan-${loan.id}`,
          date: loan.loanDate,
          type: "loan",
          transactionType: loan.type,
          otherParty: loan.otherParty,
          customer: loan.customer,
          amount: loan.amount,
          description: loan.description,
          loanId: loan.id,
          status: loan.status,
          remainingAmount: loan.remainingAmount,
        });

        // Төлөлтүүд
        loan.payments.forEach((payment) => {
          items.push({
            id: `payment-${payment.id}`,
            date: payment.paymentDate,
            type: "payment",
            transactionType: loan.type,
            otherParty: loan.otherParty,
            customer: loan.customer,
            amount: payment.amount,
            description: payment.description,
            loanId: loan.id,
          });
        });
      });

      // Огноогоор эрэмбэлэх (шинэ эхэнд)
      items.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setHistoryItems(items);
    } catch (err: any) {
      if (err.response?.status === 401) router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = historyItems.filter((item) => {
    const customerName = item.customer?.name || "";
    const customerRegister = item.customer?.register || "";
    const customerPhone = item.customer?.phone || "";

    const matchesSearch =
      item.otherParty.toLowerCase().includes(searchValue.toLowerCase()) ||
      customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
      customerRegister.toLowerCase().includes(searchValue.toLowerCase()) ||
      customerPhone.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchValue.toLowerCase());

    const matchesType = filterType === "all" || item.type === filterType;
    const matchesTransaction =
      filterTransaction === "all" || item.transactionType === filterTransaction;
    return matchesSearch && matchesType && matchesTransaction;
  });

  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Статистик тооцоолох
  const totalLoans = historyItems.filter((item) => item.type === "loan").length;
  const totalPayments = historyItems.filter(
    (item) => item.type === "payment"
  ).length;
  const totalBorrowed = loans
    .filter((l) => l.type === "BORROWED")
    .reduce((sum, l) => sum + l.amount, 0);
  const totalLent = loans
    .filter((l) => l.type === "LENT")
    .reduce((sum, l) => sum + l.amount, 0);

  const columns: Column[] = [
    {
      key: "date",
      label: "Огноо",
      sortable: true,
      render: (value) =>
        new Date(value).toLocaleDateString("mn-MN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      key: "type",
      label: "Төрөл",
      type: "badge",
      badgeConfig: {
        loan: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        payment:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        labels: {
          loan: "Зээл",
          payment: "Төлөлт",
        },
      },
    },
    {
      key: "transactionType",
      label: "Гүйлгээ",
      type: "badge",
      badgeConfig: {
        BORROWED:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        LENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        labels: {
          BORROWED: "Авсан",
          LENT: "Өгсөн",
        },
      },
    },
    {
      key: "otherParty",
      label: "Харилцагч",
      sortable: true,
      render: (value, item) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {item.customer?.name || value || "-"}
          </span>
          {item.customer && (
            <div className="flex flex-col text-xs text-gray-500 mt-1">
              <span>РД: {item.customer.register}</span>
              <span>Утас: {item.customer.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      label: "Дүн",
      sortable: true,
      render: (value, item) => (
        <span
          className={`font-semibold ${
            item.type === "loan"
              ? item.transactionType === "BORROWED"
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
              : "text-blue-600 dark:text-blue-400"
          }`}
        >
          {item.type === "loan" && item.transactionType === "BORROWED" && ""}
          {item.type === "loan" && item.transactionType === "LENT" && ""}
          {item.type === "payment" && ""}
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
      key: "status",
      label: "Төлөв",
      render: (value, item) =>
        item.type === "loan" ? (
          <span
            className={`text-xs px-2 py-1 rounded ${
              value === "PAID"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                : value === "ACTIVE"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                : "bg-red-100 text-red-700 dark:bg-red-900/30"
            }`}
          >
            {value === "PAID"
              ? "Төлөгдсөн"
              : value === "ACTIVE"
              ? "Идэвхтэй"
              : "Хэтэрсэн"}
          </span>
        ) : (
          "-"
        ),
    },
  ];

  const headerStatistics: HeaderStatistic[] = [
    {
      label: "Нийт зээл",
      value: totalLoans.toString(),
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      label: "Нийт Төлөлт",
      value: totalPayments.toString(),
      icon: Calendar,
      color: "text-green-500",
    },
    {
      label: "Авсан зээл",
      value: `${totalBorrowed.toLocaleString()}₮`,
      icon: TrendingDown,
      color: "text-red-500",
    },
    {
      label: "Өгсөн зээл",
      value: `${totalLent.toLocaleString()}₮`,
      icon: TrendingUp,
      color: "text-green-500",
    },
  ];

  const filters: FilterType[] = [
    {
      key: "type",
      label: "Төрөл",
      type: "select",
      value: filterType,
      options: [
        { value: "all", label: "Бүгд" },
        { value: "loan", label: "Зээл" },
        { value: "payment", label: "Төлөлт" },
      ],
    },
    {
      key: "transaction",
      label: "Гүйлгээ",
      type: "select",
      value: filterTransaction,
      options: [
        { value: "all", label: "Бүгд" },
        { value: "BORROWED", label: "Авсан" },
        { value: "LENT", label: "Өгсөн" },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Буцах
        </button>
      </div>

      <GanaaDataTable
        data={paginatedItems}
        loading={loading}
        columns={columns}
        title="Зээлийн түүх"
        subtitle="Таны бүх зээл болон Төлөлтийн дэлгэрэнгүй түүх"
        headerIcon={History}
        headerStatistics={headerStatistics}
        searchPlaceholder="Харилцагч, регистр, утас, тайлбараар хайх..."
        onSearch={setSearchValue}
        searchValue={searchValue}
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "type") setFilterType(value);
          else if (key === "transaction") setFilterTransaction(value);
          setCurrentPage(1);
        }}
        onClearFilters={() => {
          setFilterType("all");
          setFilterTransaction("all");
          setSearchValue("");
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalCount={filteredItems.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onRefresh={fetchData}
        enableColumnVisibility
        enableMobileCards
      />
    </div>
  );
}
