"use client";

import { useState, useMemo, useEffect } from "react";
import { MOCK_RESERVATIONS } from "@/lib/constants";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { formatDuration } from "@/lib/utils/format";

const TABS: { id: ReservationStatus; label: string }[] = [
  { id: "Booked", label: "Booked" },
  { id: "Completed", label: "Completed" },
  { id: "Canceled", label: "Canceled" },
];

function getMinutesSince10(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  return (hh - 10) * 60 + mm;
}

export default function WorkerDashboardPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMode, setCalendarMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<ReservationStatus>("Booked");
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  useEffect(() => {
    if (selectedRes) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRes]);

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

  // List View Filter
  const filteredList = useMemo(() => {
    return reservations.filter(
      (res) => res.date === selectedDate && res.status === activeTab
    );
  }, [reservations, selectedDate, activeTab]);

  // Calendar View Filter (ignore tabs, show all for the date/week)
  const calendarReservations = useMemo(() => {
    if (calendarMode === "day") {
      return reservations.filter((res) => res.date === selectedDate);
    } else {
      return reservations.filter((res) => weekDates.includes(res.date));
    }
  }, [reservations, selectedDate, calendarMode, weekDates]);

  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
    );
    if (selectedRes?.id === id) {
      setSelectedRes({ ...selectedRes, status: newStatus });
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const HOUR_HEIGHT = 80;

  return (
    <div className="flex flex-col pb-20">
      {/* HEADER & CONTROLS */}
      <div className="sticky top-16 z-40 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-bold text-ink">My Schedule</h1>
          
          <div className="flex items-center rounded-lg border border-line bg-mist p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                viewMode === "list" ? "bg-paper shadow-sm text-ink" : "text-graphite"
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                viewMode === "calendar" ? "bg-paper shadow-sm text-ink" : "text-graphite"
              )}
            >
              Calendar
            </button>
          </div>
        </div>

        {/* Date Controls */}
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
                  calendarMode === "day" ? "bg-paper shadow-sm text-ink" : "text-graphite"
                )}
              >
                Day
              </button>
              <button
                onClick={() => setCalendarMode("week")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[11px] font-bold transition",
                  calendarMode === "week" ? "bg-paper shadow-sm text-ink" : "text-graphite"
                )}
              >
                Week
              </button>
            </div>
          )}
        </div>

        {/* Tabs (Only for List View) */}
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
                    isActive
                      ? "bg-ink text-paper"
                      : "border border-line bg-paper text-ink hover:bg-mist"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CONTENT */}
      {viewMode === "list" ? (
        <div className="mt-4 flex flex-col gap-4 px-5">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-graphite">
              <Icon name="clock" className="mb-4 h-12 w-12 opacity-20" />
              <p className="text-[14px]">No {activeTab.toLowerCase()} reservations found.</p>
            </div>
          ) : (
            filteredList.map((res) => (
              <div
                key={res.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold text-ink">{res.customerName}</h3>
                    <p className="text-[13px] font-medium text-graphite">
                      {res.time} • {res.serviceName}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                      res.status === "Booked" && "bg-mist text-ink",
                      res.status === "Completed" && "bg-ink text-paper",
                      res.status === "Canceled" && "border border-line text-smoke"
                    )}
                  >
                    {res.status}
                  </div>
                </div>

                <div className="mt-2 flex gap-2 border-t border-line/50 pt-4">
                  <SecondaryButton
                    className="flex-1"
                    onClick={() => setSelectedRes(res)}
                  >
                    View Detail
                  </SecondaryButton>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* CALENDAR VIEW */
        <div className="relative mt-4 flex overflow-x-auto px-5 no-scrollbar">
          <div className="min-w-[600px] flex-1 pb-10 pt-4">
            
            {/* Header row for Week view */}
            {calendarMode === "week" && (
              <div className="flex ml-14 mb-2 border-b border-line pb-2">
                {weekDates.map((date) => {
                  const d = new Date(date);
                  const isToday = date === new Date().toISOString().split("T")[0];
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
              {/* Timeline Labels */}
              <div className="w-14 shrink-0 flex flex-col border-r border-line">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="relative text-[11px] font-semibold text-graphite pr-2 text-right"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span className="relative -top-2.5">{10 + i}:00</span>
                  </div>
                ))}
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 ml-14 pointer-events-none">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-line" style={{ top: i * HOUR_HEIGHT }}>
                    <div className="absolute w-full border-t border-line border-dashed opacity-50" style={{ top: HOUR_HEIGHT / 2 }} />
                  </div>
                ))}
              </div>

              {/* Day/Week Columns */}
              <div className={cn("relative flex-1", calendarMode === "week" ? "flex" : "block ml-2")}>
                {(calendarMode === "week" ? weekDates : [selectedDate]).map((colDate, colIdx) => (
                  <div
                    key={colDate}
                    className="relative flex-1 border-r border-line/30 last:border-0"
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
                              "absolute inset-x-1 rounded-md p-2 text-left transition active:scale-[0.98] cursor-pointer overflow-hidden border",
                              res.status === "Booked" && "bg-mist border-ink/20 text-ink",
                              res.status === "Completed" && "bg-ink border-ink text-paper",
                              res.status === "Canceled" && "bg-paper border-line text-smoke opacity-70 line-through"
                            )}
                            style={{ top, height }}
                          >
                            <div className="text-[11px] font-bold truncate">{res.customerName}</div>
                            {height >= 40 && (
                              <div className="text-[10px] font-medium opacity-80 mt-0.5 truncate">
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
      )}

      {/* DETAIL MODAL */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div
            className="animate-fade-in absolute inset-0 bg-black/50"
            onClick={() => setSelectedRes(null)}
          />
          <div className="animate-fade-in relative flex max-h-[85dvh] w-full max-w-sm flex-col rounded-3xl bg-paper shadow-xl overflow-hidden">
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-6 pb-6">

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[22px] font-bold text-ink">Reservation Detail</h2>
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                      selectedRes.status === "Booked" && "bg-mist text-ink",
                      selectedRes.status === "Completed" && "bg-ink text-paper",
                      selectedRes.status === "Canceled" && "border border-line text-smoke"
                    )}
                  >
                    {selectedRes.status}
                  </div>
                </div>

                <div className="mt-6 space-y-5 border-t border-line pt-5">
                  <div>
                    <div className="text-[11px] font-bold tracking-widest text-graphite uppercase mb-1">Customer</div>
                    <div className="text-[15px] font-semibold text-ink">{selectedRes.customerName}</div>
                    <div className="text-[13px] text-graphite mt-0.5 flex gap-3">
                      <span className="flex items-center gap-1"><Icon name="phone" className="w-3.5 h-3.5"/> {selectedRes.customerPhone}</span>
                    </div>
                    <div className="text-[13px] text-graphite mt-0.5 flex gap-3">
                      <span className="flex items-center gap-1"><Icon name="mail" className="w-3.5 h-3.5"/> {selectedRes.customerEmail}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold tracking-widest text-graphite uppercase mb-1">Time & Date</div>
                    <div className="text-[15px] font-semibold text-ink flex items-center gap-2">
                      <Icon name="clock" className="w-4 h-4"/> 
                      {selectedRes.time} ({formatDuration(selectedRes.durationMinutes)})
                    </div>
                    <div className="text-[13px] text-graphite mt-0.5 ml-6">
                      {new Date(selectedRes.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold tracking-widest text-graphite uppercase mb-1">Service</div>
                    <div className="text-[15px] font-semibold text-ink">{selectedRes.serviceName}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 bg-paper px-6 pt-4 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] z-10">
              <div className="flex flex-col gap-2.5">
                {selectedRes.status === "Booked" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedRes.id, "Canceled")}
                      className="flex-1 rounded-xl border border-line bg-paper py-3 text-[14px] font-bold text-ink transition hover:bg-mist active:scale-95"
                    >
                      Cancel Booking
                    </button>
                    <PrimaryButton
                      className="flex-1"
                      onClick={() => handleStatusChange(selectedRes.id, "Completed")}
                    >
                      Mark Completed
                    </PrimaryButton>
                  </div>
                )}
                <SecondaryButton onClick={() => setSelectedRes(null)}>
                  Close
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
