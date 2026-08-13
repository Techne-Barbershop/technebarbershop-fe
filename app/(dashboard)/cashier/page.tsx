"use client";

import { useEffect, useMemo, useState } from "react";
import { ARTISTS, MOCK_RESERVATIONS } from "@/lib/constants";
import type { PaymentStatus, Reservation, ReservationStatus } from "@/lib/types";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { formatDuration } from "@/lib/utils/format";

const TABS: { id: ReservationStatus; label: string }[] = [
  { id: "Booked", label: "Booked" },
  { id: "Completed", label: "Completed" },
  { id: "Canceled", label: "Canceled" },
];

const HOUR_HEIGHT = 72;
const HOUR_COUNT = 12;

function getMinutesSince10(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  return (hh - 10) * 60 + mm;
}

function buildReservations(): Reservation[] {
  const today = new Date().toISOString().split("T")[0];
  const base: Reservation[] = MOCK_RESERVATIONS.map((res) => ({
    ...res,
    paymentStatus: res.status === "Completed" ? "Paid" : "Not Paid",
  }));
  const extra: Reservation[] = [
    {
      id: "RES-101", customerName: "Siti Rahayu", customerPhone: "081234567891",
      customerEmail: "siti.rahayu@example.com", date: today, time: "10:30",
      durationMinutes: 60, workerId: "rizky", workerName: "Rizky Pratama",
      serviceName: ["Classic Cut"], status: "Booked", paymentStatus: "Not Paid",
    },
    {
      id: "RES-102", customerName: "Bima Arya", customerPhone: "081234567892",
      customerEmail: "bima.arya@example.com", date: today, time: "13:00",
      durationMinutes: 45, workerId: "rizky", workerName: "Rizky Pratama",
      serviceName: ["Only Beard Trim and Shave"], status: "Booked", paymentStatus: "Paid",
    },
    {
      id: "RES-103", customerName: "Cahyo Wibowo", customerPhone: "081234567893",
      customerEmail: "cahyo.wibowo@example.com", date: today, time: "11:00",
      durationMinutes: 90, workerId: "kevin", workerName: "Kevin Wijaya",
      serviceName: ["Full Coloring 1 Bleach"], status: "Booked", paymentStatus: "Not Paid",
    },
    {
      id: "RES-104", customerName: "Dinda Ayu", customerPhone: "081234567894",
      customerEmail: "dinda.ayu@example.com", date: today, time: "15:30",
      durationMinutes: 60, workerId: "kevin", workerName: "Kevin Wijaya",
      serviceName: ["Black Basic Hair Coloring"], status: "Completed", paymentStatus: "Paid",
    },
    {
      id: "RES-105", customerName: "Eko Prasetyo", customerPhone: "081234567895",
      customerEmail: "eko.prasetyo@example.com", date: today, time: "12:00",
      durationMinutes: 120, workerId: "fajar", workerName: "Fajar Nugroho",
      serviceName: ["Korean Full Drip"], status: "Booked", paymentStatus: "Not Paid",
    },
    {
      id: "RES-106", customerName: "Fani Permata", customerPhone: "081234567896",
      customerEmail: "fani.permata@example.com", date: today, time: "16:30",
      durationMinutes: 90, workerId: "fajar", workerName: "Fajar Nugroho",
      serviceName: ["Smoothing Treatment"], status: "Booked", paymentStatus: "Not Paid",
    },
    {
      id: "RES-107", customerName: "Genta Mahesa", customerPhone: "081234567897",
      customerEmail: "genta.mahesa@example.com", date: today, time: "10:00",
      durationMinutes: 45, workerId: "yoga", workerName: "Yoga Aditya",
      serviceName: ["Essential Cut"], status: "Completed", paymentStatus: "Paid",
    },
    {
      id: "RES-108", customerName: "Hana Safitri", customerPhone: "081234567898",
      customerEmail: "hana.safitri@example.com", date: today, time: "14:30",
      durationMinutes: 60, workerId: "yoga", workerName: "Yoga Aditya",
      serviceName: ["Full Face Treatment"], status: "Booked", paymentStatus: "Not Paid",
    },
    {
      id: "RES-109", customerName: "Iqbal Ramadhan", customerPhone: "081234567899",
      customerEmail: "iqbal.ramadhan@example.com", date: today, time: "11:30",
      durationMinutes: 30, workerId: "dimas", workerName: "Dimas Saputra",
      serviceName: ["Buzz Cut"], status: "Booked", paymentStatus: "Not Paid",
    },
  ];
  return [...base, ...extra];
}

export default function CashierPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<ReservationStatus>("Booked");
  const [reservations, setReservations] = useState<Reservation[]>(buildReservations);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  useEffect(() => {
    document.body.style.overflow = selectedRes ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRes]);

  const filteredList = useMemo(() => {
    return reservations.filter(
      (res) => res.date === selectedDate && res.status === activeTab
    );
  }, [reservations, selectedDate, activeTab]);

  const calendarReservations = useMemo(() => {
    return reservations.filter((res) => res.date === selectedDate);
  }, [reservations, selectedDate]);

  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
    );
    if (selectedRes?.id === id) {
      setSelectedRes({ ...selectedRes, status: newStatus });
    }
  };

  const handlePaymentChange = (id: string, paymentStatus: PaymentStatus) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, paymentStatus } : res))
    );
    if (selectedRes?.id === id) {
      setSelectedRes({ ...selectedRes, paymentStatus });
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="flex flex-col pb-20">
      {/* HEADER & CONTROLS */}
      <div className="sticky top-16 z-40 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-ink">Cashier</h1>

          <div className="flex items-center rounded-lg border border-line bg-mist p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                viewMode === "list" ? "bg-paper text-ink shadow-sm" : "text-graphite"
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                viewMode === "calendar" ? "bg-paper text-ink shadow-sm" : "text-graphite"
              )}
            >
              Calendar
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
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
              onClick={() => changeDate(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:bg-mist active:scale-95"
            >
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {viewMode === "list" && (
          <div className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-full px-5 text-[13px] font-semibold whitespace-nowrap transition active:scale-95",
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
            filteredList.map((res) => {
              const paid = res.paymentStatus === "Paid";
              return (
                <div
                  key={res.id}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[16px] font-bold text-ink">{res.customerName}</h3>
                      <p className="text-[13px] font-medium text-graphite">
                        {res.time} • {res.serviceName.join(", ")}
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

                  <div className="flex items-center justify-between gap-3 border-t border-line/50 pt-3">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                      <Icon
                        name={paid ? "check" : "close"}
                        className={cn("h-4 w-4", paid ? "text-ink" : "text-smoke")}
                      />
                      {paid ? "Paid" : "Not Paid"}
                    </span>
                    <button
                      onClick={() =>
                        handlePaymentChange(res.id, paid ? "Not Paid" : "Paid")
                      }
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-[11px] font-bold transition active:scale-95",
                        paid
                          ? "border-line bg-paper text-ink hover:bg-mist"
                          : "border-ink bg-ink text-paper"
                      )}
                    >
                      {paid ? "Mark Not Paid" : "Mark Paid"}
                    </button>
                  </div>

                  <div className="flex gap-2 border-t border-line/50 pt-3">
                    <SecondaryButton className="flex-1" onClick={() => setSelectedRes(res)}>
                      View Detail
                    </SecondaryButton>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* CALENDAR VIEW: columns = workers, rows = time */
        <div className="mt-4">
          <div className="overflow-x-auto px-5 no-scrollbar">
            <div className="min-w-[840px]">
              <div className="flex border-b border-line">
                <div className="w-14 shrink-0" />
                {ARTISTS.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex-1 border-l border-line px-2 py-2 text-center"
                  >
                    <div className="truncate text-[11px] font-bold text-ink">
                      {worker.name}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative flex">
                <div className="w-14 shrink-0">
                  {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                    <div
                      key={i}
                      className="relative pr-2 text-right text-[10px] font-semibold text-graphite"
                      style={{ height: HOUR_HEIGHT }}
                    >
                      <span className="relative -top-2">{10 + i}:00</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-1">
                  {ARTISTS.map((worker) => {
                    const blocks = calendarReservations.filter(
                      (res) => res.workerId === worker.id
                    );
                    return (
                      <div
                        key={worker.id}
                        className="relative flex-1 border-l border-line"
                        style={{ height: (HOUR_COUNT - 1) * HOUR_HEIGHT }}
                      >
                        {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-full border-t border-line"
                            style={{ top: i * HOUR_HEIGHT }}
                          >
                            <div
                              className="absolute w-full border-t border-dashed border-line opacity-40"
                              style={{ top: HOUR_HEIGHT / 2 }}
                            />
                          </div>
                        ))}

                        {blocks.map((res) => {
                          const top = (getMinutesSince10(res.time) / 60) * HOUR_HEIGHT;
                          const height = (res.durationMinutes / 60) * HOUR_HEIGHT;
                          const paid = res.paymentStatus === "Paid";
                          return (
                            <button
                              key={res.id}
                              onClick={() => setSelectedRes(res)}
                              className={cn(
                                "absolute right-1 left-1 overflow-hidden rounded-md border p-1.5 text-left transition active:scale-[0.98]",
                                res.status === "Booked" &&
                                  (paid
                                    ? "border-ink bg-ink text-paper"
                                    : "border-ink/30 bg-mist text-ink"),
                                res.status === "Completed" &&
                                  "border-line bg-paper text-graphite",
                                res.status === "Canceled" &&
                                  "border-line bg-paper text-smoke opacity-60 line-through"
                              )}
                              style={{ top, height }}
                            >
                              <div className="truncate text-[11px] font-bold">
                                {res.customerName}
                              </div>
                              {height >= 40 ? (
                                <div className="mt-0.5 truncate text-[10px] font-medium opacity-80">
                                  {res.time} • {res.serviceName.join(", ")}
                                </div>
                              ) : null}
                              {height >= 54 ? (
                                <div
                                  className={cn(
                                    "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                                    paid
                                      ? "bg-paper/20 text-paper"
                                      : "border border-ink text-ink"
                                  )}
                                >
                                  {paid ? "Paid" : "Not Paid"}
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 px-5 text-[11px] font-medium text-graphite">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-ink" /> Paid
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-ink bg-mist" /> Not Paid
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-paper opacity-60" /> Canceled
            </span>
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
          <div className="animate-fade-in relative flex max-h-[85dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-paper shadow-xl">
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-6 pb-6">
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
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
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-graphite uppercase">
                      Customer
                    </div>
                    <div className="text-[15px] font-semibold text-ink">
                      {selectedRes.customerName}
                    </div>
                    <div className="mt-0.5 flex gap-3 text-[13px] text-graphite">
                      <span className="flex items-center gap-1">
                        <Icon name="phone" className="h-3.5 w-3.5" /> {selectedRes.customerPhone}
                      </span>
                    </div>
                    <div className="mt-0.5 flex gap-3 text-[13px] text-graphite">
                      <span className="flex items-center gap-1">
                        <Icon name="mail" className="h-3.5 w-3.5" /> {selectedRes.customerEmail}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-graphite uppercase">
                      Worker
                    </div>
                    <div className="text-[15px] font-semibold text-ink">
                      {selectedRes.workerName}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-graphite uppercase">
                      Time & Date
                    </div>
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                      <Icon name="clock" className="h-4 w-4" />
                      {selectedRes.time} ({formatDuration(selectedRes.durationMinutes)})
                    </div>
                    <div className="ml-6 mt-0.5 text-[13px] text-graphite">
                      {new Date(selectedRes.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-graphite uppercase">
                      Service
                    </div>
                    <div className="text-[15px] font-semibold text-ink">
                      {selectedRes.serviceName.join(", ")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-line bg-mist px-4 py-3">
                    <div>
                      <div className="text-[11px] font-bold tracking-widest text-graphite uppercase">
                        Payment
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                        <Icon
                          name={selectedRes.paymentStatus === "Paid" ? "check" : "close"}
                          className={cn(
                            "h-4 w-4",
                            selectedRes.paymentStatus === "Paid" ? "text-ink" : "text-smoke"
                          )}
                        />
                        {selectedRes.paymentStatus === "Paid" ? "Paid" : "Not Paid"}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handlePaymentChange(
                          selectedRes.id,
                          selectedRes.paymentStatus === "Paid" ? "Not Paid" : "Paid"
                        )
                      }
                      className={cn(
                        "rounded-lg border px-3.5 py-2 text-[12px] font-bold transition active:scale-95",
                        selectedRes.paymentStatus === "Paid"
                          ? "border-line bg-paper text-ink hover:bg-mist"
                          : "border-ink bg-ink text-paper"
                      )}
                    >
                      {selectedRes.paymentStatus === "Paid" ? "Mark Not Paid" : "Mark as Paid"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="z-10 shrink-0 bg-paper px-6 pt-4 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
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
