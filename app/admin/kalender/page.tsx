"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import Modal from "@/components/admin/Modal";
import { api } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { Reservation, ReservationsResponse, StaffResponse } from "@/lib/types/admin";
import { formatDuration } from "@/lib/utils/format";

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMinutesSince10(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  return (hh - 10) * 60 + mm;
}

const STATUS_STYLE: Record<string, string> = {
  BOOKED: "bg-gray-100 border-black/20 text-black",
  COMPLETED: "bg-black border-black text-white",
  CANCELLED: "bg-white border-gray-300 text-gray-400 opacity-70 line-through",
};

export default function KalenderPage() {
  const [calendarMode, setCalendarMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [updating, setUpdating] = useState(false);

  const { data: staffData } = useApiPath<{ data: StaffResponse }>("/api/admin/staff");
  const staff = staffData?.data.staff ?? [];
  const selectedWorker = selectedWorkerId || staff[0]?.user_id || "";

  const handleWorkerChange = (value: string) => setSelectedWorkerId(value);

  const startOfWeek = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [selectedDate]);

  const weekDates = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return toISODate(d);
    }),
    [startOfWeek],
  );

  const rangeStart = calendarMode === "day" ? selectedDate : weekDates[0];
  const rangeEnd = calendarMode === "day" ? selectedDate : weekDates[6];

  const { data: reservationsData, loading, error, refetch } = useApiPath<{ data: ReservationsResponse }>(
    "/api/admin/reservations",
    { start_date: rangeStart, end_date: rangeEnd, worker_id: selectedWorker || undefined },
  );
  const reservations = reservationsData?.data.reservations ?? [];

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(toISODate(d));
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedRes) return;
    setUpdating(true);
    try {
      await api(`/api/admin/reservations/${selectedRes.reservation_id}`, {
        method: "PATCH",
        body: { status },
      });
      setSelectedRes(null);
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setUpdating(false);
    }
  };

  const HOUR_HEIGHT = 80;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="worker-filter" className="text-sm font-bold text-black">
            Pilih Staf:
          </label>
          <select
            id="worker-filter"
            value={selectedWorker}
            onChange={(e) => handleWorkerChange(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
          >
            {staff.length === 0 && <option value="">Belum ada staf</option>}
            {staff.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(calendarMode === "week" ? -7 : -1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 active:scale-95"
            >
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-black outline-none transition focus:border-black"
            />
            <button
              onClick={() => changeDate(calendarMode === "week" ? 7 : 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 active:scale-95"
            >
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center rounded-lg border border-gray-300 bg-gray-100 p-1">
            <button
              onClick={() => setCalendarMode("day")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold transition",
                calendarMode === "day" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black",
              )}
            >
              Per Hari
            </button>
            <button
              onClick={() => setCalendarMode("week")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold transition",
                calendarMode === "week" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black",
              )}
            >
              Per Minggu
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-400">Memuat data...</p>}
      {error && <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-red-500">{error}</p>}

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="relative flex overflow-x-auto p-5 no-scrollbar">
          <div className="min-w-[600px] flex-1">
            {calendarMode === "week" && (
              <div className="ml-14 mb-2 flex border-b border-gray-200 pb-2">
                {weekDates.map((date) => {
                  const d = new Date(date);
                  const isToday = date === toISODate(new Date());
                  return (
                    <div key={date} className="flex-1 text-center">
                      <div className="text-[11px] font-semibold uppercase text-gray-500">
                        {d.toLocaleDateString("id-ID", { weekday: "short" })}
                      </div>
                      <div className={cn("mt-1 text-[15px] font-bold", isToday ? "text-black" : "text-gray-600")}>
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="relative flex">
              <div className="flex w-14 shrink-0 flex-col border-r border-gray-200">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="relative pr-2 text-right text-[11px] font-semibold text-gray-400" style={{ height: HOUR_HEIGHT }}>
                    <span className="relative -top-2.5">{10 + i}:00</span>
                  </div>
                ))}
              </div>

              <div className="pointer-events-none absolute inset-0 ml-14">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-gray-200" style={{ top: i * HOUR_HEIGHT }}>
                    <div className="absolute w-full border-t border-dashed border-gray-200 opacity-50" style={{ top: HOUR_HEIGHT / 2 }} />
                  </div>
                ))}
              </div>

              <div className={cn("relative flex-1", calendarMode === "week" ? "flex" : "ml-2 block")}>
                {(calendarMode === "week" ? weekDates : [selectedDate]).map((colDate) => (
                  <div
                    key={colDate}
                    className="relative flex-1 border-r border-gray-200/30 last:border-0"
                    style={{ height: 11 * HOUR_HEIGHT }}
                  >
                    {reservations
                      .filter((res) => res.booking_date === colDate)
                      .map((res) => {
                        const top = (getMinutesSince10(res.start_time) / 60) * HOUR_HEIGHT;
                        const height = (res.duration_minutes / 60) * HOUR_HEIGHT;
                        return (
                          <div
                            key={res.reservation_id}
                            onClick={() => setSelectedRes(res)}
                            className={cn(
                              "absolute inset-x-1 cursor-pointer overflow-hidden rounded-md border p-2 text-left transition active:scale-[0.98]",
                              STATUS_STYLE[res.status] ?? "bg-gray-100 border-black/20 text-black",
                            )}
                            style={{ top, height }}
                          >
                            <div className="truncate text-[11px] font-bold">{res.customer_id}</div>
                            {height >= 40 && (
                              <div className="mt-0.5 truncate text-[10px] font-medium opacity-80">
                                {res.start_time} • {res.service_ids?.length || 0} layanan
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!selectedRes} onClose={() => setSelectedRes(null)} title="Detail Reservasi">
        {selectedRes && (
          <div className="space-y-5">
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">ID Reservasi</div>
              <div className="text-[15px] font-semibold text-black">{selectedRes.reservation_id}</div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">Waktu & Tanggal</div>
              <div className="flex items-center gap-2 text-[15px] font-semibold text-black">
                <Icon name="clock" className="h-4 w-4" />
                {selectedRes.start_time} ({formatDuration(selectedRes.duration_minutes)})
              </div>
              <div className="ml-6 mt-0.5 text-[13px] text-gray-600">
                {new Date(selectedRes.booking_date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">Customer</div>
              <div className="text-[15px] font-semibold text-black">{selectedRes.customer_name || selectedRes.customer_id}</div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">Capster</div>
              <div className="text-[15px] font-semibold text-black">{selectedRes.capster_name || selectedRes.capster_id}</div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">Layanan</div>
              <div className="text-[15px] font-semibold text-black">{selectedRes.service_names || `${selectedRes.service_ids?.length || 0} layanan`}</div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">Status</div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                    selectedRes.status === "BOOKED" && "bg-gray-100 text-black",
                    selectedRes.status === "COMPLETED" && "bg-black text-white",
                    selectedRes.status === "CANCELLED" && "border border-gray-300 text-gray-500",
                  )}
                >
                  {selectedRes.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["BOOKED", "COMPLETED", "CANCELLED"]
                  .filter((status) => status !== selectedRes.status)
                  .map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={updating}
                      onClick={() => handleStatusChange(status)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Ubah ke {status}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
