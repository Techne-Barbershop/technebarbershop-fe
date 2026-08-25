"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/utils/format";

interface Staff { user_id: string; name: string; role: string }

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WalkinSchedulePage() {
  const router = useRouter();
  const params = useSearchParams();
  const serviceIds = params.get("services")?.split(",") ?? [];
  const totalDuration = Number(params.get("duration") ?? "45");
  const todayStr = toISODate(new Date());

  const [capster, setCapster] = useState("");
  const [date, setDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  useEffect(() => {
    api<{ data: { staff: Staff[] } }>("/api/staff")
      .then((r) => setStaffList((r.data.staff || []).filter((s) => s.role === "CAPSTER")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!capster) return;
    const [y, m] = date.split("-");
    api<{ data: { available_dates: string[] } }>(`/api/availability/month?worker_id=${capster}&year=${y}&month=${m}`)
      .then((r) => setAvailableDates(r.data.available_dates || []))
      .catch(() => {});
  }, [capster, date]);

  useEffect(() => {
    if (!capster) return;
    api<{ data: { slots: { time: string; available: boolean }[] } }>(`/api/availability/day?worker_id=${capster}&date=${date}`)
      .then((r) => { setSlots(r.data.slots || []); setSelectedTime(null); })
      .catch(() => { setSlots([]); setSelectedTime(null); });
  }, [capster, date]);

  const slotsNeeded = Math.max(1, Math.ceil(totalDuration / 15));
  const selectedIndex = selectedTime ? slots.findIndex((s) => s.time === selectedTime) : -1;

  const canStartAt = (i: number) => {
    if (i + slotsNeeded > slots.length) return false;
    for (let j = i; j < i + slotsNeeded; j++) if (!slots[j].available) return false;
    return true;
  };

  const reservationEnd = selectedTime ? (() => {
    const [h, m] = selectedTime.split(":").map(Number);
    const t = h * 60 + m + totalDuration;
    return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  })() : null;

  const canProceed = selectedTime !== null && capster !== "";

  const handleNext = () => {
    if (!canProceed) return;
    router.push(`/cashier/walkin/checkout?services=${serviceIds.join(",")}&duration=${totalDuration}&capster=${capster}&date=${date}&time=${selectedTime}`);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24">
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-4">
          <Link href="/cashier/walkin" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Icon name="arrowLeft" className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-black">Pilih Jadwal</h1>
            <p className="text-sm text-gray-500">Pilih capster dan waktu.</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Capster</div>
          <select value={capster} onChange={(e) => setCapster(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black">
            <option value="">Pilih capster</option>
            {staffList.map((s) => <option key={s.user_id} value={s.user_id}>{s.name}</option>)}
          </select>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Tanggal</div>
          <input type="date" value={date} min={todayStr} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black" />
          {availableDates.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {availableDates.slice(0, 6).map((d) => (
                <button key={d} type="button" onClick={() => setDate(d)} className={cn("rounded-md px-2 py-1 text-[11px] font-semibold transition", date === d ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                  {new Date(d + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </button>
              ))}
            </div>
          )}
        </div>

        {capster && date && (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Waktu</div>
            {slots.length === 0 ? <p className="text-xs text-gray-400">Memuat jadwal...</p> : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot, i) => {
                    const inBlock = selectedIndex >= 0 && i >= selectedIndex && i < selectedIndex + slotsNeeded;
                    const isStart = selectedTime === slot.time;
                    const disabled = !slot.available || !canStartAt(i);
                    return (
                      <button key={slot.time} type="button" disabled={disabled} onClick={() => setSelectedTime(slot.time)} className={cn("relative rounded-lg py-2 text-[13px] font-semibold transition", inBlock ? "bg-black text-white" : disabled ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "border border-gray-200 bg-white text-black hover:bg-gray-50")}>
                        {slot.time}
                        {isStart && <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-black" />}
                      </button>
                    );
                  })}
                </div>
                {reservationEnd && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    Sesi dari <strong className="text-black">{selectedTime}</strong> sampai <strong className="text-black">{reservationEnd}</strong> ({formatDuration(totalDuration)})
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white px-5 py-4">
        <button onClick={handleNext} disabled={!canProceed} className={cn("w-full rounded-xl py-3 text-sm font-bold transition active:scale-95", canProceed ? "bg-black text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
          Lanjut ke Ringkasan
        </button>
      </div>
    </div>
  );
}
