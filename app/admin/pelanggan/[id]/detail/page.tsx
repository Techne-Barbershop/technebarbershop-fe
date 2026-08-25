"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Icon } from "@/components/icons";
import DateFilterModal from "@/components/admin/DateFilterModal";
import Avatar from "@/components/admin/Avatar";
import { formatPrice } from "@/lib/utils/format";
import { addMinutes } from "@/lib/utils/format";

interface Customer {
  customer_id: string;
  name: string;
  phone: string;
  email: string;
}

interface Stats {
  total_completed: number;
  total_spending: string;
}

interface Pagination {
  total_items: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

interface Reservation {
  reservation_id: string;
  capster_name: string;
  service_names: string;
  booking_date: string;
  start_time: string;
  duration_minutes: number;
  status: string;
}

interface CustomerPerformanceResponse {
  customer: Customer;
  stats: Stats;
  reservations: Reservation[];
  pagination: Pagination;
}

const STATUS_LABELS: Record<string, string> = {
  BOOKED: "BOOKED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  PENDING_PAYMENT: "PENDING",
};

const STATUS_COLORS: Record<string, string> = {
  BOOKED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
};

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const [data, setData] = useState<CustomerPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPerformance = async () => {
    setLoading(true);
    setError("");
    try {
      const query: Record<string, string | number> = { page };
      if (startDate) query.start_date = startDate;
      if (endDate) query.end_date = endDate;

      const res = await api<{ data: CustomerPerformanceResponse }>(`/api/admin/customer/${id}/performance`, {
        query
      });

      setData(res.data);
    } catch (err: any) {
      if (err.status === 401) {
        router.push("/admin/login");
        return;
      }
      setError(err.message || "Gagal memuat performa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPerformance();
    }
  }, [id, startDate, endDate, page]);

  const handleApplyDate = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPage(1); // reset to page 1 on filter change
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <Icon name="arrowLeft" className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-black">Detail Pelanggan</h1>
            <p className="text-sm text-gray-500">Lihat statistik reservasi dan total belanja pelanggan ini.</p>
          </div>
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-black transition hover:bg-gray-50"
        >
          <Icon name="calendar" className="h-4 w-4" />
          {startDate && endDate ? `${startDate} - ${endDate}` : "Semua Waktu"}
        </button>
      </div>

      <DateFilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyDate}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />

      {loading ? (
        <p className="text-sm text-gray-400">Memuat data...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : data ? (
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex items-center gap-5 rounded-lg border border-gray-200 bg-white p-5">
            <Avatar name={data.customer.name} size="lg" className="h-16 w-16 text-xl" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-black">{data.customer.name}</h2>
              <p className="text-sm font-semibold text-gray-500 uppercase">Customer</p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><Icon name="phone" className="h-4 w-4 text-gray-400" /> {data.customer.phone || "-"}</span>
                <span className="flex items-center gap-1.5"><Icon name="mail" className="h-4 w-4 text-gray-400" /> {data.customer.email || "-"}</span>
              </div>
            </div>
          </div>

          {/* Stat Card */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Reservasi Berhasil</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Icon name="check" className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-black">{data.stats.total_completed.toLocaleString("id-ID")}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Belanja</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Icon name="dollar" className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-black">{formatPrice(Number(data.stats.total_spending))}</div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-black">Daftar Reservasi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                    <th className="px-5 py-3 font-semibold">ID Reservasi</th>
                    <th className="px-5 py-3 font-semibold">Capster</th>
                    <th className="px-5 py-3 font-semibold">Layanan</th>
                    <th className="px-5 py-3 font-semibold">Jadwal Booking</th>
                    <th className="px-5 py-3 font-semibold">Durasi</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.reservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                        Belum ada reservasi untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    data.reservations.map((res) => (
                      <tr key={res.reservation_id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-600">
                          {res.reservation_id}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-black">{res.capster_name || "-"}</p>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-800">
                          {res.service_names || "-"}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-black">{res.booking_date}</p>
                          <p className="text-xs text-gray-500">{res.start_time} - {addMinutes(res.start_time, res.duration_minutes)}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {res.duration_minutes} Menit
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium ${STATUS_COLORS[res.status] || "bg-gray-100 text-gray-700"}`}>
                            {STATUS_LABELS[res.status] || res.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {data.pagination.total_pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
                <p className="text-xs font-medium text-gray-500">
                  Menampilkan {(data.pagination.current_page - 1) * data.pagination.per_page + 1} -{" "}
                  {Math.min(data.pagination.current_page * data.pagination.per_page, data.pagination.total_items)} dari {data.pagination.total_items} data
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Icon name="chevronLeft" className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: data.pagination.total_pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                          p === page
                            ? "bg-black text-white"
                            : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === data.pagination.total_pages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Icon name="chevronRight" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
