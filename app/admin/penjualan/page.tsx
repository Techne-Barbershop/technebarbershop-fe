"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/icons";
import Modal from "@/components/admin/Modal";
import DateFilterModal from "@/components/admin/DateFilterModal";
import ItemSalesView from "@/components/admin/ItemSalesView";
import { api, unwrap } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { Transaction, TransactionsResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

function formatRupiah(value: string | number): string {
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

type TabType = "Ringkasan Penjualan" | "Transaksi" | "Transaksi per Service";
const TABS: TabType[] = ["Ringkasan Penjualan", "Transaksi", "Transaksi per Service"];

export default function PenjualanPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Ringkasan Penjualan");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detail, setDetail] = useState<Transaction | null>(null);

  const { data, loading, error, refetch } = useApiPath<{ data: TransactionsResponse }>("/api/admin/transactions", {
    page: 1,
    page_size: 1000, // fetch all for flattening on frontend
    ...(startDate ? { start_date: startDate } : {}),
    ...(endDate ? { end_date: endDate } : {}),
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

  // Flatten transactions per service
  const flattenedTransactions = useMemo(() => {
    const flat: Array<{
      trx: Transaction;
      service_id: string;
      service_name: string;
      price: string;
    }> = [];
    for (const trx of transactions) {
      for (const d of trx.details) {
        flat.push({
          trx,
          service_id: d.service_id,
          service_name: d.service_name,
          price: d.price_at_booking,
        });
      }
    }
    return flat;
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
              activeTab === tab ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Ringkasan Penjualan" && (
        <ItemSalesView />
      )}

      {activeTab !== "Ringkasan Penjualan" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Transaksi (filter)", value: transactions.length.toLocaleString("id-ID"), icon: "wallet" },
              { label: "Total Pendapatan (filter)", value: formatRupiah(todayTotal), icon: "chart" },
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 px-4 py-3 gap-4">
              <h2 className="text-base font-bold text-black">{activeTab}</h2>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500">Filter Tanggal:</span>
                <button
                  onClick={() => setShowDateFilter(true)}
                  className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-black transition hover:bg-gray-50"
                >
                  <Icon name="calendar" className="h-4 w-4" />
                  {startDate && endDate ? `${startDate} s/d ${endDate}` : (startDate || endDate || "Semua Waktu")}
                </button>
              </div>
            </div>

            {loading && <p className="px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
            {error && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto pb-4">
                {activeTab === "Transaksi" ? (
                  <table className="w-full min-w-[1000px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-bold uppercase text-gray-500">
                        <th className="px-5 py-3 whitespace-nowrap">ID Transaksi</th>
                        <th className="px-5 py-3 whitespace-nowrap">Customer</th>
                        <th className="px-5 py-3 whitespace-nowrap">Capster</th>
                        <th className="px-5 py-3 whitespace-nowrap">Layanan</th>
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
                          <td colSpan={9} className="px-5 py-6 text-center text-sm text-gray-400">Belum ada transaksi.</td>
                        </tr>
                      )}
                      {transactions.map((trx) => (
                        <tr key={trx.transaction_id} className="transition hover:bg-gray-50/50">
                          <td className="px-5 py-3 font-medium text-gray-600 whitespace-nowrap">{trx.transaction_id}</td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-semibold text-black">{trx.customer_name}</span>
                              <span className="text-xs text-gray-400">{trx.customer_phone}</span>
                              <span className="text-xs text-gray-400">{trx.customer_email}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{trx.capster_name}</td>
                          <td className="px-5 py-3 text-gray-600 max-w-[240px]">
                            <span className="truncate">{trx.details.map((d) => d.service_name).join(", ") || "-"}</span>
                          </td>
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
                ) : (
                  <table className="w-full min-w-[1000px] text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-bold uppercase text-gray-500">
                        <th className="px-5 py-3 whitespace-nowrap">ID Transaksi</th>
                        <th className="px-5 py-3 whitespace-nowrap">Customer</th>
                        <th className="px-5 py-3 whitespace-nowrap">Capster</th>
                        <th className="px-5 py-3 whitespace-nowrap">Layanan (Per Item)</th>
                        <th className="px-5 py-3 whitespace-nowrap">Waktu</th>
                        <th className="px-5 py-3 text-right whitespace-nowrap">Harga</th>
                        <th className="px-5 py-3 whitespace-nowrap">Status</th>
                        <th className="px-5 py-3 text-center whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {flattenedTransactions.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-5 py-6 text-center text-sm text-gray-400">Belum ada rincian transaksi per layanan.</td>
                        </tr>
                      )}
                      {flattenedTransactions.map((item, index) => (
                        <tr key={`${item.trx.transaction_id}-${item.service_id}-${index}`} className="transition hover:bg-gray-50/50">
                          <td className="px-5 py-3 font-medium text-gray-600 whitespace-nowrap">{item.trx.transaction_id}</td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-semibold text-black">{item.trx.customer_name}</span>
                              <span className="text-xs text-gray-400">{item.trx.customer_phone}</span>
                              <span className="text-xs text-gray-400">{item.trx.customer_email}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{item.trx.capster_name}</td>
                          <td className="px-5 py-3 font-semibold text-black max-w-[240px]">
                            <span className="truncate">{item.service_name}</span>
                          </td>
                          <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span>{item.trx.booking_date}</span>
                              <span className="text-xs text-gray-400">{item.trx.start_time}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-black whitespace-nowrap">{formatRupiah(item.price)}</td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_BADGE[item.trx.status] ?? "bg-gray-50 text-gray-600")}>
                              {item.trx.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => openDetail(item.trx)}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-50"
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <Modal isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} title="Detail Transaksi">
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">ID Transaksi</span>
              <span className="font-semibold text-black">{selectedTransaction.transaction_id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Customer</span>
              <div className="text-right">
                <div className="font-semibold text-black">{selectedTransaction.customer_name}</div>
                <div className="text-xs text-gray-400">{selectedTransaction.customer_phone} • {selectedTransaction.customer_email}</div>
                <div className="text-[10px] text-gray-300">ID: {selectedTransaction.customer_id}</div>
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Capster</span>
              <div className="text-right">
                <div className="font-semibold text-black">{selectedTransaction.capster_name}</div>
                <div className="text-[10px] text-gray-300">ID: {selectedTransaction.capster_id}</div>
              </div>
            </div>
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Detail Layanan</span>
              {detail && detail.details.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {detail.details.map((item) => (
                    <span key={item.service_id} className="font-semibold text-black">
                      - {item.service_name} ({formatRupiah(item.price_at_booking)})
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

      <DateFilterModal
        isOpen={showDateFilter}
        onClose={() => setShowDateFilter(false)}
        onApply={(start, end) => {
          setStartDate(start);
          setEndDate(end);
          refetch();
        }}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </div>
  );
}
