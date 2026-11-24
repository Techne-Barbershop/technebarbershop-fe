"use client";

import { Icon } from "@/components/icons";
import { useApiPath } from "@/lib/useApi";
import type { DashboardStats, Reservation } from "@/lib/types/admin";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { addMinutes, formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "@/lib/utils/format";

function formatRupiah(value: string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
}

function localISODate(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

function todayISO(): string {
  const d = new Date();
  return localISODate(d);
}

function formatDateTime(dateString: string) {
  return formatDateTimeDDMMYYYY(new Date(dateString));
}

function formatDate(dateString: string) {
  return formatDateDDMMYYYY(new Date(dateString));
}

const STATUS_LABELS: Record<string, string> = {
  BOOKED: "BOOKED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

interface MergedTransaction {
  id: string;
  title: string;
  subtitle: string;
  total_price: string;
  date: string;
  status: string;
  is_product: boolean;
}

export default function CashierBerandaPage() {
  const { data: statsData, loading, error } = useApiPath<{ data: DashboardStats }>("/api/admin/dashboard");
  const [transactions, setTransactions] = useState<MergedTransaction[]>([]);
  const [bookings, setBookings] = useState<Reservation[]>([]);

  const stats = statsData?.data;

  useEffect(() => {
    const today = todayISO();
    const d = new Date();
    d.setDate(d.getDate() - 6);
    const startDate = localISODate(d);

    Promise.all([
      api<{ data: { transactions: any[] } }>("/api/admin/transactions", {
        query: { start_date: startDate, end_date: today, page: 1, page_size: 1000 },
      }),
      api<{ data: { sales: any[] } }>("/api/admin/product-sales", {
        query: { start_date: startDate, end_date: today },
      }),
    ])
      .then(([txRes, psRes]) => {
        const txs = txRes.data.transactions || [];
        const pss = psRes.data.sales || [];
        const merged: MergedTransaction[] = [];

        for (const tx of txs) {
          merged.push({
            id: tx.transaction_id,
            title: tx.customer_name || tx.customer_id,
            subtitle: "Jasa/Layanan",
            total_price: tx.total_price,
            date: tx.updated_at,
            status: tx.status,
            is_product: false,
          });
        }

        for (const ps of pss) {
          merged.push({
            id: ps.id,
            title: ps.product_name,
            subtitle: "Produk",
            total_price: ps.total_price,
            date: ps.sale_date,
            status: ps.payment_status === "SETTLEMENT" ? "PAID" : ps.payment_status,
            is_product: true,
          });
        }

        merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(merged);
      })
      .catch(() => {
        setTransactions([]);
      });

    api<{ data: { reservations: Reservation[] } }>("/api/admin/reservations", {
      query: { start_date: today, end_date: today },
    })
      .then((p) => setBookings(p.data?.reservations || []))
      .catch(() => setBookings([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Pelanggan", value: stats ? stats.total_customers.toLocaleString("id-ID") : "0", icon: "users" },
          { label: "Kunjungan Hari Ini", value: stats ? stats.reservations_today.toLocaleString("id-ID") : "0", icon: "calendar" },
          { label: "Staf Aktif", value: stats ? stats.active_staff.toLocaleString("id-ID") : "0", icon: "user" },
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

      {loading && <p className="text-sm text-gray-400">Memuat data...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-base font-bold text-black">Reservasi Hari Ini - {formatDate(todayISO())}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                  <th className="px-5 py-3 font-semibold">ID Reservasi</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Capster</th>
                  <th className="px-5 py-3 font-semibold">Jam Reservasi</th>
                  <th className="px-5 py-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-3 text-sm text-gray-400">Belum ada reservasi hari ini.</td>
                  </tr>
                )}
                {bookings.map((booking) => (
                  <tr key={booking.reservation_id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-600">{booking.reservation_id}</td>
                    <td className="px-5 py-3 font-semibold text-black">{booking.customer_name || booking.customer_id}</td>
                    <td className="px-5 py-3 font-semibold text-black">{booking.capster_name || booking.capster_id}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {booking.start_time} - {addMinutes(booking.start_time, booking.duration_minutes || 0)}
                    </td>
                    <td className="px-5 py-3 text-center font-semibold text-black">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium ${
                          booking.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "BOOKED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-bold text-black">5 Transaksi Terbaru</h2>
          <div className="mt-4 flex flex-col divide-y divide-gray-100">
            {transactions.length === 0 && <p className="py-3 text-sm text-gray-400">Belum ada transaksi.</p>}
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600 uppercase">
                  {transaction.is_product ? "P" : transaction.title ? transaction.title.charAt(0) : "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-black">
                    {transaction.title} · {formatRupiah(transaction.total_price)}
                  </div>
                  <div className="truncate text-xs text-gray-500">{transaction.subtitle}</div>
                  <div className="truncate text-xs text-gray-500">{formatDateTime(transaction.date)}</div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                    transaction.status === "PAID" ||
                    transaction.status === "COMPLETED" ||
                    transaction.status === "SETTLEMENT"
                      ? "bg-green-100 text-green-700"
                      : transaction.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {STATUS_LABELS[transaction.status] ?? transaction.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

