"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { WorkerReservation, WorkerReservationsResponse, WorkerReservationStatus } from "@/lib/types/admin";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { formatDuration, formatPrice } from "@/lib/utils/format";

const TABS: { id: WorkerReservationStatus; label: string }[] = [
  { id: "BOOKED", label: "Booked" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Canceled" },
];

const STATUS_LABELS: Record<WorkerReservationStatus, string> = {
  BOOKED: "Booked",
  COMPLETED: "Completed",
  CANCELLED: "Canceled",
};

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

export default function WorkerDashboardPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMode, setCalendarMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
  const [activeTab, setActiveTab] = useState<WorkerReservationStatus>("BOOKED");
  const [selectedRes, setSelectedRes] = useState<WorkerReservation | null>(null);
  const [updating, setUpdating] = useState(false);

  const startOfWeek = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [selectedDate]);

  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return toISODate(d);
      }),
    [startOfWeek],
  );

  const rangeStart = viewMode === "calendar" && calendarMode === "week" ? weekDates[0] : selectedDate;
  const rangeEnd = viewMode === "calendar" && calendarMode === "week" ? weekDates[6] : selectedDate;

  const { data, loading, error, refetch } = useApiPath<{ data: WorkerReservationsResponse }>(
    "/api/worker/reservations",
    { start_date: rangeStart, end_date: rangeEnd },
  );
  const reservations = useMemo(
    () => data?.data.reservations ?? [],
    [data],
  );

  const filteredList = useMemo(
    () => reservations.filter((res) => res.booking_date === selectedDate && res.status === activeTab),
    [reservations, selectedDate, activeTab],
  );

  const calendarReservations = useMemo(() => {
    if (calendarMode === "day") {
      return reservations.filter((res) => res.booking_date === selectedDate);
    }
    return reservations.filter((res) => weekDates.includes(res.booking_date));
  }, [reservations, selectedDate, calendarMode, weekDates]);

  const handleStatusChange = async (id: string, newStatus: WorkerReservationStatus) => {
    setUpdating(true);
    try {
      await api(`/api/worker/reservations/${id}`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      setSelectedRes(null);
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setUpdating(false);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(toISODate(d));
  };

  const HOUR_HEIGHT = 80;

  return (
    <div className="flex flex-col pb-20">
      <div className="sticky top-16 z-40 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-bold text-ink">My Schedule</h1>

          <div className="flex items-center rounded-lg border border-line bg-mist p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                viewMode === "list" ? "bg-paper shadow-sm text-ink" : "text-graphite",
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                viewMode === "calendar" ? "bg-paper shadow-sm text-ink" : "text-graphite",
              )}
            >
              Calendar
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(viewMode === "calendar" && calendarMode === "week" ? -7 : -1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:bg-mist active:scale-95"
            >
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 rounded-lg border border-line bg-paper px-2 text-[13px] font-semibold text-ink outline-none"
            />
            <button
              onClick={() => changeDate(viewMode === "calendar" && calendarMode === "week" ? 7 : 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:bg-mist active:scale-95"
            >
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>

          {viewMode === "calendar" && (
            <div className="flex items-center rounded-lg border border-line bg-mist p-1">
              <button
                onClick={() => setCalendarMode("day")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-bold transition",
                  calendarMode === "day" ? "bg-paper shadow-sm text-ink" : "text-graphite",
                )}
              >
                Day
              </button>
              <button
                onClick={() => setCalendarMode("week")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-bold transition",
                  calendarMode === "week" ? "bg-paper shadow-sm text-ink" : "text-graphite",
                )}
              >
                Week
              </button>
            </div>
          )}
        </div>

        {viewMode === "list" && (
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex h-9 items-center justify-center whitespace-nowrap rounded-full px-5 text-[13px] font-semibold transition active:scale-95",
                    isActive ? "bg-ink text-paper" : "border border-line bg-paper text-ink hover:bg-mist",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {loading && (
        <div className="mt-4 flex justify-center py-16 text-center text-graphite">
          <p className="text-[14px]">Memuat jadwal...</p>
        </div>
      )}
      {error && (
        <div className="mt-4 flex justify-center py-16 text-center">
          <div className="flex flex-col items-center gap-3">
            <p className="text-[14px] text-red-500">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="rounded-lg border border-line bg-paper px-4 py-2 text-[13px] font-bold text-ink transition hover:bg-mist"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {!loading && !error && viewMode === "list" && (
        <div className="mt-4 flex flex-col gap-4 px-5">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-graphite">
              <Icon name="clock" className="mb-4 h-12 w-12 opacity-20" />
              <p className="text-[14px]">No {TABS.find((t) => t.id === activeTab)?.label.toLowerCase()} reservations found.</p>
            </div>
          ) : (
            filteredList.map((res) => (
              <div key={res.reservation_id} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold text-ink">{res.customer_name}</h3>
                    <p className="text-[13px] font-medium text-graphite">
                      {res.start_time} • {res.service_names}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                      res.status === "BOOKED" && "bg-mist text-ink",
                      res.status === "COMPLETED" && "bg-ink text-paper",
                      res.status === "CANCELLED" && "border border-line text-smoke",
                    )}
                  >
                    {STATUS_LABELS[res.status]}
                  </div>
                </div>

                <div className="mt-2 flex gap-2 border-t border-line/50 pt-4">
                  <SecondaryButton className="flex-1" onClick={() => setSelectedRes(res)}>
                    View Detail
                  </SecondaryButton>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!loading && !error && viewMode === "calendar" && (
        <div className="relative mt-4 flex overflow-x-auto px-5 no-scrollbar">
          <div className="min-w-[600px] flex-1 pb-10 pt-4">
            {calendarMode === "week" && (
              <div className="flex ml-14 mb-2 border-b border-line pb-2">
                {weekDates.map((date) => {
                  const d = new Date(date);
                  const isToday = date === toISODate(new Date());
                  return (
                    <div key={date} className="flex-1 text-center">
                      <div className="text-[11px] text-graphite font-semibold uppercase">
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div className={cn("text-[15px] font-bold mt-1", isToday ? "text-ink" : "text-graphite")}>
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="relative flex">
              <div className="w-14 shrink-0 flex flex-col border-r border-line">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="relative text-[11px] font-semibold text-graphite pr-2 text-right" style={{ height: HOUR_HEIGHT }}>
                    <span className="relative -top-2.5">{10 + i}:00</span>
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 ml-14 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-line" style={{ top: i * HOUR_HEIGHT }}>
                    <div className="absolute w-full border-t border-line border-dashed opacity-50" style={{ top: HOUR_HEIGHT / 2 }} />
                  </div>
                ))}
              </div>

              <div className={cn("relative flex-1", calendarMode === "week" ? "flex" : "block ml-2")}>
                {(calendarMode === "week" ? weekDates : [selectedDate]).map((colDate) => (
                  <div key={colDate} className="relative flex-1 border-r border-line/30 last:border-0" style={{ height: 11 * HOUR_HEIGHT }}>
                    {calendarReservations
                      .filter((res) => res.booking_date === colDate)
                      .map((res) => {
                        const top = (getMinutesSince10(res.start_time) / 60) * HOUR_HEIGHT;
                        const height = (res.duration_minutes / 60) * HOUR_HEIGHT;
                        return (
                          <div
                            key={res.reservation_id}
                            onClick={() => setSelectedRes(res)}
                            className={cn(
                              "absolute inset-x-1 rounded-md p-2 text-left transition active:scale-[0.98] cursor-pointer overflow-hidden border",
                              res.status === "BOOKED" && "bg-mist border-ink/20 text-ink",
                              res.status === "COMPLETED" && "bg-ink border-ink text-paper",
                              res.status === "CANCELLED" && "bg-paper border-line text-smoke opacity-70 line-through",
                            )}
                            style={{ top, height }}
                          >
                            <div className="text-[11px] font-bold truncate">{res.customer_name}</div>
                            {height >= 40 && (
                              <div className="text-[10px] font-medium opacity-80 mt-0.5 truncate">
                                {res.start_time} • {res.service_names}
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
      )}

      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="animate-fade-in absolute inset-0 bg-black/50" onClick={() => setSelectedRes(null)} />
          <div className="animate-fade-in relative flex max-h-[85dvh] w-full max-w-sm flex-col rounded-3xl bg-paper shadow-xl overflow-hidden">
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-6 pb-6">
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[22px] font-bold text-ink">Reservation Detail</h2>
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                      selectedRes.status === "BOOKED" && "bg-mist text-ink",
                      selectedRes.status === "COMPLETED" && "bg-ink text-paper",
                      selectedRes.status === "CANCELLED" && "border border-line text-smoke",
                    )}
                  >
                    {STATUS_LABELS[selectedRes.status]}
                  </div>
                </div>

                <div className="mt-6 space-y-5 border-t border-line pt-5">
                  <div>
                    <div className="text-[11px] font-bold tracking-widest text-graphite uppercase mb-1">Customer</div>
                    <div className="text-[15px] font-semibold text-ink">{selectedRes.customer_name}</div>
                    <div className="text-[13px] text-graphite mt-0.5 flex gap-3">
                      <span className="flex items-center gap-1">
                        <Icon name="phone" className="w-3.5 h-3.5" /> {selectedRes.customer_phone}
                      </span>
                    </div>
                    <div className="text-[13px] text-graphite mt-0.5 flex gap-3">
                      <span className="flex items-center gap-1">
                        <Icon name="mail" className="w-3.5 h-3.5" /> {selectedRes.customer_email}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold tracking-widest text-graphite uppercase mb-1">Time & Date</div>
                    <div className="text-[15px] font-semibold text-ink flex items-center gap-2">
                      <Icon name="clock" className="w-4 h-4" />
                      {selectedRes.start_time} ({formatDuration(selectedRes.duration_minutes)})
                    </div>
                    <div className="text-[13px] text-graphite mt-0.5 ml-6">
                      {new Date(selectedRes.booking_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold tracking-widest text-graphite uppercase mb-1">Service</div>
                    <div className="text-[15px] font-semibold text-ink">{selectedRes.service_names}</div>
                    <div className="text-[13px] text-graphite mt-0.5 ml-6">{formatPrice(Number(selectedRes.service_total))}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 bg-paper px-6 pt-4 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] z-10">
              <div className="flex flex-col gap-2.5">
                {selectedRes.status === "BOOKED" && (
                  <div className="flex gap-2">
                    <button
                      disabled={updating}
                      onClick={() => handleStatusChange(selectedRes.reservation_id, "CANCELLED")}
                      className="flex-1 rounded-xl border border-line bg-paper py-3 text-[14px] font-bold text-ink transition hover:bg-mist active:scale-95 disabled:opacity-50"
                    >
                      Cancel Booking
                    </button>
                    <PrimaryButton
                      className="flex-1"
                      disabled={updating}
                      onClick={() => handleStatusChange(selectedRes.reservation_id, "COMPLETED")}
                    >
                      Mark Completed
                    </PrimaryButton>
                  </div>
                )}
                <SecondaryButton onClick={() => setSelectedRes(null)}>Close</SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
