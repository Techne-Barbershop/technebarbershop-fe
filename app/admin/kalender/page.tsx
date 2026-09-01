"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { useApiPath } from "@/lib/useApi";
import type { CashierReservation, CashierReservationsResponse, WorkerReservationStatus } from "@/lib/types/admin";
import { formatDuration, formatPrice } from "@/lib/utils/format";
import { SecondaryButton } from "@/components/Buttons";

const HOUR_HEIGHT = 140;
const HOUR_COUNT = 12;

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMinutesSince10(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  return Math.max(0, (hh - 10) * 60 + mm);
}

const STATUS_LABELS: Record<WorkerReservationStatus, string> = {
  BOOKED: "Booked",
  PENDING_PAYMENT: "Pending Payment",
  COMPLETED: "Completed",
  CANCELLED: "Canceled",
};

const isWalkIn = (res: CashierReservation) =>
  res.customer_id === "CUS-WALKIN" || res.customer_name === "WALK IN" || res.notes === "WALK IN";

export default function KalenderPage() {
  const [calendarMode, setCalendarMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
  const [selectedRes, setSelectedRes] = useState<CashierReservation | null>(null);

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

  // Fetch from cashier API to get full capsters and details
  const { data, loading, error } = useApiPath<{ data: CashierReservationsResponse }>(
    "/api/cashier/reservations",
    { start_date: rangeStart, end_date: rangeEnd },
  );

  const reservations = useMemo(() => data?.data.reservations ?? [], [data]);
  const paid = (res: CashierReservation) => res.payment_status === "SETTLEMENT";

  const getDisplayStatus = (res: CashierReservation) => {
    if (res.reservation_status === "CANCELLED") return "CANCELLED";
    if (res.reservation_status === "COMPLETED") return "COMPLETED";
    if (isWalkIn(res)) return "WALK IN";
    return "BOOKED";
  };

  const { data: staffData } = useApiPath<{ data: { staff: any[] } }>("/api/admin/staff");

  const workerColumns = useMemo(() => {
    if (staffData?.data?.staff) {
      return staffData.data.staff
        .filter((s: any) => s.role === "CAPSTER")
        .map((s: any) => ({ id: s.user_id, name: s.name }));
    }
    const seen = new Map<string, string>();
    for (const res of reservations) {
      if (!seen.has(res.capster_id)) seen.set(res.capster_id, res.capster_name);
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [reservations, staffData]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(toISODate(d));
  };

  return (
    <div className="flex flex-col pb-20">
      <div className="sticky top-16 z-40 border border-gray-200 bg-white px-5 py-4 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => changeDate(calendarMode === "week" ? -7 : -1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95">
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm font-semibold text-black outline-none" />
            <button onClick={() => changeDate(calendarMode === "week" ? 7 : 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95">
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1">
            <button
              onClick={() => setCalendarMode("day")}
              className={cn("rounded-md px-3 py-1.5 text-[12px] font-bold transition", calendarMode === "day" ? "bg-white text-black shadow-sm" : "text-gray-500")}
            >
              Per Hari
            </button>
            <button
              onClick={() => setCalendarMode("week")}
              className={cn("rounded-md px-3 py-1.5 text-[12px] font-bold transition", calendarMode === "week" ? "bg-white text-black shadow-sm" : "text-gray-500")}
            >
              Per Minggu
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="mt-4 flex justify-center py-16 text-center text-gray-400"><p className="text-sm">Memuat data...</p></div>}
      {error && <div className="mt-4 flex justify-center py-16 text-center"><p className="text-sm text-red-500">{error}</p></div>}

      {!loading && !error && (
        <div className="mt-4">
          <div className="overflow-x-auto overflow-y-auto no-scrollbar max-h-[calc(100vh-220px)] border border-gray-200 rounded-lg">
            {/* Week view needs much more width to fit 7 days * N capsters */}
            <div className={cn(calendarMode === "week" ? "min-w-[1600px]" : "min-w-[840px]")}>
              <div className="sticky top-0 z-30 flex border-b border-gray-200 bg-white shadow-sm">
                <div className="sticky left-0 z-40 w-14 shrink-0 bg-white border-r border-gray-100" />
                {(calendarMode === "week" ? weekDates : [selectedDate]).map((colDate) => {
                  const d = new Date(colDate);
                  const isToday = colDate === toISODate(new Date());
                  return (
                    <div key={colDate} className="flex flex-1 flex-col border-l border-gray-200">
                      {calendarMode === "week" && (
                        <div className="border-b border-gray-200 bg-gray-50/50 py-2 text-center">
                          <div className="text-[11px] font-semibold uppercase text-gray-500">
                            {d.toLocaleDateString("id-ID", { weekday: "short" })}
                          </div>
                          <div className={cn("mt-1 text-[15px] font-bold", isToday ? "text-black" : "text-gray-600")}>
                            {d.getDate()}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-1">
                        {workerColumns.map((worker) => (
                          <div key={worker.id} className="flex-1 border-r border-gray-100 last:border-0 px-1 py-2 text-center min-w-[70px]">
                            <div className="truncate text-[10px] font-bold text-gray-600">{worker.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative flex pt-2">
                <div className="sticky left-0 z-20 w-14 shrink-0 bg-white border-r border-gray-100">
                  {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                    <div key={i} className="relative pr-2 text-right text-[10px] font-semibold text-gray-500" style={{ height: HOUR_HEIGHT }}>
                      <span className="relative -top-2">{10 + i}:00</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-1">
                  {(calendarMode === "week" ? weekDates : [selectedDate]).map((colDate) => (
                    <div key={colDate} className="flex flex-1 border-l border-gray-200 relative">
                      {/* Grid Lines */}
                      <div className="pointer-events-none absolute inset-0">
                        {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                          <div key={i} className="absolute w-full border-t border-gray-200" style={{ top: i * HOUR_HEIGHT }}>
                            <div className="absolute w-full border-t border-dashed border-gray-200 opacity-40" style={{ top: HOUR_HEIGHT / 2 }} />
                          </div>
                        ))}
                      </div>

                      {/* Capster Columns for the Day */}
                      <div className="flex flex-1 relative" style={{ height: (HOUR_COUNT - 1) * HOUR_HEIGHT }}>
                        {workerColumns.map((worker) => {
                          const blocks = reservations.filter((r) => r.capster_id === worker.id && r.booking_date === colDate);
                          return (
                            <div key={worker.id} className="relative flex-1 border-r border-gray-100 last:border-0">
                              {blocks.map((res) => {
                                const top = (getMinutesSince10(res.start_time) / 60) * HOUR_HEIGHT;
                                const displayDuration = Math.max(res.duration_minutes, 15);
                                const height = (displayDuration / 60) * HOUR_HEIGHT;
                                const isPaid = paid(res);
                                const displayStatus = getDisplayStatus(res);
                                
                                return (
                                  <button key={res.reservation_id} onClick={() => setSelectedRes(res)} className={cn("absolute right-0.5 left-0.5 overflow-hidden rounded-md border p-1 text-left transition hover:z-10 active:scale-[0.98]", 
                                    displayStatus === "BOOKED" && "border-black-200 bg-blue-50 text-blue-900 hover:bg-blue-100", 
                                    displayStatus === "WALK IN" && "border-black-200 bg-green-50 text-green-900 hover:bg-green-100", 
                                    displayStatus === "COMPLETED" && "border-white bg-black text-white hover:bg-gray-900", 
                                    displayStatus === "CANCELLED" && "border-black-200 bg-red-50 text-red-500 opacity-60 line-through hover:bg-red-100"
                                  )} style={{ top, height }}>
                                    <div className="truncate text-[10px] font-bold leading-tight">
                                      {res.customer_name}
                                    </div>
                                    {height >= 40 && <div className="mt-0.5 truncate text-[9px] font-medium opacity-80 leading-tight">{res.start_time}</div>}
                                    {height >= 54 && <div className={cn("mt-1 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-[8px] font-bold uppercase", (isPaid && displayStatus === "COMPLETED") ? "bg-white/20 text-white" : "border border-current opacity-70")}>{isPaid ? "Lunas" : "Belum"}</div>}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 px-5 text-[11px] font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-black-200 bg-blue-50" /> Booked</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm border border-black-200 bg-green-50" /> Walk In</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-black" /> Selesai</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-white opacity-60" /> Canceled</span>
          </div>
        </div>
      )}

      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedRes(null)} />
          <div className="relative flex max-h-[85dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-6 pb-6">
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-[22px] font-bold text-black">Reservation Detail</h2>
                  <div className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", selectedRes.reservation_status === "BOOKED" && "bg-gray-100 text-black", selectedRes.reservation_status === "COMPLETED" && "bg-black text-white", selectedRes.reservation_status === "CANCELLED" && "border border-gray-200 text-gray-400")}>
                    {STATUS_LABELS[selectedRes.reservation_status]}
                  </div>
                </div>
                <div className="mt-6 space-y-5 border-t border-gray-200 pt-5">
                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Customer</div>
                    <div className="text-[15px] font-semibold text-black">{selectedRes.customer_name}</div>
                    <div className="mt-0.5 flex gap-3 text-sm text-gray-500"><span className="flex items-center gap-1"><Icon name="phone" className="h-3.5 w-3.5" /> {selectedRes.customer_phone || "-"}</span></div>
                    <div className="mt-0.5 flex gap-3 text-sm text-gray-500"><span className="flex items-center gap-1"><Icon name="mail" className="h-3.5 w-3.5" /> {selectedRes.customer_email || "-"}</span></div>
                  </div>
                  <div><div className="mb-1 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Worker</div><div className="text-[15px] font-semibold text-black">{selectedRes.capster_name}</div></div>
                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Time & Date</div>
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-black"><Icon name="clock" className="h-4 w-4" />{selectedRes.start_time} ({formatDuration(selectedRes.duration_minutes)})</div>
                    <div className="ml-6 mt-0.5 text-sm text-gray-500">{new Date(selectedRes.booking_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                  <div><div className="mb-1 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Service</div><div className="text-[15px] font-semibold text-black">{selectedRes.service_names || "-"}</div><div className="ml-6 mt-0.5 text-sm text-gray-500">{formatPrice(Number(selectedRes.service_total || 0))}</div></div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div><div className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Payment</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-black"><Icon name={paid(selectedRes) ? "check" : "close"} className={cn("h-4 w-4", paid(selectedRes) ? "text-black" : "text-gray-300")} />{paid(selectedRes) ? `Lunas (${selectedRes.payment_method || "CASH"})` : "Belum Bayar"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="z-10 shrink-0 bg-white px-6 pt-4 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col gap-2.5">
                <SecondaryButton onClick={() => setSelectedRes(null)}>Close</SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
