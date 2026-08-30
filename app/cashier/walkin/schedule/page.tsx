"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api";
import { formatDuration } from "@/lib/utils/format";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import {
  getMonthMatrix,
  toISODate,
  todayISO,
  WEEKDAYS,
  MONTHS_LONG,
} from "@/lib/utils/availability";

interface Staff { user_id: string; name: string; role: string; image_url?: string }

export default function WalkinSchedulePage() {
  const router = useRouter();
  const params = useSearchParams();
  const serviceIds = params.get("services")?.split(",") ?? [];
  const totalDuration = Number(params.get("duration") ?? "45");
  const todayStr = todayISO();

  const [capster, setCapster] = useState("");
  const [date, setDate] = useState<string | null>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const cells = useMemo(() => getMonthMatrix(year, month), [year, month]);

  useEffect(() => {
    api<{ data: { staff: Staff[] } }>("/api/staff")
      .then((r) => setStaffList((r.data.staff || []).filter((s) => s.role === "CAPSTER")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!capster) return;
    api<{ data: { available_dates: string[] } }>(`/api/availability/month?worker_id=${capster}&year=${year}&month=${month + 1}`)
      .then((r) => setAvailableDates(r.data.available_dates || []))
      .catch(() => {});
  }, [capster, year, month]);

  useEffect(() => {
    if (!capster || !date) return;
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

  const getEndTime = () => {
    if (selectedIndex === -1) return null;
    const endIdx = selectedIndex + slotsNeeded;
    if (endIdx < slots.length) return slots[endIdx].time;
    // calculate manually if it exceeds slots
    const startSlot = slots[selectedIndex].time;
    const [h, m] = startSlot.split(":").map(Number);
    const totalMins = h * 60 + m + totalDuration;
    const endH = Math.floor(totalMins / 60);
    const endM = totalMins % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  };
  const reservationEnd = getEndTime();

  const canProceed = capster && date && selectedTime;

  const handleNext = () => {
    if (!canProceed) return;
    router.push(`/cashier/walkin/checkout?services=${serviceIds.join(",")}&duration=${totalDuration}&capster=${capster}&date=${date}&time=${selectedTime}`);
  };

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setDate(null);
    setSelectedTime(null);
  };

  const selectDate = (iso: string) => {
    setDate(iso);
    setSelectedTime(null);
  };

  const selectCapster = (id: string) => {
    setCapster(id);
    setDate(null);
    setSelectedTime(null);
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

      <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Kolom 1: Capster */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Capster</div>
          <div className="flex flex-col gap-3">
            {staffList.length === 0 ? (
              <p className="text-sm text-gray-400">Memuat kapster...</p>
            ) : (
              staffList.map((s) => {
                const isSelected = capster === s.user_id;
                return (
                  <div
                    key={s.user_id}
                    onClick={() => selectCapster(s.user_id)}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border text-left cursor-pointer transition active:scale-[0.99]",
                      isSelected
                        ? "border-black ring-2 ring-black ring-offset-1"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {s.image_url ? (
                      <img src={s.image_url} alt={s.name} className="aspect-[16/9] w-full object-cover" />
                    ) : (
                      <ImagePlaceholder
                        icon="user"
                        label={s.name}
                        className="aspect-[16/9] w-full bg-gray-100"
                        iconClassName="h-10 w-10 text-gray-400"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-2 right-2">
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full border-2 transition",
                          isSelected
                            ? "border-black bg-black text-white"
                            : "border-white/50 bg-white/20 text-transparent"
                        )}
                      >
                        <Icon name="check" className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-base font-bold text-white">
                          {s.name}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom 2: Tanggal */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Tanggal</div>
          {!capster ? (
            <p className="text-sm text-gray-400 text-center py-4">Pilih capster terlebih dahulu.</p>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-black transition active:scale-95"
                >
                  <Icon name="chevronLeft" className="h-4 w-4" />
                </button>
                <div className="text-[14px] font-bold text-black">
                  {MONTHS_LONG[month]} {year}
                </div>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 text-black transition active:scale-95"
                >
                  <Icon name="chevronRight" className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="flex items-center justify-center py-1 text-[11px] font-semibold text-gray-500"
                  >
                    {day}
                  </div>
                ))}
                {cells.map((cell, index) => {
                  if (!cell) return <div key={`empty-${index}`} />;
                  
                  const iso = toISODate(cell);
                  const available = availableDates.includes(iso);
                  const isSelected = date === iso;
                  const isPast = iso < todayStr;
                  const disabled = !available || isPast;
                  
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectDate(iso)}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-full text-[13px] transition",
                        isSelected
                          ? "bg-black font-bold text-white"
                          : disabled
                            ? "text-gray-300 outline outline-1 outline-gray-100 cursor-not-allowed"
                            : "text-black hover:bg-gray-100 active:scale-95",
                      )}
                    >
                      {cell.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Kolom 3: Waktu */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Waktu</div>
          {!capster || !date ? (
            <p className="text-sm text-gray-400 text-center py-4">Pilih tanggal terlebih dahulu.</p>
          ) : (
            <>
              {slots.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">Tidak ada jadwal tersedia.</p> : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot, i) => {
                      const inBlock = selectedIndex >= 0 && i >= selectedIndex && i < selectedIndex + slotsNeeded;
                      const isStart = selectedTime === slot.time;
                      const disabled = !slot.available || !canStartAt(i);
                      return (
                        <button 
                          key={slot.time} 
                          type="button" 
                          disabled={disabled} 
                          onClick={() => setSelectedTime(slot.time)} 
                          className={cn(
                            "relative rounded-lg py-2.5 text-[13px] font-semibold transition",
                            inBlock 
                              ? "bg-black text-white" 
                              : disabled 
                                ? "bg-gray-100 text-gray-300 cursor-not-allowed" 
                                : "border border-gray-200 bg-white text-black hover:bg-gray-50 active:scale-95"
                          )}
                        >
                          {slot.time}
                          {isStart && <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-black" />}
                        </button>
                      );
                    })}
                  </div>
                  {reservationEnd && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 text-center">
                      Sesi dari <strong className="text-black">{selectedTime}</strong> sampai <strong className="text-black">{reservationEnd}</strong> ({formatDuration(totalDuration)})
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-30 border-t border-gray-200 bg-white px-5 py-4">
        <button onClick={handleNext} disabled={!canProceed} className={cn("w-full rounded-xl py-3 text-sm font-bold transition", canProceed ? "bg-black text-white active:scale-95" : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
          Lanjut ke Ringkasan
        </button>
      </div>
    </div>
  );
}
