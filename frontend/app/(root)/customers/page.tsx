// app/(root)/customers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Users,
  Edit,
  Trash2,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import GanaaDataTable from "@/components/datatable/GanaaDataTable";
import { Column, Action, HeaderStatistic } from "@/types/table.types";
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

interface Customer {
  id: number;
  name: string;
  register?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    loans: number;
  };
}

interface DialogState {
  isOpen: boolean;
  customer: Customer | null;
  title: string;
  description: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    customer: null,
    title: "",
    description: "",
  });

  useEffect(() => {
    if (!hasValidTokens()) {
      router.replace("/");
      return;
    }
    fetchCustomers();
  }, [router]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/customers");
      setCustomers(response.data);
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

  const handleCreateCustomer = () => router.push("/customers/create");

  const handleEditCustomer = (customer: Customer) =>
    router.push(`/customers/${customer.id}/edit`);

  const handleViewStats = (customer: Customer) =>
    router.push(`/customers/${customer.id}/stats`);

  const handleDeleteCustomer = (customer: Customer) => {
    setDialog({
      isOpen: true,
      customer,
      title: "Харилцагч устгах",
      description: `"${
        customer.name
      }" харилцагчийг устгахдаа итгэлтэй байна уу? ${
        customer._count && customer._count.loans > 0
          ? "Анхаар: Энэ харилцагчтай холбоотой зээл байгаа тул устгах боломжгүй."
          : "Энэ үйлдлийг буцаах боломжгүй."
      }`,
    });
  };

  const confirmDelete = async () => {
    if (!dialog.customer) return;

    try {
      await axiosInstance.delete(`/api/customers/${dialog.customer.id}`);
      toast.success("Харилцагч амжилттай устгагдлаа");
      await fetchCustomers();
    } catch (err: any) {
      toast.error(
        err.response?.data?.error ||
          "Алдаа гарлаа. Зээлтэй холбоотой харилцагч устгах боломжгүй."
      );
    } finally {
      setDialog({ ...dialog, isOpen: false });
    }
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.register?.toLowerCase().includes(searchValue.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchValue.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns: Column[] = [
    {
      key: "name",
      label: "Нэр",
      sortable: true,
      render: (value, item) => (
        <div className="flex flex-col">
          <span className="font-semibold">{value}</span>
          {item.register && (
            <span className="text-xs text-gray-500">{item.register}</span>
          )}
        </div>
      ),
    },
    {
      key: "phone",
      label: "Утас",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      key: "_count",
      label: "Зээлийн тоо",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold ${
              value?.loans > 0 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {value?.loans || 0}
          </span>
          {value?.loans > 0 && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
              Идэвхтэй
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Бүртгэсэн огноо",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("mn-MN"),
    },
  ];

  const actions: Action[] = [
    {
      title: "Статистик харах",
      icon: BarChart3,
      onClick: handleViewStats,
      className: "text-blue-600 hover:text-blue-700",
    },
    {
      title: "Засах",
      icon: Edit,
      onClick: handleEditCustomer,
    },
    {
      title: "Устгах",
      icon: Trash2,
      onClick: handleDeleteCustomer,
      className: "text-red-600 hover:text-red-700",
      disabled: (customer) =>
        customer._count ? customer._count.loans > 0 : false,
    },
  ];

  const totalCustomers = customers.length;
  const customersWithLoans = customers.filter(
    (c) => c._count && c._count.loans > 0
  ).length;
  const totalLoans = customers.reduce(
    (sum, c) => sum + (c._count?.loans || 0),
    0
  );

  const headerStatistics: HeaderStatistic[] = [
    {
      label: "Нийт харилцагч",
      value: totalCustomers.toString(),
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Зээлтэй харилцагч",
      value: customersWithLoans.toString(),
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: "Нийт зээл",
      value: totalLoans.toString(),
      icon: BarChart3,
      color: "text-purple-500",
    },
  ];

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <GanaaDataTable
          data={paginatedCustomers}
          loading={loading}
          columns={columns}
          title="Харилцагчийн удирдлага"
          subtitle="Таны бүртгэсэн харилцагчдын жагсаалт"
          headerIcon={Users}
          headerStatistics={headerStatistics}
          primaryAction={{
            label: "Шинэ харилцагч",
            icon: PlusCircle,
            onClick: handleCreateCustomer,
            variant: "default",
            className: "bg-blue-600 text-white hover:bg-blue-500",
          }}
          actions={actions}
          searchPlaceholder="Нэр, регистр, утасаар хайх..."
          onSearch={setSearchValue}
          searchValue={searchValue}
          onClearFilters={() => {
            setSearchValue("");
            setCurrentPage(1);
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={filteredCustomers.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          selectable
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onRefresh={fetchCustomers}
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
              onClick={confirmDelete}
              disabled={
                dialog.customer?._count
                  ? dialog.customer._count.loans > 0
                  : false
              }
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Устгах
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
