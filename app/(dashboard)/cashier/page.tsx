"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { CashierReservation, CashierReservationsResponse, WorkerReservationStatus } from "@/lib/types/admin";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { formatDuration, formatPrice } from "@/lib/utils/format";

const TABS: { id: WorkerReservationStatus; label: string }[] = [
  { id: "BOOKED", label: "Booked" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Canceled" },
];

const HOUR_HEIGHT = 72;
const HOUR_COUNT = 12;

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

const STATUS_LABELS: Record<WorkerReservationStatus, string> = {
  BOOKED: "Booked",
  COMPLETED: "Completed",
  CANCELLED: "Canceled",
};

export default function CashierPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
  const [activeTab, setActiveTab] = useState<WorkerReservationStatus>("BOOKED");
  const [selectedRes, setSelectedRes] = useState<CashierReservation | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const { data, loading, error, refetch } = useApiPath<{ data: CashierReservationsResponse }>(
    "/api/cashier/reservations",
    { start_date: selectedDate, end_date: selectedDate },
  );

  const reservations = useMemo(() => data?.data.reservations ?? [], [data]);
  const paid = (res: CashierReservation) => res.payment_status === "SETTLEMENT";

  useEffect(() => {
    document.body.style.overflow = selectedRes ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedRes]);

  const filteredList = useMemo(
    () => reservations.filter((res) => res.reservation_status === activeTab),
    [reservations, activeTab],
  );

  const calendarReservations = useMemo(() => reservations, [reservations]);

  const workerColumns = useMemo(() => {
    const seen = new Map<string, string>();
    for (const res of reservations) {
      if (!seen.has(res.capster_id)) seen.set(res.capster_id, res.capster_name);
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [reservations]);

  const handleCheckout = async (res: CashierReservation) => {
    setCheckingOut(true);
    try {
      await api(`/api/cashier/reservations/${res.reservation_id}/checkout`, {
        method: "POST",
        body: { payment_method: "CASH" },
      });
      setSelectedRes(null);
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal memproses pembayaran");
    } finally {
      setCheckingOut(false);
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(toISODate(d));
  };

  return (
    <div className="flex flex-col pb-20">
      <div className="sticky top-16 z-40 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-ink">Cashier</h1>

          <div className="flex items-center rounded-lg border border-line bg-mist p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                viewMode === "list" ? "bg-paper text-ink shadow-sm" : "text-graphite",
              )}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-bold transition",
                viewMode === "calendar" ? "bg-paper text-ink shadow-sm" : "text-graphite",
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
          <p className="text-[14px]">Memuat data...</p>
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
            filteredList.map((res) => {
              const isPaid = paid(res);
              return (
                <div key={res.reservation_id} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-[16px] font-bold text-ink">{res.customer_name}</h3>
                      <p className="text-[13px] font-medium text-graphite">
                        {res.start_time} • {res.service_name} • {res.capster_name}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                        res.reservation_status === "BOOKED" && "bg-mist text-ink",
                        res.reservation_status === "COMPLETED" && "bg-ink text-paper",
                        res.reservation_status === "CANCELLED" && "border border-line text-smoke",
                      )}
                    >
                      {STATUS_LABELS[res.reservation_status]}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-line/50 pt-3">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                      <Icon name={isPaid ? "check" : "close"} className={cn("h-4 w-4", isPaid ? "text-ink" : "text-smoke")} />
                      {isPaid ? `Lunas (${res.payment_method || "CASH"})` : "Belum Bayar"}
                      <span className="text-gray-400">• {formatPrice(Number(res.service_price))}</span>
                    </span>
                    {res.reservation_status !== "CANCELLED" && !isPaid && (
                      <button
                        onClick={() => handleCheckout(res)}
                        className="rounded-lg border-ink bg-ink px-3 py-1.5 text-[11px] font-bold text-paper transition active:scale-95"
                      >
                        Bayar di tempat
                      </button>
                    )}
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
      )}

      {!loading && !error && viewMode === "calendar" && (
        <div className="mt-4">
          <div className="overflow-x-auto px-5 no-scrollbar">
            <div className="min-w-[840px]">
              <div className="flex border-b border-line">
                <div className="w-14 shrink-0" />
                {workerColumns.length === 0 && (
                  <div className="flex-1 py-3 text-center text-xs text-gray-400">Tidak ada jadwal pada tanggal ini.</div>
                )}
                {workerColumns.map((worker) => (
                  <div key={worker.id} className="flex-1 border-l border-line px-2 py-2 text-center">
                    <div className="truncate text-[11px] font-bold text-ink">{worker.name}</div>
                  </div>
                ))}
              </div>

              <div className="relative flex">
                <div className="w-14 shrink-0">
                  {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                    <div key={i} className="relative pr-2 text-right text-[10px] font-semibold text-graphite" style={{ height: HOUR_HEIGHT }}>
                      <span className="relative -top-2">{10 + i}:00</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-1">
                  {workerColumns.map((worker) => {
                    const blocks = calendarReservations.filter((res) => res.capster_id === worker.id);
                    return (
                      <div key={worker.id} className="relative flex-1 border-l border-line" style={{ height: (HOUR_COUNT - 1) * HOUR_HEIGHT }}>
                        {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                          <div key={i} className="absolute w-full border-t border-line" style={{ top: i * HOUR_HEIGHT }}>
                            <div className="absolute w-full border-t border-dashed border-line opacity-40" style={{ top: HOUR_HEIGHT / 2 }} />
                          </div>
                        ))}

                        {blocks.map((res) => {
                          const top = (getMinutesSince10(res.start_time) / 60) * HOUR_HEIGHT;
                          const height = (res.duration_minutes / 60) * HOUR_HEIGHT;
                          const isPaid = paid(res);
                          return (
                            <button
                              key={res.reservation_id}
                              onClick={() => setSelectedRes(res)}
                              className={cn(
                                "absolute right-1 left-1 overflow-hidden rounded-md border p-1.5 text-left transition active:scale-[0.98]",
                                res.reservation_status === "BOOKED" &&
                                  (isPaid ? "border-ink bg-ink text-paper" : "border-ink/30 bg-mist text-ink"),
                                res.reservation_status === "COMPLETED" && "border-line bg-paper text-graphite",
                                res.reservation_status === "CANCELLED" && "border-line bg-paper text-smoke opacity-60 line-through",
                              )}
                              style={{ top, height }}
                            >
                              <div className="truncate text-[11px] font-bold">{res.customer_name}</div>
                              {height >= 40 ? (
                                <div className="mt-0.5 truncate text-[10px] font-medium opacity-80">
                                  {res.start_time} • {res.service_name}
                                </div>
                              ) : null}
                              {height >= 54 ? (
                                <div
                                  className={cn(
                                    "mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                                    isPaid ? "bg-paper/20 text-paper" : "border border-ink text-ink",
                                  )}
                                >
                                  {isPaid ? "Lunas" : "Belum Bayar"}
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
              <span className="h-2.5 w-2.5 rounded-sm bg-ink" /> Lunas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-ink bg-mist" /> Belum Bayar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-paper opacity-60" /> Canceled
            </span>
          </div>
        </div>
      )}

      {selectedRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="animate-fade-in absolute inset-0 bg-black/50" onClick={() => setSelectedRes(null)} />
          <div className="animate-fade-in relative flex max-h-[85dvh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-paper shadow-xl">
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 pt-6 pb-6">
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-[22px] font-bold text-ink">Reservation Detail</h2>
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                      selectedRes.reservation_status === "BOOKED" && "bg-mist text-ink",
                      selectedRes.reservation_status === "COMPLETED" && "bg-ink text-paper",
                      selectedRes.reservation_status === "CANCELLED" && "border border-line text-smoke",
                    )}
                  >
                    {STATUS_LABELS[selectedRes.reservation_status]}
                  </div>
                </div>

                <div className="mt-6 space-y-5 border-t border-line pt-5">
                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-graphite uppercase">Customer</div>
                    <div className="text-[15px] font-semibold text-ink">{selectedRes.customer_name}</div>
                    <div className="mt-0.5 flex gap-3 text-[13px] text-graphite">
                      <span className="flex items-center gap-1">
                        <Icon name="phone" className="h-3.5 w-3.5" /> {selectedRes.customer_phone}
                      </span>
                    </div>
                    <div className="mt-0.5 flex gap-3 text-[13px] text-graphite">
                      <span className="flex items-center gap-1">
                        <Icon name="mail" className="h-3.5 w-3.5" /> {selectedRes.customer_email}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-graphite uppercase">Worker</div>
                    <div className="text-[15px] font-semibold text-ink">{selectedRes.capster_name}</div>
                  </div>

                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-graphite uppercase">Time & Date</div>
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                      <Icon name="clock" className="h-4 w-4" />
                      {selectedRes.start_time} ({formatDuration(selectedRes.duration_minutes)})
                    </div>
                    <div className="ml-6 mt-0.5 text-[13px] text-graphite">
                      {new Date(selectedRes.booking_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-graphite uppercase">Service</div>
                    <div className="text-[15px] font-semibold text-ink">{selectedRes.service_name}</div>
                    <div className="ml-6 mt-0.5 text-[13px] text-graphite">{formatPrice(Number(selectedRes.service_price))}</div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-line bg-mist px-4 py-3">
                    <div>
                      <div className="text-[11px] font-bold tracking-widest text-graphite uppercase">Payment</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                        <Icon
                          name={paid(selectedRes) ? "check" : "close"}
                          className={cn("h-4 w-4", paid(selectedRes) ? "text-ink" : "text-smoke")}
                        />
                        {paid(selectedRes) ? `Lunas (${selectedRes.payment_method || "CASH"})` : "Belum Bayar"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="z-10 shrink-0 bg-paper px-6 pt-4 pb-6 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col gap-2.5">
                {selectedRes.reservation_status !== "CANCELLED" && !paid(selectedRes) && (
                  <PrimaryButton className="w-full" disabled={checkingOut} onClick={() => handleCheckout(selectedRes)}>
                    {checkingOut ? "Memproses..." : "Bayar di tempat"}
                  </PrimaryButton>
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
