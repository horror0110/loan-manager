// app/(root)/customers/[id]/stats/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  User,
  Phone,
  CreditCard,
} from "lucide-react";
import axiosInstance from "@/lib/axios";

interface CustomerStats {
  customer: {
    id: number;
    name: string;
    register?: string;
    phone?: string;
  };
  borrowed: {
    count: number;
    totalAmount: number;
    remaining: number;
  };
  lent: {
    count: number;
    totalAmount: number;
    remaining: number;
  };
  netBalance: number;
}

export default function CustomerStatsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CustomerStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, [customerId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/customers/${customerId}/stats`
      );
      setStats(response.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Статистик татахад алдаа гарлаа");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("mn-MN", {
      style: "currency",
      currency: "MNT",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Уншиж байна...
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const borrowedPaid = stats.borrowed.totalAmount - stats.borrowed.remaining;
  const lentPaid = stats.lent.totalAmount - stats.lent.remaining;
  const borrowedProgress =
    stats.borrowed.totalAmount > 0
      ? (borrowedPaid / stats.borrowed.totalAmount) * 100
      : 0;
  const lentProgress =
    stats.lent.totalAmount > 0 ? (lentPaid / stats.lent.totalAmount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Буцах
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {stats.customer.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Харилцагчийн статистик мэдээлэл
              </p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Харилцагчийн мэдээлэл
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Нэр</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {stats.customer.name}
                </p>
              </div>
            </div>
            {stats.customer.register && (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Регистр
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stats.customer.register}
                  </p>
                </div>
              </div>
            )}
            {stats.customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Утас
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stats.customer.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                Авсан зээл
              </span>
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
              {formatMoney(stats.borrowed.remaining)}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {stats.borrowed.count} зээл
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                Өгсөн зээл
              </span>
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatMoney(stats.lent.remaining)}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {stats.lent.count} зээл
            </p>
          </div>

          <div
            className={`rounded-lg p-6 border-2 ${
              stats.netBalance > 0
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : stats.netBalance < 0
                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${
                  stats.netBalance > 0
                    ? "text-green-600 dark:text-green-400"
                    : stats.netBalance < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Цэвэр үлдэгдэл
              </span>
              <DollarSign
                className={`w-5 h-5 ${
                  stats.netBalance > 0
                    ? "text-green-600 dark:text-green-400"
                    : stats.netBalance < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              />
            </div>
            <p
              className={`text-2xl font-bold ${
                stats.netBalance > 0
                  ? "text-green-700 dark:text-green-300"
                  : stats.netBalance < 0
                  ? "text-red-700 dark:text-red-300"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {formatMoney(Math.abs(stats.netBalance))}
            </p>
            <p
              className={`text-sm mt-1 ${
                stats.netBalance > 0
                  ? "text-green-600 dark:text-green-400"
                  : stats.netBalance < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {stats.netBalance > 0
                ? "Надад өгөх"
                : stats.netBalance < 0
                ? "Би өгөх"
                : "Тэнцүү"}
            </p>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Borrowed Loans */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Авсан зээл
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Дэлгэрэнгүй мэдээлэл
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Нийт зээл
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatMoney(stats.borrowed.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Төлсөн
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatMoney(borrowedPaid)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Үлдэгдэл
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatMoney(stats.borrowed.remaining)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Төлөлтийн явц
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {borrowedProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{ width: `${borrowedProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Нийт зээл
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.borrowed.count}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lent Loans */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Өгсөн зээл
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Дэлгэрэнгүй мэдээлэл
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Нийт зээл
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatMoney(stats.lent.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Төлсөн
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatMoney(lentPaid)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Үлдэгдэл
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatMoney(stats.lent.remaining)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Төлөлтийн явц
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {lentProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${lentProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Нийт зээл
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.lent.count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Нийт дүгнэлт
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Нийт зээл
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.borrowed.count + stats.lent.count}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Нийт дүн
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatMoney(
                  stats.borrowed.totalAmount + stats.lent.totalAmount
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
