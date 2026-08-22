"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useApiPath } from "@/lib/useApi";
import type { CashierReservation, CashierReservationsResponse, WorkerReservationStatus } from "@/lib/types/admin";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { SecondaryButton } from "@/components/Buttons";
import { formatDuration, formatPrice } from "@/lib/utils/format";

const TABS: { id: string; label: string }[] = [
  { id: "booked", label: "Booked" },
  { id: "walkin", label: "Walk In" },
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

const isWalkIn = (res: CashierReservation) =>
  res.customer_name === "WALK IN" || res.notes === "WALK IN";

export default function CashierPage() {
  const [viewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
  const [activeTab, setActiveTab] = useState("booked");
  const [selectedRes, setSelectedRes] = useState<CashierReservation | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const { data, loading, error, refetch } = useApiPath<{ data: CashierReservationsResponse }>(
    "/api/cashier/reservations",
    { start_date: selectedDate, end_date: selectedDate },
  );

  const reservations = useMemo(() => data?.data.reservations ?? [], [data]);
  const paid = (res: CashierReservation) => res.payment_status === "SETTLEMENT";

  const filteredList = useMemo(() => {
    if (activeTab === "walkin") return reservations.filter(isWalkIn);
    return reservations.filter((res) => res.reservation_status === activeTab && !isWalkIn(res));
  }, [reservations, activeTab]);

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
      await (await import("@/lib/api")).api(`/api/cashier/reservations/${res.reservation_id}/checkout`, {
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
      <div className="sticky top-16 z-40 border-b border-gray-200 bg-white px-5 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">Cashier</h1>
          <div className="flex gap-2">
            <Link href="/cashier/walkin" className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800">
              <Icon name="plus" className="h-4 w-4" />
              Walk In
            </Link>
            <Link href="/cashier/product" className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-50">
              <Icon name="tag" className="h-4 w-4" />
              Beli Produk
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => changeDate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95">
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-sm font-semibold text-black outline-none" />
            <button onClick={() => changeDate(1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95">
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex h-9 items-center justify-center rounded-full px-5 text-[13px] font-semibold whitespace-nowrap transition active:scale-95", activeTab === tab.id ? "bg-black text-white" : "border border-gray-200 bg-white text-black hover:bg-gray-50")}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="mt-4 flex justify-center py-16 text-center text-gray-400"><p className="text-sm">Memuat data...</p></div>}
      {error && <div className="mt-4 flex justify-center py-16 text-center"><p className="text-sm text-red-500">{error}</p></div>}

      {!loading && !error && viewMode === "list" && (
        <div className="mt-4 flex flex-col gap-4 px-5">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <Icon name="clock" className="mb-4 h-12 w-12 opacity-20" />
              <p className="text-sm">Tidak ada sesi ditemukan.</p>
            </div>
          ) : (
            filteredList.map((res) => {
              const isPaid = paid(res);
              return (
                <div key={res.reservation_id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-black">{res.customer_name}</h3>
                      <p className="text-sm text-gray-500">{res.start_time} • {res.service_names} • {res.capster_name}</p>
                    </div>
                    <div className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider", res.reservation_status === "BOOKED" && "bg-gray-100 text-black", res.reservation_status === "COMPLETED" && "bg-black text-white", res.reservation_status === "CANCELLED" && "border border-gray-200 text-gray-400")}>
                      {STATUS_LABELS[res.reservation_status]}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-black">
                      <Icon name={isPaid ? "check" : "close"} className={cn("h-4 w-4", isPaid ? "text-black" : "text-gray-300")} />
                      {isPaid ? `Lunas (${res.payment_method || "CASH"})` : "Belum Bayar"}
                      <span className="text-gray-400">• {formatPrice(Number(res.service_total))}</span>
                    </span>
                    {res.reservation_status !== "CANCELLED" && !isPaid && (
                      <button onClick={() => handleCheckout(res)} className="rounded-lg bg-black px-3 py-1.5 text-[11px] font-bold text-white transition active:scale-95">
                        Bayar di tempat
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 border-t border-gray-100 pt-3">
                    <SecondaryButton className="flex-1" onClick={() => setSelectedRes(res)}>View Detail</SecondaryButton>
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
              <div className="flex border-b border-gray-200">
                <div className="w-14 shrink-0" />
                {workerColumns.map((worker) => (
                  <div key={worker.id} className="flex-1 border-l border-gray-200 px-2 py-2 text-center">
                    <div className="truncate text-[11px] font-bold text-black">{worker.name}</div>
                  </div>
                ))}
              </div>
              <div className="relative flex">
                <div className="w-14 shrink-0">
                  {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                    <div key={i} className="relative pr-2 text-right text-[10px] font-semibold text-gray-500" style={{ height: HOUR_HEIGHT }}>
                      <span className="relative -top-2">{10 + i}:00</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-1">
                  {workerColumns.map((worker) => {
                    const blocks = reservations.filter((r) => r.capster_id === worker.id);
                    return (
                      <div key={worker.id} className="relative flex-1 border-l border-gray-200" style={{ height: (HOUR_COUNT - 1) * HOUR_HEIGHT }}>
                        {Array.from({ length: HOUR_COUNT }).map((_, i) => (
                          <div key={i} className="absolute w-full border-t border-gray-200" style={{ top: i * HOUR_HEIGHT }}>
                            <div className="absolute w-full border-t border-dashed border-gray-200 opacity-40" style={{ top: HOUR_HEIGHT / 2 }} />
                          </div>
                        ))}
                        {blocks.map((res) => {
                          const top = (getMinutesSince10(res.start_time) / 60) * HOUR_HEIGHT;
                          const height = (res.duration_minutes / 60) * HOUR_HEIGHT;
                          const isPaid = paid(res);
                          return (
                            <button key={res.reservation_id} onClick={() => setSelectedRes(res)} className={cn("absolute right-1 left-1 overflow-hidden rounded-md border p-1.5 text-left transition active:scale-[0.98]", res.reservation_status === "BOOKED" && (isPaid ? "border-black bg-black text-white" : "border-black/20 bg-gray-100 text-black"), res.reservation_status === "COMPLETED" && "border-gray-200 bg-white text-gray-500", res.reservation_status === "CANCELLED" && "border-gray-200 bg-white text-gray-300 opacity-60 line-through")} style={{ top, height }}>
                              <div className="truncate text-[11px] font-bold">{res.customer_name}</div>
                              {height >= 40 && <div className="mt-0.5 truncate text-[10px] font-medium opacity-80">{res.start_time} • {res.service_names}</div>}
                              {height >= 54 && <div className={cn("mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase", isPaid ? "bg-white/20 text-white" : "border border-black text-black")}>{isPaid ? "Lunas" : "Belum Bayar"}</div>}
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
          <div className="mt-3 flex items-center gap-4 px-5 text-[11px] font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-black" /> Lunas</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-black bg-gray-100" /> Belum Bayar</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-white opacity-60" /> Canceled</span>
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
                    <div className="mt-0.5 flex gap-3 text-sm text-gray-500"><span className="flex items-center gap-1"><Icon name="phone" className="h-3.5 w-3.5" /> {selectedRes.customer_phone}</span></div>
                    <div className="mt-0.5 flex gap-3 text-sm text-gray-500"><span className="flex items-center gap-1"><Icon name="mail" className="h-3.5 w-3.5" /> {selectedRes.customer_email}</span></div>
                  </div>
                  <div><div className="mb-1 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Worker</div><div className="text-[15px] font-semibold text-black">{selectedRes.capster_name}</div></div>
                  <div>
                    <div className="mb-1 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Time & Date</div>
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-black"><Icon name="clock" className="h-4 w-4" />{selectedRes.start_time} ({formatDuration(selectedRes.duration_minutes)})</div>
                    <div className="ml-6 mt-0.5 text-sm text-gray-500">{new Date(selectedRes.booking_date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                  <div><div className="mb-1 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Service</div><div className="text-[15px] font-semibold text-black">{selectedRes.service_names}</div><div className="ml-6 mt-0.5 text-sm text-gray-500">{formatPrice(Number(selectedRes.service_total))}</div></div>
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
                {selectedRes.reservation_status !== "CANCELLED" && !paid(selectedRes) && (
                  <button className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50" disabled={checkingOut} onClick={() => handleCheckout(selectedRes)}>
                    {checkingOut ? "Memproses..." : "Bayar di tempat"}
                  </button>
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
