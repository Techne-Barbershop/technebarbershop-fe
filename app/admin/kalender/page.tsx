"use client";

import { useState, useMemo, useEffect } from "react";
import { ADMIN_STAFF, ADMIN_RESERVATIONS } from "@/lib/admin-data";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import Modal from "@/components/admin/Modal";
import { formatDuration } from "@/lib/utils/format";

function getMinutesSince10(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  return (hh - 10) * 60 + mm;
}

export default function KalenderPage() {
  const [calendarMode, setCalendarMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  
  // By default select the first worker or 'all' if we wanted to support all
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(ADMIN_STAFF[0].id);
  
  const [selectedRes, setSelectedRes] = useState<any>(null);

  // WEEK LOGIC
  const startOfWeek = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  }, [selectedDate]);

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [startOfWeek]);

  // Calendar View Filter
  const calendarReservations = useMemo(() => {
    const filteredByWorker = ADMIN_RESERVATIONS.filter(res => res.workerId === selectedWorkerId);
    if (calendarMode === "day") {
      return filteredByWorker.filter((res) => res.date === selectedDate);
    } else {
      return filteredByWorker.filter((res) => weekDates.includes(res.date));
    }
  }, [selectedWorkerId, selectedDate, calendarMode, weekDates]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const HOUR_HEIGHT = 80;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="worker-filter" className="text-sm font-bold text-black">
            Pilih Staf:
          </label>
          <select
            id="worker-filter"
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
          >
            {ADMIN_STAFF.map(staff => (
              <option key={staff.id} value={staff.id}>{staff.name}</option>
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
                calendarMode === "day" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"
              )}
            >
              Per Hari
            </button>
            <button
              onClick={() => setCalendarMode("week")}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-bold transition",
                calendarMode === "week" ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"
              )}
            >
              Per Minggu
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR VIEW */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="relative flex overflow-x-auto p-5 no-scrollbar">
          <div className="min-w-[600px] flex-1">
            
            {/* Header row for Week view */}
            {calendarMode === "week" && (
              <div className="ml-14 mb-2 flex border-b border-gray-200 pb-2">
                {weekDates.map((date) => {
                  const d = new Date(date);
                  const isToday = date === new Date().toISOString().split("T")[0];
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
              {/* Timeline Labels */}
              <div className="flex w-14 shrink-0 flex-col border-r border-gray-200">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="relative pr-2 text-right text-[11px] font-semibold text-gray-400"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span className="relative -top-2.5">{10 + i}:00</span>
                  </div>
                ))}
              </div>

              {/* Grid Lines */}
              <div className="pointer-events-none absolute inset-0 ml-14">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-gray-200" style={{ top: i * HOUR_HEIGHT }}>
                    <div className="absolute w-full border-t border-dashed border-gray-200 opacity-50" style={{ top: HOUR_HEIGHT / 2 }} />
                  </div>
                ))}
              </div>

              {/* Day/Week Columns */}
              <div className={cn("relative flex-1", calendarMode === "week" ? "flex" : "ml-2 block")}>
                {(calendarMode === "week" ? weekDates : [selectedDate]).map((colDate) => (
                  <div
                    key={colDate}
                    className="relative flex-1 border-r border-gray-200/30 last:border-0"
                    style={{ height: 11 * HOUR_HEIGHT }}
                  >
                    {calendarReservations
                      .filter((res) => res.date === colDate)
                      .map((res) => {
                        const top = (getMinutesSince10(res.time) / 60) * HOUR_HEIGHT;
                        const height = (res.durationMinutes / 60) * HOUR_HEIGHT;
                        
                        return (
                          <div
                            key={res.id}
                            onClick={() => setSelectedRes(res)}
                            className={cn(
                              "absolute inset-x-1 cursor-pointer overflow-hidden rounded-md border p-2 text-left transition active:scale-[0.98]",
                              res.status === "Booked" && "bg-gray-100 border-black/20 text-black",
                              res.status === "Completed" && "bg-black border-black text-white",
                              res.status === "Canceled" && "bg-white border-gray-300 text-gray-400 opacity-70 line-through"
                            )}
                            style={{ top, height }}
                          >
                            <div className="truncate text-[11px] font-bold">{res.customerName}</div>
                            {height >= 40 && (
                              <div className="mt-0.5 truncate text-[10px] font-medium opacity-80">
                                {res.time} • {res.serviceName}
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

      {/* DETAIL MODAL */}
      <Modal 
        isOpen={!!selectedRes} 
        onClose={() => setSelectedRes(null)} 
        title="Detail Reservasi"
      >
        {selectedRes && (
          <div className="space-y-5">
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">Pelanggan</div>
              <div className="text-[15px] font-semibold text-black">{selectedRes.customerName}</div>
              <div className="mt-0.5 flex gap-3 text-[13px] text-gray-600">
                <span className="flex items-center gap-1"><Icon name="phone" className="h-3.5 w-3.5"/> {selectedRes.customerPhone}</span>
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">Waktu & Tanggal</div>
              <div className="flex items-center gap-2 text-[15px] font-semibold text-black">
                <Icon name="clock" className="h-4 w-4"/> 
                {selectedRes.time} ({formatDuration(selectedRes.durationMinutes)})
              </div>
              <div className="ml-6 mt-0.5 text-[13px] text-gray-600">
                {new Date(selectedRes.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">Layanan</div>
              <div className="text-[15px] font-semibold text-black">{selectedRes.serviceName}</div>
            </div>
            
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">Status</div>
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                  selectedRes.status === "Booked" && "bg-gray-100 text-black",
                  selectedRes.status === "Completed" && "bg-black text-white",
                  selectedRes.status === "Canceled" && "border border-gray-300 text-gray-500"
                )}
              >
                {selectedRes.status}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
