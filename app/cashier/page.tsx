"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useApiPath } from "@/lib/useApi";
import type { CashierReservation, CashierReservationsResponse, WorkerReservationStatus } from "@/lib/types/admin";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { formatDuration, formatPrice } from "@/lib/utils/format";

const TABS: { id: string; label: string }[] = [
  { id: "booked", label: "Booked" },
  { id: "walkin", label: "Walk In" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Canceled" },
];

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

export default function CashierPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(new Date()));
  const [activeTab, setActiveTab] = useState("booked");
  const [selectedRes, setSelectedRes] = useState<CashierReservation | null>(null);
  const [actionRes, setActionRes] = useState<CashierReservation | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "CASH" | "QRIS" | "CANCEL"; res: CashierReservation } | null>(null);
  const [qrisSuccessRes, setQrisSuccessRes] = useState<CashierReservation | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const [qrRes, setQrRes] = useState<CashierReservation | null>(null);
  const [qrString, setQrString] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<number>(0);
  const [qrRemaining, setQrRemaining] = useState("");
  const qrPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data, loading, error, refetch } = useApiPath<{ data: CashierReservationsResponse }>(
    "/api/cashier/reservations",
    { start_date: selectedDate, end_date: selectedDate },
  );

  const reservations = useMemo(() => data?.data.reservations ?? [], [data]);
  const paid = (res: CashierReservation) => res.payment_status === "SETTLEMENT";

  const getDisplayStatus = (res: CashierReservation) => {
    if (res.reservation_status === "CANCELLED") return "CANCELLED";
    if (res.reservation_status === "COMPLETED") return "COMPLETED";
    if (isWalkIn(res)) return "WALK IN";
    return "BOOKED";
  };

  const filteredList = useMemo(() => {
    return reservations.filter((res) => {
      // Completed and Cancelled tabs show ALL reservations, including walk-ins
      if (activeTab.toUpperCase() === "COMPLETED" || activeTab.toUpperCase() === "CANCELLED") {
        return res.reservation_status.toUpperCase() === activeTab.toUpperCase();
      }
      
      // If the reservation is already COMPLETED or CANCELLED, it should NOT appear in "booked" or "walkin" tabs
      if (res.reservation_status.toUpperCase() === "COMPLETED" || res.reservation_status.toUpperCase() === "CANCELLED") {
        return false;
      }
      
      // For remaining active reservations (BOOKED / PENDING_PAYMENT):
      if (isWalkIn(res)) {
        return activeTab === "walkin";
      }
      
      // If NOT a walk-in, show in "booked" tab
      if (activeTab === "booked") {
        return res.reservation_status === "BOOKED" || res.reservation_status === "PENDING_PAYMENT";
      }
      
      return false;
    });
  }, [reservations, activeTab]);

  const { data: staffData } = useApiPath<{ data: { staff: any[] } }>("/api/staff");
  const { data: servicesData } = useApiPath<{ data: { categories: any[] } }>("/api/categories");

  const getServicePrices = (serviceIdsStr: string) => {
    if (!servicesData?.data?.categories || !serviceIdsStr) return [];
    const allServices = servicesData.data.categories.flatMap((c: any) => c.services || []);
    const ids = serviceIdsStr.split(",");
    const result = [];
    for (const id of ids) {
      const s = allServices.find((s: any) => s.service_id === id);
      if (s) result.push({ name: s.name, price: Number(s.price) });
    }
    return result;
  };

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

  const handleCheckout = async (res: CashierReservation) => {
    setCheckingOut(true);
    try {
      await (await import("@/lib/api")).api(`/api/cashier/reservations/${res.reservation_id}/checkout`, {
        method: "POST",
      });
      setSelectedRes(null);
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal memproses pembayaran");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleSelesai = async (res: CashierReservation) => {
    if (!window.confirm(`Tandai ${res.customer_name} sebagai Selesai?`)) return;
    try {
      await (await import("@/lib/api")).api(`/api/cashier/reservations/${res.reservation_id}/complete`, {
        method: "POST",
      });
      setSelectedRes(null);
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menyelesaikan reservasi");
    }
  };

  const handleCancel = async (res: CashierReservation) => {
    try {
      await (await import("@/lib/api")).api(`/api/cashier/reservations/${res.reservation_id}/cancel`, {
        method: "POST",
      });
      setSelectedRes(null);
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal membatalkan reservasi");
    }
  };

  const stopQrPolling = () => {
    if (qrPollRef.current) {
      clearInterval(qrPollRef.current);
      qrPollRef.current = null;
    }
  };

  const pollQrStatus = async (res: CashierReservation) => {
    try {
      const resp = await (await import("@/lib/api")).api<{ data: CashierReservation }>(
        `/api/cashier/reservations/${res.reservation_id}`,
      );
      const updated = resp.data;
      if (updated && updated.payment_status === "SETTLEMENT") {
        stopQrPolling();
        setQrRes(null);
        setQrString("");
        setQrExpiresAt(0);
        setQrRemaining("");
        setSelectedRes(null);
        setQrisSuccessRes(updated);
        refetch();
      } else if (updated && (updated.payment_status === "CANCELLED" || updated.payment_status === "EXPIRED")) {
        stopQrPolling();
        setQrRes(null);
        setQrString("");
        setQrExpiresAt(0);
        setQrRemaining("");
        setQrError("QRIS sudah kedaluwarsa atau dibatalkan");
        refetch();
      }
    } catch {
      // polling errors are non-fatal; keep polling
    }
  };

  const startQrPolling = (res: CashierReservation) => {
    stopQrPolling();
    qrPollRef.current = setInterval(() => pollQrStatus(res), 3000);
  };

  const openExistingQr = (res: CashierReservation) => {
    setQrError(null);
    setQrString(res.qr_string);
    setQrRes(res);
    // Use stored expiry if available, otherwise default to 10 minutes from now
    const fallbackExpiry = Date.now() + 10 * 60 * 1000; // eslint-disable-line react-hooks/purity -- event handler, not render
    const expiresAt = res.qr_expires_at ? new Date(res.qr_expires_at).getTime() : fallbackExpiry;
    setQrExpiresAt(expiresAt);
    startQrPolling(res);
  };

  const handleBayarQRIS = async (res: CashierReservation) => {
    // If a QR was already generated for this reservation, just re-display it
    // instead of hitting the (idempotent) endpoint again.
    if (res.qr_string) {
      openExistingQr(res);
      return;
    }
    setQrError(null);
    setQrLoading(true);
    try {
      const resp = await (await import("@/lib/api")).api<{ data: { qr_string: string } }>(
        `/api/cashier/reservations/${res.reservation_id}/qris`,
        { method: "POST" },
      );
      setQrString(resp.data.qr_string);
      setQrRes(res);
      setQrExpiresAt(Date.now() + 10 * 60 * 1000); // eslint-disable-line react-hooks/purity -- event handler, not render
      startQrPolling(res);
    } catch (err) {
      setQrError(err instanceof Error ? err.message : "Gagal membuat QRIS");
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => () => stopQrPolling(), []);

  // Countdown effect for QR expiry
  useEffect(() => {
    if (!qrExpiresAt) return;
    const tick = () => {
      const ms = qrExpiresAt - Date.now();
      if (ms <= 0) {
        setQrRemaining("Kedaluwarsa");
        stopQrPolling();
        return;
      }
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setQrRemaining(`${m}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [qrExpiresAt]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(toISODate(d));
  };

  return (
    <div className="flex flex-col pb-20">
      <div className="sticky top-16 z-40 border border-gray-200 bg-white px-5 py-4 rounded-lg">

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
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={cn("rounded-md px-3 py-1.5 text-[12px] font-bold transition", viewMode === "list" ? "bg-white text-black shadow-sm" : "text-gray-500")}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn("rounded-md px-3 py-1.5 text-[12px] font-bold transition", viewMode === "calendar" ? "bg-white text-black shadow-sm" : "text-gray-500")}
            >
              Calendar
            </button>
          </div>
        </div>
        {viewMode === "list" && (
          <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex h-9 items-center justify-center rounded-full px-5 text-[13px] font-semibold whitespace-nowrap transition active:scale-95", activeTab === tab.id ? "bg-black text-white" : "border border-gray-200 bg-white text-black hover:bg-gray-50")}>
                {tab.label}
              </button>
            ))}
          </div>
        )}
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
                  <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 pb-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-black">
                      <Icon name={isPaid ? "check" : "close"} className={cn("h-4 w-4", isPaid ? "text-black" : "text-gray-300")} />
                      {isPaid ? `Lunas (${res.payment_method || "CASH"})` : "Belum Bayar"}
                      <span className="text-gray-400">• {formatPrice(Number(res.service_total))}</span>
                    </span>
                  </div>
                  <div className="flex gap-2 border-t border-gray-100 pt-2">
                    {res.reservation_status === "BOOKED" && (
                      <PrimaryButton className="flex-1" onClick={() => setActionRes(res)}>
                        {isPaid ? "Ubah Status" : "Bayar"}
                      </PrimaryButton>
                    )}
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
          <div className="overflow-x-auto overflow-y-auto no-scrollbar max-h-[calc(100vh-220px)] border border-gray-200 rounded-lg">
            <div className="min-w-[840px]">
              <div className="sticky top-0 z-30 flex border-b border-gray-200 bg-white shadow-sm">
                <div className="sticky left-0 z-40 w-14 shrink-0 bg-white" />
                {workerColumns.map((worker) => (
                  <div key={worker.id} className="flex-1 border-l border-gray-200 px-2 py-2 text-center">
                    <div className="truncate text-[11px] font-bold text-black">{worker.name}</div>
                  </div>
                ))}
              </div>
              <div className="relative flex">
                <div className="sticky left-0 z-20 w-14 shrink-0 border-r border-gray-100 bg-white pt-2">
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
                          const displayStatus = getDisplayStatus(res);
                          
                          return (
                            <button key={res.reservation_id} onClick={() => setSelectedRes(res)} className={cn("absolute right-1 left-1 overflow-hidden rounded-md border p-1.5 text-left transition active:scale-[0.98]", 
                              displayStatus === "BOOKED" && "border-black-200 bg-blue-50 text-blue-900 hover:bg-blue-100", 
                              displayStatus === "WALK IN" && "border-black-200 bg-green-50 text-green-900 hover:bg-green-100", 
                              displayStatus === "COMPLETED" && "border-white bg-black text-white hover:bg-gray-900", 
                              displayStatus === "CANCELLED" && "border-black-200 bg-red-50 text-red-500 opacity-60 line-through hover:bg-red-100"
                            )} style={{ top, height }}>
                              <div className="truncate text-[11px] font-bold">
                                {res.customer_name} <span className="font-medium opacity-70">({displayStatus})</span>
                              </div>
                              {height >= 40 && <div className="mt-0.5 truncate text-[10px] font-medium opacity-80">{res.start_time} • {res.service_names}</div>}
                              {height >= 54 && <div className={cn("mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase", (isPaid && displayStatus === "COMPLETED") ? "bg-white/20 text-white" : "border border-current opacity-70")}>{isPaid ? "Lunas" : "Belum Bayar"}</div>}
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
                <SecondaryButton onClick={() => setSelectedRes(null)}>Close</SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
      {actionRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActionRes(null)} />
          <div className="relative flex w-auto max-w-[95vw] flex-col gap-4 overflow-hidden rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex w-full items-center justify-between mb-2 gap-8">
              <h2 className="text-lg font-bold text-black">{paid(actionRes) ? "Ubah Status" : "Pilih Pembayaran"}</h2>
              <button onClick={() => setActionRes(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex flex-row gap-3 justify-center">
              {paid(actionRes) ? (
                <>
                  <button className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-black w-40 h-32 text-sm font-bold text-white transition active:scale-95" onClick={() => { handleSelesai(actionRes); setActionRes(null); }}>
                    <Icon name="check" className="h-10 w-10" />
                    <span>Selesai</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-red-500 bg-white w-40 h-32 text-sm font-bold text-red-500 transition active:scale-95" onClick={() => { handleCancel(actionRes); setActionRes(null); }}>
                    <Icon name="close" className="h-10 w-10" />
                    <span>Batalkan</span>
                  </button>
                </>
              ) : (
                <>
                  {actionRes.qr_string ? (
                    <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-black bg-white w-32 h-28 px-1 text-xs font-bold text-black transition active:scale-95 disabled:opacity-50" disabled={qrLoading} onClick={() => { openExistingQr(actionRes); setActionRes(null); }}>
                      <Icon name="qrcode" className="h-8 w-8" />
                      <span className="text-center leading-tight">Lihat QR</span>
                    </button>
                  ) : (
                    <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-black bg-white w-32 h-28 px-1 text-xs font-bold text-black transition active:scale-95 disabled:opacity-50" disabled={qrLoading} onClick={() => setConfirmAction({ type: "QRIS", res: actionRes })}>
                      <Icon name="qrcode" className="h-8 w-8" />
                      <span className="text-center leading-tight">{qrLoading ? "Memproses..." : "QRIS"}</span>
                    </button>
                  )}
                  <button className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-black w-32 h-28 px-1 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50" disabled={checkingOut} onClick={() => setConfirmAction({ type: "CASH", res: actionRes })}>
                    <Icon name="wallet" className="h-8 w-8" />
                    <span className="text-center leading-tight">{checkingOut ? "Memproses..." : "Cash"}</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-red-500 bg-white w-32 h-28 px-1 text-xs font-bold text-red-500 transition active:scale-95" onClick={() => setConfirmAction({ type: "CANCEL", res: actionRes })}>
                    <Icon name="close" className="h-8 w-8" />
                    <span className="text-center leading-tight">Batalkan<br/>Reservasi</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {qrRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => { stopQrPolling(); setQrRes(null); setQrString(""); setQrExpiresAt(0); setQrRemaining(""); }} />
          <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex w-full items-center justify-between">
              <h2 className="text-lg font-bold text-black">Scan QRIS</h2>
              <button onClick={() => { stopQrPolling(); setQrRes(null); setQrString(""); setQrExpiresAt(0); setQrRemaining(""); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            
            {qrError && (
              <div className="w-full rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">{qrError}</div>
            )}
            
            {/* QR CODE SECTION (AT TOP) */}
            <div className="flex items-center justify-center rounded-2xl border border-gray-200 p-4">
              {qrString ? (
                <QRCodeCanvas value={qrString} size={220} level="M" includeMargin />
              ) : (
                <div className="h-[220px] w-[220px] animate-pulse rounded-lg bg-gray-100" />
              )}
            </div>
            
            <div className="flex w-full items-center justify-center gap-2 text-xs font-medium text-gray-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-black" />
              Menunggu pembayaran...
            </div>
            {qrRemaining && qrRemaining !== "Kedaluwarsa" && (
              <p className="text-[11px] text-gray-400 -mt-2">Sisa waktu: {qrRemaining}</p>
            )}
            {qrRemaining === "Kedaluwarsa" && (
              <p className="text-[11px] font-semibold text-red-500 -mt-2">QRIS kedaluwarsa</p>
            )}
            
            {/* SERVICES SECTION (BELOW QR) */}
            <div className="w-full text-left bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
              <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Layanan</div>
              
              {/* List of individual services and prices */}
              <div className="flex flex-col gap-1.5 mb-2">
                {getServicePrices(qrRes.service_ids).length > 0 ? (
                  getServicePrices(qrRes.service_ids).map((svc, idx) => (
                    <div key={idx} className="flex justify-between text-[13px] text-gray-600">
                      <span>{svc.name}</span>
                      <span>{formatPrice(svc.price)}</span>
                    </div>
                  ))
                ) : (
                  // Fallback if services API hasn't loaded or ID mapping fails
                  <div className="flex justify-between text-[13px] text-gray-600">
                    <span>{qrRes.service_names}</span>
                    <span></span>
                  </div>
                )}
              </div>
              
              {/* Total price */}
              <div className="flex justify-between border-t border-gray-200 pt-2 border-dashed">
                <span className="text-sm font-bold text-black">Total</span>
                <span className="text-sm font-bold text-black">{formatPrice(Number(qrRes.service_total))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmAction(null)} />
          <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-black mb-2">
              <Icon name={confirmAction.type === "QRIS" ? "qrcode" : confirmAction.type === "CASH" ? "wallet" : "close"} className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-black">Konfirmasi {confirmAction.type === "CASH" ? "Pembayaran" : confirmAction.type === "QRIS" ? "QRIS" : "Pembatalan"}</h2>
            <p className="text-sm text-gray-500">
              {confirmAction.type === "CASH" && (
                <>Apakah Anda yakin ingin memproses pembayaran CASH untuk <strong>{confirmAction.res.customer_name}</strong>?</>
              )}
              {confirmAction.type === "QRIS" && (
                <>Generate kode QRIS untuk pembayaran <strong>{confirmAction.res.customer_name}</strong>?</>
              )}
              {confirmAction.type === "CANCEL" && (
                <>Apakah Anda yakin ingin membatalkan reservasi <strong>{confirmAction.res.customer_name}</strong>?</>
              )}
            </p>
            <div className="flex w-full gap-3 mt-2">
              <SecondaryButton className="flex-1" onClick={() => setConfirmAction(null)}>Kembali</SecondaryButton>
              <PrimaryButton 
                className={cn("flex-1", confirmAction.type === "CANCEL" && "bg-red-500 text-white")}
                onClick={() => {
                  const res = confirmAction.res;
                  const type = confirmAction.type;
                  setConfirmAction(null);
                  setActionRes(null);
                  if (type === "CASH") handleCheckout(res);
                  else if (type === "QRIS") handleBayarQRIS(res);
                  else if (type === "CANCEL") handleCancel(res);
                }}
              >
                Ya, Lanjutkan
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {qrisSuccessRes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setQrisSuccessRes(null)} />
          <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
              <Icon name="check" className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-black">Pembayaran Berhasil!</h2>
            <p className="text-sm text-gray-500">
              Pembayaran QRIS untuk pelanggan <strong>{qrisSuccessRes.customer_name}</strong> telah berhasil diselesaikan sejumlah <strong>{formatPrice(Number(qrisSuccessRes.service_total))}</strong>.
            </p>
            <div className="w-full mt-4">
              <PrimaryButton className="w-full" onClick={() => setQrisSuccessRes(null)}>
                Tutup
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
