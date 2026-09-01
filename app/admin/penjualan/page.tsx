"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/icons";
import Modal from "@/components/admin/Modal";
import DateFilterModal from "@/components/admin/DateFilterModal";
import ItemSalesView from "@/components/admin/ItemSalesView";
import { api, unwrap } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { Transaction, TransactionsResponse, ItemSalesResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";
import { addMinutes } from "@/lib/utils/format";

interface ProductSale {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: string;
  payment_method: string;
  payment_status: string;
  cashier_id: string;
  cashier_name: string;
  sale_date: string;
}

function formatRupiah(value: string | number): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString);

  return `${date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}, ${date.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return `${date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })}`;
}

function getPaginationArray(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PAID: "bg-green-50 text-green-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-700",
};

type TabType = "Ringkasan Penjualan" | "Transaksi (Layanan)" | "Transaksi per Service (Layanan)" | "Penjualan Produk";
const TABS: TabType[] = ["Ringkasan Penjualan", "Transaksi (Layanan)", "Transaksi per Service (Layanan)", "Penjualan Produk"];

export default function PenjualanPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Ringkasan Penjualan");
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detail, setDetail] = useState<Transaction | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data, loading, error, refetch } = useApiPath<{ data: TransactionsResponse }>("/api/admin/transactions", {
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    ...(startDate ? { start_date: startDate } : {}),
    ...(endDate ? { end_date: endDate } : {}),
  });

  const transactions = data?.data.transactions ?? [];
  const transactionsSummary = data?.data.summary;

  const { data: productSalesData } = useApiPath<{ data: { sales: ProductSale[], summary?: any } }>("/api/admin/product-sales", {
    page: currentProductPage,
    page_size: ITEMS_PER_PAGE,
    ...(startDate ? { start_date: startDate } : {}),
    ...(endDate ? { end_date: endDate } : {}),
  });
  const productSales = productSalesData?.data.sales ?? [];
  const productSummary = productSalesData?.data.summary;

  const totalProductQty = productSummary?.total_products_sold || 0;
  const totalProductRevenue = productSummary?.total_revenue || "0";
  const totalProductPages = Math.ceil((productSummary?.total_items || 0) / ITEMS_PER_PAGE);

  const openDetail = async (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    try {
      const payload = await api<{ data: Transaction }>(`/api/admin/transactions/${transaction.transaction_id}`);
      setDetail(unwrap(payload));
    } catch {
      setDetail(transaction);
    }
  };

  const { data: itemSalesData } = useApiPath<{ data: ItemSalesResponse }>("/api/admin/analytics/item-sales", {
    ...(startDate ? { start_date: startDate } : {}),
    ...(endDate ? { end_date: endDate } : {}),
  });

  // Calculate from service transactions only for "Transaksi" and "Transaksi per Service" tabs
  const totalServiceTransactionsCount = transactionsSummary?.total_successful || 0;
  const totalServiceRevenue = transactionsSummary?.total_revenue || "0";
  const totalPages = Math.ceil((transactionsSummary?.total_items || 0) / ITEMS_PER_PAGE);

  // Flatten transactions per service (only for the current paginated parent transactions)
  const paginatedFlattenedTransactions = useMemo(() => {
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
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
              setCurrentServicePage(1);
              setCurrentProductPage(1);
            }}
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
        <ItemSalesView startDate={startDate} endDate={endDate} onOpenDateFilter={() => setShowDateFilter(true)} />
      )}

      {["Transaksi (Layanan)", "Transaksi per Service (Layanan)"].includes(activeTab) && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Transaksi Berhasil (filter)", value: totalServiceTransactionsCount.toLocaleString("id-ID"), icon: "wallet" },
              { label: "Total Pendapatan (filter)", value: formatRupiah(totalServiceRevenue), icon: "dollar" },
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
              <div className="flex flex-col">
                {activeTab === "Transaksi (Layanan)" ? (
                  <>
                    <div className="overflow-x-auto pb-4">
                      <table className="w-full min-w-[1000px] text-sm">
                        <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-bold uppercase text-gray-500">
                        <th className="px-5 py-3 whitespace-nowrap">ID Transaksi</th>
                        <th className="px-5 py-3 whitespace-nowrap">Waktu Transaksi</th>
                        <th className="px-5 py-3 whitespace-nowrap">Customer</th>
                        <th className="px-5 py-3 whitespace-nowrap">Capster</th>
                        <th className="px-5 py-3 whitespace-nowrap">Layanan</th>
                        <th className="px-5 py-3 whitespace-nowrap">Jadwal Reservasi</th>
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
                          <td className="px-5 py-3 font-medium text-gray-600 whitespace-nowrap">{formatDateTime(trx.created_at)}</td>
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
                              <span className="text-xs text-gray-400">{trx.start_time} - {addMinutes(trx.start_time, trx.total_duration_minutes || 0)}</span>
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
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                      <span className="text-sm text-gray-500">
                        Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)} dari {transactions.length}
                      </span>
                      <div className="flex items-center gap-1">
                        {getPaginationArray(currentPage, totalPages).map((pageNumber, idx) => (
                          <button
                            key={idx}
                            onClick={() => typeof pageNumber === "number" && setCurrentPage(pageNumber)}
                            disabled={typeof pageNumber !== "number"}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition",
                              currentPage === pageNumber
                                ? "bg-black text-white"
                                : typeof pageNumber === "number"
                                ? "text-gray-500 hover:bg-gray-100"
                                : "text-gray-400 cursor-default"
                            )}
                          >
                            {pageNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  </>
                ) : (
                  <>
                    <div className="overflow-x-auto pb-4">
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
                      {paginatedFlattenedTransactions.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-5 py-6 text-center text-sm text-gray-400">Belum ada rincian transaksi per layanan.</td>
                        </tr>
                      )}
                      {paginatedFlattenedTransactions.map((item, index) => (
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
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                      <span className="text-sm text-gray-500">
                        Menampilkan halaman {currentPage} dari total {totalPages} halaman
                      </span>
                      <div className="flex items-center gap-1">
                        {getPaginationArray(currentPage, totalPages).map((pageNumber, idx) => (
                          <button
                            key={idx}
                            onClick={() => typeof pageNumber === "number" && setCurrentPage(pageNumber)}
                            disabled={typeof pageNumber !== "number"}
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition",
                              currentPage === pageNumber
                                ? "bg-black text-white"
                                : typeof pageNumber === "number"
                                ? "text-gray-500 hover:bg-gray-100"
                                : "text-gray-400 cursor-default"
                            )}
                          >
                            {pageNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "Penjualan Produk" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Produk Terjual (filter)", value: totalProductQty.toLocaleString("id-ID"), icon: "box" },
              { label: "Total Pendapatan Produk (filter)", value: formatRupiah(totalProductRevenue), icon: "dollar" },
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
              <h2 className="text-base font-bold text-black">Penjualan Produk</h2>
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
          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-bold uppercase text-gray-500">
                  <th className="px-5 py-3 whitespace-nowrap">ID</th>
                  <th className="px-5 py-3 whitespace-nowrap">Waktu Transaksi</th>
                  <th className="px-5 py-3 whitespace-nowrap">Produk</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Qty</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Total</th>
                  <th className="px-5 py-3 whitespace-nowrap">Kasir</th>
                  <th className="px-5 py-3 whitespace-nowrap">Metode</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productSales.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-6 text-center text-sm text-gray-400">Belum ada penjualan produk.</td>
                  </tr>
                )}
                {productSales.map((sale) => (
                  <tr key={sale.id} className="transition hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-600 whitespace-nowrap">{sale.id}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{formatDateTime(sale.sale_date)}</td>
                    <td className="px-5 py-3 font-semibold text-black whitespace-nowrap">{sale.product_name}</td>
                    <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{sale.quantity}</td>
                    <td className="px-5 py-3 text-right font-bold text-black whitespace-nowrap">{formatRupiah(sale.total_price)}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{sale.cashier_name}</td>
                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{sale.payment_method}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", sale.payment_status === "SETTLEMENT" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700")}>
                        {sale.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalProductPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <span className="text-sm text-gray-500">
                Menampilkan halaman {currentProductPage} dari total {totalProductPages} halaman
              </span>
              <div className="flex items-center gap-1">
                {getPaginationArray(currentProductPage, totalProductPages).map((pageNumber, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof pageNumber === "number" && setCurrentProductPage(pageNumber)}
                    disabled={typeof pageNumber !== "number"}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition",
                      currentProductPage === pageNumber
                        ? "bg-black text-white"
                        : typeof pageNumber === "number"
                        ? "text-gray-500 hover:bg-gray-100"
                        : "text-gray-400 cursor-default"
                    )}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
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
          setCurrentPage(1);
          setCurrentServicePage(1);
          setCurrentProductPage(1);
        }}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </div>
  );
}
