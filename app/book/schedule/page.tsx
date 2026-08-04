"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import { useBooking } from "@/context/BookingContext";
import {
  formatDateID,
  getMonthMatrix,
  getTimeSlots,
  isDateAvailable,
  toISODate,
  todayISO,
  WEEKDAYS,
  MONTHS_LONG,
} from "@/lib/availability";
import {
  addMinutes,
  formatDuration,
  sumDurations,
} from "@/lib/format";
import { cn } from "@/lib/cn";

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
  const slotsNeeded = Math.max(1, Math.ceil(totalDuration / 30));

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

  const slots = selectedDate ? getTimeSlots(artist.id, selectedDate) : [];

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

  const handleCheckout = () => {
    if (!selectedDate || !selectedTime) return;
    dispatch({
      type: "SET_DATETIME",
      payload: { date: selectedDate, time: selectedTime },
    });
    router.push("/book/details");
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
            const available = isDateAvailable(artist.id, iso);
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
            <div className="mt-1 text-[12.5px] text-graphite">
              Service Duration: {formatDuration(totalDuration)} ·{" "}
              {slotsNeeded} × 30 min
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
              <p className="mt-3 text-[12px] font-medium text-graphite">
                Reserved: {selectedTime} – {reservationEnd} ·{" "}
                {formatDuration(totalDuration)}
              </p>
            ) : (
              <p className="mt-3 text-[11.5px] text-graphite">
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
          disabled={!canCheckout}
          className={cn(!canCheckout && "cursor-not-allowed")}
        >
          Checkout
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}
