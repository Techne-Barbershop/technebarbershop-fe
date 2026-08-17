"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import { useBooking } from "@/context/BookingContext";
import {
  formatDateID,
  getMonthMatrix,
  toISODate,
  todayISO,
  WEEKDAYS,
  MONTHS_LONG,
} from "@/lib/utils/availability";
import {
  addMinutes,
  formatDuration,
  sumDurations,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default function SchedulePage() {
  const router = useRouter();
  const { state, dispatch, reset } = useBooking();
  const artist = state.artist;
  const services = state.services;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(state.date);
  const [selectedTime, setSelectedTime] = useState<string | null>(state.time);

  const cells = useMemo(() => getMonthMatrix(year, month), [year, month]);

  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!artist) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/availability/month?worker_id=${artist.id}&year=${year}&month=${month + 1}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableDates(data.data?.available_dates || []);
      })
      .catch((err) => console.error(err));
  }, [artist, year, month]);

  useEffect(() => {
    if (!artist || !selectedDate) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/availability/day?worker_id=${artist.id}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.data?.slots || []);
      })
      .catch((err) => console.error(err));
  }, [artist, selectedDate]);

  if (!artist) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <p className="text-[14px] text-graphite">
          Please choose a hair artist first.
        </p>
        <PrimaryButton onClick={() => router.push("/book/artists")}>
          Select Artist
        </PrimaryButton>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <p className="text-[14px] text-graphite">
          Please select at least one service first.
        </p>
        <PrimaryButton onClick={() => router.push("/book")}>
          Choose Services
        </PrimaryButton>
      </div>
    );
  }

  const totalDuration = sumDurations(services);
  const slotsNeeded = Math.max(1, Math.ceil(totalDuration / 15));

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const selectDate = (iso: string) => {
    setSelectedDate(iso);
    setSelectedTime(null);
  };

  // slots are now fetched via useEffect

  const canStartAt = (index: number) => {
    if (index + slotsNeeded > slots.length) return false;
    for (let i = index; i < index + slotsNeeded; i += 1) {
      if (!slots[i].available) return false;
    }
    return true;
  };

  const selectedIndex = selectedTime
    ? slots.findIndex((slot) => slot.time === selectedTime)
    : -1;

  const reservationEnd =
    selectedTime != null ? addMinutes(selectedTime, totalDuration) : null;

  const canCheckout = Boolean(selectedDate && selectedTime);

  const handleCheckout = async () => {
    if (!selectedDate || !selectedTime) return;
    setChecking(true);

    try {
      const res = await fetch("http://localhost:8080/api/reservations/check-slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capster_id: artist.id,
          service_ids: services.map((service) => service.service_id),
          booking_date: selectedDate,
          start_time: selectedTime,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to check slot");
      }

      const data = await res.json();
      if (!data.data?.available) {
        alert("Maaf, jadwal ini baru saja diambil oleh pelanggan lain. Silakan pilih waktu lain.");
        setChecking(false);
        // Refresh slot data
        window.location.reload();
        return;
      }

      dispatch({
        type: "SET_DATETIME",
        payload: { date: selectedDate, time: selectedTime },
      });
      
      if (state.user) {
        router.push("/book/confirm");
      } else {
        router.push("/book/details");
      }
    } catch (err) {
      console.error("Slot check error:", err);
      alert("Terjadi kesalahan saat memeriksa ketersediaan jadwal.");
      setChecking(false);
    }
  };

  const handleCancel = () => {
    reset();
    router.push("/");
  };

  const today = todayISO();

  return (
    <div>
      <div className="flex items-center gap-4">
        <BackButton href="/book/artists" />
        <div className="min-w-0">
          <h1 className="truncate text-[20px] font-bold text-ink">
            Pick Schedule with {artist.name}
          </h1>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-paper p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper text-ink transition active:scale-95"
          >
            <Icon name="chevronLeft" className="h-4.5 w-4.5" />
          </button>
          <div className="text-[15px] font-bold text-ink">
            {MONTHS_LONG[month]} {year}
          </div>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper text-ink transition active:scale-95"
          >
            <Icon name="chevronRight" className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center py-1 text-[11px] font-semibold text-graphite"
            >
              {day}
            </div>
          ))}
          {cells.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} />;
            }
            const iso = toISODate(cell);
            const available = availableDates.includes(iso);
            const isSelected = selectedDate === iso;
            const isPast = iso < today;
            const disabled = !available || isPast;
            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => selectDate(iso)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-full text-[13px] transition active:scale-95",
                  isSelected
                    ? "bg-ink font-bold text-paper"
                    : disabled
                      ? "text-smoke outline outline-1 outline-fog"
                      : "text-ink hover:bg-mist",
                )}
              >
                {cell.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[12.5px] text-graphite italic">
          Please select the booking date &amp; time.
        </p>

        {selectedDate ? (
          <div className="animate-fade-in mt-5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[17px] font-bold text-ink">Choose Time</h2>
              <span className="text-[12.5px] text-graphite">
                {formatDateID(selectedDate)}
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-1.5 rounded-xl border border-line p-3 text-[12.5px] text-graphite">
              {services.map((svc) => (
                <div key={svc.service_id} className="flex items-center justify-between">
                  <span>{svc.name}</span>
                  <span>{formatDuration(svc.duration_minutes)}</span>
                </div>
              ))}
              <div className="mt-1 flex items-center justify-between border-t border-line pt-2 font-bold text-ink">
                <span>Total Duration</span>
                <span>{formatDuration(totalDuration)}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {slots.map((slot, index) => {
                const inBlock =
                  selectedIndex >= 0 &&
                  index >= selectedIndex &&
                  index < selectedIndex + slotsNeeded;
                const isStart = selectedTime === slot.time;
                const disabled = !slot.available || !canStartAt(index);
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedTime(slot.time)}
                    className={cn(
                      "relative rounded-full py-2.5 text-[13px] font-semibold transition active:scale-95",
                      inBlock
                        ? "bg-ink text-paper"
                        : disabled
                          ? "bg-fog text-smoke"
                          : "border border-line bg-paper text-ink hover:bg-mist",
                    )}
                  >
                    {slot.time}
                    {isStart ? (
                      <span className="absolute -top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ink" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {reservationEnd ? (
              <div className="mt-4 rounded-xl border border-line bg-paper p-3 text-graphite">
                <p className="text-[12.5px] leading-relaxed">
                  Your session starts at <strong className="text-ink">{selectedTime}</strong> and will finish exactly at <strong className="text-ink">{reservationEnd}</strong>.
                </p>
                <p className="mt-1 text-[11px] italic">
                  *The highlighted blocks represent the {formatDuration(totalDuration)} needed for your services.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-[11.5px] text-graphite">
                Tap a start time — the full block of{" "}
                {formatDuration(totalDuration)} will be highlighted.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <BottomBar>
        <SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>
        <PrimaryButton
          onClick={handleCheckout}
          disabled={!canCheckout || checking}
          className={cn(!canCheckout && "cursor-not-allowed")}
        >
          Checkout
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}
