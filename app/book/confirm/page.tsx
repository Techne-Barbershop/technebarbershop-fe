"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { useBooking } from "@/context/BookingContext";
import { STORE } from "@/lib/constants";
import { formatDateID } from "@/lib/utils/availability";
import {
  addMinutes,
  formatDuration,
  formatPrice,
  sumDurations,
  sumPrices,
} from "@/lib/utils/format";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const { state } = useBooking();
  const [copied, setCopied] = useState(false);

  const { services, artist, date, time, user } = state;

  const totalDuration = sumDurations(services);
  const totalPrice = sumPrices(services);
  const reservationEnd = time != null ? addMinutes(time, totalDuration) : null;

  const handleCopyPhone = async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (services.length === 0 || !artist || !user || !date || !time) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <p className="text-[14px] text-graphite">
          Your booking details are incomplete. Please restart the booking flow.
        </p>
        <PrimaryButton onClick={() => router.push("/")}>Start Over</PrimaryButton>
      </div>
    );
  }

  const rows: { label: string; value: string; copy?: boolean }[] = [
    { label: "Date", value: formatDateID(date) },
    { label: "Time", value: `${time} – ${reservationEnd ?? ""}` },
    { label: "Name", value: user.name },
    { label: "Phone", value: user.phone, copy: true },
    { label: "Email", value: user.email },
    { label: "Store Location", value: STORE.location },
    { label: "Hair Artist", value: artist.name },
  ];

  return (
    <div>
      <div className="flex items-center gap-4">
        <BackButton href="/book/details" />
        <h1 className="text-[18px] font-bold text-ink">
          BOOKING CONFIRMATION
        </h1>
      </div>

      <div className="mt-6 rounded-3xl border border-fog bg-paper p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-3.5">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-4"
            >
              <span className="text-[13px] text-graphite">{row.label}</span>
              <span className="flex items-center gap-2 text-right text-[13.5px] font-bold text-ink">
                {row.value}
                {row.copy ? (
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    aria-label="Copy phone number"
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-ink text-ink transition active:scale-90"
                  >
                    <Icon
                      name={copied ? "check" : "copy"}
                      className="h-3.5 w-3.5"
                    />
                  </button>
                ) : null}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <div className="flex flex-col gap-3.5">
            {services.map((service) => (
              <div key={service.id} className="flex items-center gap-3.5">
                <ImagePlaceholder
                  icon="scissors"
                  className="h-12 w-12 shrink-0 rounded-full border border-line"
                  iconClassName="h-5 w-5"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-bold text-ink">
                    {service.title}
                  </div>
                  <div className="mt-0.5 text-[12px] text-graphite">
                    {formatDuration(service.durationMinutes)}
                  </div>
                </div>
                <div className="text-[14px] font-bold text-ink">
                  {formatPrice(service.price)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
            <span className="text-[13px] font-semibold text-graphite">
              Total · {formatDuration(totalDuration)}
            </span>
            <span className="text-[16px] font-bold text-ink">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11.5px] leading-relaxed text-graphite">
        *The listed price is only the base price of the services. The final
        price may vary depending on the artist&apos;s rate and any add-ons
        requested.
      </p>

      <BottomBar>
        <PrimaryButton onClick={() => router.push("/book/payment")}>
          Confirm Booking
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}
