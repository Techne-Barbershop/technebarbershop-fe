"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import SummaryCard from "@/components/admin/SummaryCard";
import TablePagination from "@/components/admin/TablePagination";
import DateFilterModal from "@/components/admin/DateFilterModal";
import { useApiPath } from "@/lib/useApi";
import { downloadCSV } from "@/lib/export";
import { formatPrice } from "@/lib/utils/format";
import type { PaymentAnalyticsResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

export default function PaymentsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const { data, loading, error } = useApiPath<{ data: PaymentAnalyticsResponse }>(
    "/api/admin/analytics/payments",
    {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    },
  );

  const response = data?.data;
  const summary = response?.summary;
  const allPayments = response?.payments ?? [];
  const total = allPayments.length;
  const payments = allPayments.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleExport = () => {
    if (!response) return;
    downloadCSV(
      "ringkasan-pembayaran.csv",
      [
        "Payment Name",
        "Total Transaksi",
        "Gross Payment",
        "Penggunaan Voucher",
        "Kembalian",
        "Net Payment",
      ],
      response.payments.map((payment) => [
        payment.payment_name,
        payment.total_transaksi,
        payment.gross_payment,
        payment.penggunaan_voucher,
        payment.kembalian,
        payment.net_payment,
      ]),
    );
  };

  const summaryRows = summary
    ? [
        { label: "Total Transaksi", value: summary.total_transaksi.toLocaleString("id-ID") },
        { label: "Pendapatan Kotor", value: formatPrice(Number(summary.pendapatan_kotor)) },
        { label: "Penggunaan Voucher", value: summary.penggunaan_voucher },
        { label: "Kembalian", value: formatPrice(Number(summary.kembalian)) },
        { label: "Total Pembayaran Net", value: formatPrice(Number(summary.total_pembayaran_net)) },
      ]
    : [];

  return (
    <div className="space-y-6 pb-24">

      <div className="flex flex-col space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-4">
            <h2 className="text-base font-bold text-black">Ringkasan Pembayaran</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500">Filter Tanggal:</span>
              <button
                onClick={() => setShowDateFilter(true)}
                className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-black transition hover:bg-gray-50"
              >
                <Icon name="calendar" className="h-4 w-4" />
                {startDate && endDate ? `${startDate} s/d ${endDate}` : (startDate || endDate || "Semua Waktu")}
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-black transition hover:bg-gray-50"
              >
                <Icon name="download" className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {loading && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
        {error && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-1">
              <SummaryCard rows={summaryRows} />
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white xl:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
                      <th className="px-5 py-3 whitespace-nowrap">Payment Name</th>
                      <th className="px-5 py-3 text-right whitespace-nowrap">Total Transaksi</th>
                      <th className="px-5 py-3 text-right whitespace-nowrap">Gross Payment</th>
                      <th className="px-5 py-3 text-right whitespace-nowrap">Penggunaan Voucher</th>
                      <th className="px-5 py-3 text-right whitespace-nowrap">Kembalian</th>
                      <th className="px-5 py-3 text-right whitespace-nowrap">Net Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-6 text-sm text-gray-400">
                          Tidak ada data pembayaran pada rentang ini.
                        </td>
                      </tr>
                    )}
                    {payments.map((payment, index) => (
                      <tr key={`${payment.payment_name}-${index}`} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3 font-semibold text-black whitespace-nowrap">{payment.payment_name}</td>
                        <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{payment.total_transaksi.toLocaleString("id-ID")}</td>
                        <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(Number(payment.gross_payment))}</td>
                        <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{payment.penggunaan_voucher}</td>
                        <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(Number(payment.kembalian))}</td>
                        <td className="px-5 py-3 text-right font-bold text-black whitespace-nowrap">{formatPrice(Number(payment.net_payment))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsPerPageChange={setRowsPerPage}
              />
            </div>
          </div>
        )}
      </div>

      <DateFilterModal
        isOpen={showDateFilter}
        onClose={() => setShowDateFilter(false)}
        onApply={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </div>
  );
}
