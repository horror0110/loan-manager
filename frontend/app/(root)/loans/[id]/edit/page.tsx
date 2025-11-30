"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  DollarSign,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import axiosInstance from "@/lib/axios";

export default function EditLoanPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: "BORROWED",
    amount: "",
    otherParty: "",
    description: "",
    loanDate: "",
    dueDate: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    fetchLoan();
  }, [loanId]);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/loans/${loanId}`);
      const loan = response.data;
      setFormData({
        type: loan.type,
        amount: loan.amount.toString(),
        otherParty: loan.otherParty,
        description: loan.description || "",
        loanDate: loan.loanDate
          ? new Date(loan.loanDate).toISOString().split("T")[0]
          : "",
        dueDate: loan.dueDate
          ? new Date(loan.dueDate).toISOString().split("T")[0]
          : "",
        status: loan.status,
      });
    } catch (err: any) {
      alert(err.response?.data?.error || "Зээл татахад алдаа гарлаа");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.otherParty) {
      alert("Дүн, харилцагч заавал бөглөнө үү!");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.put(`/api/loans/${loanId}`, {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.error || "Зээл шинэчлэхэд алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Буцах
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Зээл засах
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Зээлийн мэдээллийг шинэчлэх
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="space-y-6">
            {/* Type (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Төрөл
              </label>
              <div
                className={`p-4 rounded-lg border-2 ${
                  formData.type === "BORROWED"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-green-500 bg-green-50 dark:bg-green-900/20"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {formData.type === "BORROWED" ? "💸" : "💰"}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formData.type === "BORROWED" ? "Авсан" : "Өгсөн"}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Төлөв
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="ACTIVE">Идэвхтэй</option>
                <option value="PAID">Төлөгдсөн</option>
                <option value="OVERDUE">Хугацаа хэтэрсэн</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Дүн <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Other Party */}
            <div>
              <label
                htmlFor="otherParty"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Харилцагч <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                id="otherParty"
                name="otherParty"
                value={formData.otherParty}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Loan Date */}
            <div>
              <label
                htmlFor="loanDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Зээлийн огноо
                </div>
              </label>
              <input
                type="date"
                id="loanDate"
                name="loanDate"
                value={formData.loanDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Төлөх огноо
                </div>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Тайлбар
                </div>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
