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
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Payment {
  id: number;
  amount: number;
  description?: string;
  paymentDate: string;
  createdAt: string;
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
  loanDate: string;
  dueDate?: string;
  status: "ACTIVE" | "PAID" | "OVERDUE";
  type: "BORROWED" | "LENT";
  otherParty: string;
  customerId?: number | null;
  customer?: Customer | null;
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

interface DialogState {
  isOpen: boolean;
  type: "delete" | "markPaid" | null;
  loan: Loan | null;
  title: string;
  description: string;
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
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: null,
    loan: null,
    title: "",
    description: "",
  });

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
      if (err.response?.status === 401) {
        router.replace("/");
        toast.error("Нэвтрэх эрх дууссан байна");
      } else {
        toast.error("Өгөгдөл авахад алдаа гарлаа");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoan = () => router.push("/loans/create");

  const handleEditLoan = (loan: Loan) => router.push(`/loans/${loan.id}/edit`);

  const handleViewPayments = (loan: Loan) =>
    router.push(`/loans/${loan.id}/payments`);

  const handleDeleteLoan = (loan: Loan) => {
    const partyName = loan.customer?.name || loan.otherParty;
    setDialog({
      isOpen: true,
      type: "delete",
      loan,
      title: "Зээл устгах",
      description: `"${partyName}" - ${loan.amount.toLocaleString()}₮ зээлийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.`,
    });
  };

  const handleMarkAsPaid = (loan: Loan) => {
    const partyName = loan.customer?.name || loan.otherParty;
    setDialog({
      isOpen: true,
      type: "markPaid",
      loan,
      title: "Зээл төлөгдсөн болгох",
      description: `"${partyName}" - ${loan.remainingAmount.toLocaleString()}₮ үлдэгдлийг бүтэн төлөгдсөн болгох уу?`,
    });
  };

  const handleAddPayment = (loan: Loan) => {
    router.push(`/loans/${loan.id}/add-payment`);
  };

  const confirmAction = async () => {
    if (!dialog.loan) return;

    try {
      if (dialog.type === "delete") {
        await axiosInstance.delete(`/api/loans/${dialog.loan.id}`);
        toast.success("Зээл амжилттай устгагдлаа");
      } else if (dialog.type === "markPaid") {
        await axiosInstance.patch(`/api/loans/${dialog.loan.id}/paid`);
        toast.success("Зээл амжилттай төлөгдсөн боллоо");
      }

      await fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Алдаа гарлаа");
    } finally {
      setDialog({ ...dialog, isOpen: false });
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  const filteredLoans = loans.filter((loan) => {
    const customerName = loan.customer?.name || "";
    const customerRegister = loan.customer?.register || "";
    const customerPhone = loan.customer?.phone || "";

    const matchesSearch =
      loan.otherParty.toLowerCase().includes(searchValue.toLowerCase()) ||
      customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
      customerRegister.toLowerCase().includes(searchValue.toLowerCase()) ||
      customerPhone.toLowerCase().includes(searchValue.toLowerCase()) ||
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
      render: (value) =>
        value ? new Date(value).toLocaleDateString("mn-MN") : "-",
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
    <>
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
            className: "bg-blue-600 text-white hover:bg-blue-500",
          }}
          actions={actions}
          searchPlaceholder="Харилцагч, регистр, утас, тайлбараар хайх..."
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

      <AlertDialog open={dialog.isOpen} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Цуцлах</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                dialog.type === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {dialog.type === "delete" ? "Устгах" : "Төлсөн болгох"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
