"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import SummaryCard from "@/components/admin/SummaryCard";
import TablePagination from "@/components/admin/TablePagination";
import AnalyticsDateFilter from "@/components/admin/AnalyticsDateFilter";
import { useApiPath } from "@/lib/useApi";
import { downloadCSV } from "@/lib/export";
import { formatPrice } from "@/lib/utils/format";
import type { PaymentAnalyticsResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PaymentsPage() {
  const [dateRange, setDateRange] = useState({ start: daysAgo(7), end: todayISO() });
  const [byPaymentDate, setByPaymentDate] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, loading, error } = useApiPath<{ data: PaymentAnalyticsResponse }>(
    "/api/admin/analytics/payments",
    {
      start_date: dateRange.start,
      end_date: dateRange.end,
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
        "Refunds",
        "Penggunaan Voucher",
        "Kembalian",
        "Net Payment",
      ],
      response.payments.map((payment) => [
        payment.payment_name,
        payment.total_transaksi,
        payment.gross_payment,
        payment.refunds,
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
        { label: "Total Pengembalian", value: formatPrice(Number(summary.total_pengembalian)) },
        { label: "Penggunaan Voucher", value: summary.penggunaan_voucher },
        { label: "Kembalian", value: formatPrice(Number(summary.kembalian)) },
        { label: "Total Pembayaran Net", value: formatPrice(Number(summary.total_pembayaran_net)) },
      ]
    : [];

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          aria-label="Kembali"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        >
          <Icon name="arrowLeft" className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-black">Ringkasan pembayaran</h1>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <AnalyticsDateFilter value={dateRange} onChange={setDateRange} />

          <button
            type="button"
            onClick={() => setByPaymentDate((v) => !v)}
            className="flex items-center gap-2"
            aria-pressed={byPaymentDate}
          >
            <span
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                byPaymentDate ? "bg-black" : "bg-gray-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
                  byPaymentDate ? "left-4.5" : "left-0.5",
                )}
              />
            </span>
            <span className="text-xs font-semibold text-gray-600">
              Berdasarkan tanggal pembayaran
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-50"
        >
          <Icon name="download" className="h-4 w-4" />
          Export
        </button>
      </div>

      {loading && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
      {error && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-1">
            <h2 className="mb-3 text-sm font-bold text-black">Ringkasan</h2>
            <SummaryCard rows={summaryRows} />
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white xl:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
                    <th className="px-5 py-3 whitespace-nowrap">Payment Name</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Total Transaksi</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Gross Payment</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Refunds</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Penggunaan Voucher</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Kembalian</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Net Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-6 text-sm text-gray-400">
                        Tidak ada data pembayaran pada rentang ini.
                      </td>
                    </tr>
                  )}
                  {payments.map((payment, index) => (
                    <tr key={`${payment.payment_name}-${index}`} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-semibold text-black whitespace-nowrap">{payment.payment_name}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{payment.total_transaksi.toLocaleString("id-ID")}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(Number(payment.gross_payment))}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(Number(payment.refunds))}</td>
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

      <Link
        href="/admin"
        aria-label="Menu"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition active:scale-95"
      >
        <Icon name="grid" className="h-6 w-6" />
      </Link>
    </div>
  );
}
