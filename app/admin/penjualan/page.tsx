"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import Modal from "@/components/admin/Modal";
import { api, unwrap } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { Transaction, TransactionsResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

function formatRupiah(value: string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PAID: "bg-green-50 text-green-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-700",
};

type TabType = "Transaksi";
const TABS: TabType[] = ["Transaksi"];

export default function PenjualanPage() {
  const [dateFilter, setDateFilter] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detail, setDetail] = useState<Transaction | null>(null);

  const { data, loading, error, refetch } = useApiPath<{ data: TransactionsResponse }>("/api/admin/transactions", {
    page: 1,
    page_size: 50,
    ...(dateFilter ? { start_date: dateFilter, end_date: dateFilter } : {}),
  });
  const transactions = data?.data.transactions ?? [];

  const openDetail = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    try {
      const payload = await api<{ data: Transaction }>(`/api/admin/transactions/${transaction.transaction_id}`);
      setDetail(unwrap(payload));
    } catch {
      setDetail(transaction);
    }
  };

  const todayTotal = transactions
    .filter((trx) => trx.status === "PAID" || trx.status === "COMPLETED")
    .reduce((sum, trx) => sum + Number(trx.total_price), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Transaksi (filter)", value: transactions.length.toLocaleString("id-ID"), icon: "wallet" },
          { label: "Total Pendapatan (filter)", value: formatRupiah(String(todayTotal)), icon: "chart" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Icon name={stat.icon as never} className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-black">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 px-2 pt-2 gap-4">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                className="-mb-px border-b-2 border-black px-5 py-3 text-sm font-semibold text-black"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 px-3 pb-2 sm:pb-0">
            <span className="text-xs font-semibold text-gray-500">Filter Tanggal:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                refetch();
              }}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-black outline-none transition focus:border-black"
            />
          </div>
        </div>

        {loading && <p className="px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
        {error && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
                  <th className="px-5 py-3 whitespace-nowrap">ID Transaksi</th>
                  <th className="px-5 py-3 whitespace-nowrap">Customer</th>
                  <th className="px-5 py-3 whitespace-nowrap">Capster</th>
                  <th className="px-5 py-3 whitespace-nowrap">Waktu</th>
                  <th className="px-5 py-3 whitespace-nowrap">Durasi</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Pendapatan</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-6 text-sm text-gray-400">Belum ada transaksi.</td>
                  </tr>
                )}
                {transactions.map((trx) => (
                  <tr key={trx.transaction_id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-600 whitespace-nowrap">{trx.transaction_id}</td>
                    <td className="px-5 py-3 font-semibold text-black whitespace-nowrap">{trx.customer_id}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{trx.capster_id}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{trx.booking_date}</span>
                        <span className="text-xs text-gray-400">{trx.start_time}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{trx.total_duration_minutes} mnt</td>
                    <td className="px-5 py-3 text-right font-medium text-black whitespace-nowrap">{formatRupiah(trx.total_price)}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_BADGE[trx.status] ?? "bg-gray-50 text-gray-600")}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => openDetail(trx)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-50"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Detail Transaksi">
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">ID Transaksi</span>
              <span className="font-semibold text-black">{selectedTransaction.transaction_id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Customer</span>
              <span className="font-semibold text-black">{selectedTransaction.customer_id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Capster</span>
              <span className="font-semibold text-black">{selectedTransaction.capster_id}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Detail Layanan</span>
              {detail && detail.details.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {detail.details.map((item) => (
                    <span key={item.service_id} className="font-semibold text-black">
                      - {item.service_id} ({formatRupiah(item.price_at_booking)})
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-400">Tidak ada detail layanan.</span>
              )}
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Waktu</span>
              <span className="font-medium text-gray-600">{selectedTransaction.booking_date} • {selectedTransaction.start_time}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Total Durasi</span>
              <span className="font-medium text-gray-600">{selectedTransaction.total_duration_minutes} Menit</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Status</span>
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_BADGE[selectedTransaction.status] ?? "bg-gray-50 text-gray-600")}>
                {selectedTransaction.status}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Pendapatan</span>
              <span className="text-lg font-bold text-black">{formatRupiah(selectedTransaction.total_price)}</span>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedTransaction(null)} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Tutup</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
