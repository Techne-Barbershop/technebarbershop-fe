"use client";

import { Icon } from "@/components/icons";
import { useApiPath } from "@/lib/useApi";
import type { DashboardStats } from "@/lib/types/admin";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import type { Reservation } from "@/lib/types/admin";

function formatRupiah(value: string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

const STATUS_LABELS: Record<string, string> = {
  BOOKED: "Terjadwal",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export default function BerandaPage() {
  const { data: statsData, loading, error } = useApiPath<{ data: DashboardStats }>("/api/admin/dashboard");
  const [transactions, setTransactions] = useState<{ transaction_id: string; customer_id: string; booking_date: string; total_price: string; start_time: string }[]>([]);
  const [bookings, setBookings] = useState<Reservation[]>([]);

  const stats = statsData?.data;

  useEffect(() => {
    const today = todayISO();
    api<{ data: { transactions: { transaction_id: string; customer_id: string; booking_date: string; total_price: string; start_time: string }[] } }>("/api/admin/transactions", { query: { start_date: today, end_date: today, page: 1, page_size: 5 } })
      .then((p) => setTransactions(p.data.transactions))
      .catch(() => setTransactions([]));
    api<{ data: { reservations: Reservation[] } }>("/api/admin/reservations", { query: { start_date: today, end_date: today } })
      .then((p) => setBookings(p.data.reservations))
      .catch(() => setBookings([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Pelanggan", value: stats ? stats.total_customers.toLocaleString("id-ID") : "0", icon: "users" },
          { label: "Penjualan Bulan Ini", value: stats ? formatRupiah(stats.revenue_month) : "Rp 0", icon: "chart" },
          { label: "Kunjungan Hari Ini", value: stats ? stats.visits_today.toLocaleString("id-ID") : "0", icon: "calendar" },
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
        <div className="rounded-lg border border-gray-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-black">Penjualan Mingguan</h2>
            <span className="text-xs text-gray-400">Sen - Min</span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2">
            {[42, 58, 47, 72, 65, 88, 54, 76, 61, 82, 68, 90].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t bg-gray-300" style={{ height: `${height}%` }} />
                <span className="text-[10px] text-gray-400">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-bold text-black">Booking Terbaru</h2>
          <div className="mt-4 flex flex-col divide-y divide-gray-100">
            {bookings.length === 0 && <p className="py-3 text-sm text-gray-400">Belum ada booking hari ini.</p>}
            {bookings.map((booking) => (
              <div key={booking.reservation_id} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                  {booking.customer_id.slice(-4)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-black">{booking.reservation_id}</div>
                  <div className="truncate text-xs text-gray-500">
                    {booking.capster_id} · {booking.start_time}
                  </div>
                </div>
                <span className="rounded-full border border-gray-400 px-2.5 py-1 text-[10px] font-medium text-gray-600">
                  {STATUS_LABELS[booking.status] ?? booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-bold text-black">Transaksi Hari Ini</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Jam</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-3 text-sm text-gray-400">Belum ada transaksi hari ini.</td>
                </tr>
              )}
              {transactions.map((transaction) => (
                <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-600">{transaction.transaction_id}</td>
                  <td className="px-5 py-3 font-semibold text-black">{transaction.customer_id}</td>
                  <td className="px-5 py-3 text-gray-600">{transaction.start_time}</td>
                  <td className="px-5 py-3 text-right font-semibold text-black">{formatRupiah(transaction.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
