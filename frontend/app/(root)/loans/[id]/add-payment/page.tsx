"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  DollarSign,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";

interface Loan {
  id: number;
  amount: number;
  remainingAmount: number;
  description?: string;
  otherParty: string;
  type: "BORROWED" | "LENT";
  status: string;
}

export default function AddPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params.id;
  const [loading, setLoading] = useState(false);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });

  // Зээлийн мэдээлэл авах
  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const response = await axiosInstance.get(`/api/loans/${loanId}`);
        setLoan(response.data);
      } catch (err: any) {
        toast.error("Зээлийн мэдээлэл авахад алдаа гарлаа");
      }
    };

    fetchLoan();
  }, [loanId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Дүн оруулна уу!");
      return;
    }

    // Төлөх дүн үлдэгдэлээс хэтэрсэн эсэхийг шалгах
    if (loan && parseFloat(formData.amount) > loan.remainingAmount) {
      toast.error(
        `Төлөх дүн үлдэгдэл (${loan.remainingAmount.toLocaleString()}₮) - аас хэтэрч болохгүй!`
      );
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post(`/api/loans/${loanId}/payments`, {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      toast.success("Төлөлт амжилттай нэмэгдлээ!");
      router.push(`/loans/${loanId}/payments`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Төлөлт нэмэхэд алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Төлбөрийн дүн үлдэгдэлээс хэтэрсэн эсэхийг шалгах
  const isAmountExceeded = loan
    ? parseFloat(formData.amount) > loan.remainingAmount
    : false;

  // Хадгалах товчлуур идэвхгүй эсэхийг шалгах
  const isSubmitDisabled =
    loading ||
    !formData.amount ||
    parseFloat(formData.amount) <= 0 ||
    isAmountExceeded;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Буцах
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Төлөлт нэмэх
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Зээлийн төлөлтийн мэдээллийг оруулна уу
          </p>
        </div>

        {/* Зээлийн мэдээлэл харуулах хэсэг */}
        {loan && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Нийт дүн
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {loan.amount.toLocaleString()}₮
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Зээлийн үлдэгдэл
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {loan.remainingAmount.toLocaleString()}₮
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Төлөлтийн явц</span>
                <span className="font-semibold">
                  {(
                    ((loan.amount - loan.remainingAmount) / loan.amount) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(
                      ((loan.amount - loan.remainingAmount) / loan.amount) *
                      100
                    ).toFixed(1)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm"
        >
          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Төлөх дүн <span className="text-red-500">*</span>
              </div>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              step="0.01"
              min="0.01"
              max={loan?.remainingAmount}
              required
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Төлөх дүнгээ оруулна уу
              </p>
              {loan && (
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Максимум: {loan.remainingAmount.toLocaleString()}₮
                </p>
              )}
            </div>
            {isAmountExceeded && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
                Төлөх дүн үлдэгдэлээс хэтэрсэн байна!
              </p>
            )}
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Төлөлтийн огноо
              </div>
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) =>
                setFormData({ ...formData, paymentDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Төлөлт хийгдсэн огноо
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Тайлбар
              </div>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors duration-200"
              placeholder="Төлөлтийн тайлбар (заавал биш)..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Төлөлтийн нэмэлт тайлбар (заавал биш)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Save className="w-4 h-4" />
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
