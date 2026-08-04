"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import { useBooking } from "@/context/BookingContext";
import { STORE } from "@/lib/constants";
import { formatDateID } from "@/lib/utils/availability";
import { formatDuration, formatPrice, sumDurations, sumPrices } from "@/lib/utils/format";
import type { BookingState } from "@/lib/types";

type Status = "idle" | "submitting" | "success";

function buildPaymentPayload(state: BookingState, totalPrice: number) {
  return {
    bookingId: `HN-${Date.now()}`,
    store: { name: STORE.name, location: STORE.location },
    services: state.services.map((service) => ({
      id: service.id,
      title: service.title,
      durationMinutes: service.durationMinutes,
      price: service.price,
    })),
    artist: state.artist
      ? { id: state.artist.id, name: state.artist.name }
      : null,
    schedule: {
      date: state.date,
      time: state.time,
      formattedDate: state.date ? formatDateID(state.date) : null,
    },
    customer: state.user
      ? {
          name: state.user.name,
          phone: state.user.phone,
          email: state.user.email,
        }
      : null,
    total: totalPrice,
    payment: {
      method: state.paymentMethod?.id ?? null,
      channel: state.paymentMethod?.name ?? null,
      status: "pending",
    },
  };
}

function QrFinder({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width={7} height={7} fill="#ffffff" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#000000" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#ffffff" />
    </>
  );
}

function QrPattern({ className }: { className?: string }) {
  const size = 21;
  const modules: { x: number; y: number }[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inFinder =
        (x < 7 && y < 7) ||
        (x >= size - 7 && y < 7) ||
        (x < 7 && y >= size - 7);
      if (inFinder) continue;
      const value =
        Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      if (value > 0.5) modules.push({ x, y });
    }
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true">
      <rect width={size} height={size} fill="#ffffff" />
      {modules.map((m) => (
        <rect
          key={`${m.x}-${m.y}`}
          x={m.x}
          y={m.y}
          width={1}
          height={1}
          fill="#000000"
        />
      ))}
      <QrFinder x={0} y={0} />
      <QrFinder x={size - 7} y={0} />
      <QrFinder x={0} y={size - 7} />
    </svg>
  );
}

export default function PaymentInstructionsPage() {
  const router = useRouter();
  const { state, reset } = useBooking();
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);

  const method = state.paymentMethod;
  const services = state.services;
  const totalPrice = sumPrices(services);
  const totalDuration = sumDurations(services);

  const handleCopy = async () => {
    if (!method) return;
    try {
      await navigator.clipboard.writeText(method.detail.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleComplete = () => {
    if (status !== "idle") return;
    setStatus("submitting");
    const payload = buildPaymentPayload(state, totalPrice);
    console.log(
      "[Booking] Final payload to backend / Midtrans:",
      JSON.stringify(payload, null, 2),
    );
    setTimeout(() => setStatus("success"), 1500);
  };

  const handleDone = () => {
    reset();
    router.push("/");
  };

  if (!method) {
    return (
      <div className="flex flex-col items-center gap-4 pt-16 text-center">
        <p className="text-[14px] text-graphite">
          Please choose a payment method first.
        </p>
        <PrimaryButton onClick={() => router.push("/book/payment")}>
          Choose Payment Method
        </PrimaryButton>
      </div>
    );
  }

  const isQris = method.id === "qris";

  return (
    <div>
      <div className="flex items-center gap-4">
        <BackButton href="/book/payment" />
        <div>
          <h1 className="text-[22px] font-bold text-ink">Payment</h1>
          <p className="text-[13px] text-graphite">
            {method.name} · {formatPrice(totalPrice)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <div className="rounded-3xl border border-line bg-paper p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-mist text-ink">
              <Icon name={method.icon} className="h-5.5 w-5.5" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-ink">{method.name}</div>
              <div className="text-[12.5px] text-graphite">
                {method.description}
              </div>
            </div>
          </div>

          {isQris ? (
            <div className="mt-5 flex flex-col items-center">
              <div className="rounded-2xl border-2 border-ink p-3">
                <QrPattern className="h-52 w-52" />
              </div>
              <p className="mt-3 text-[11.5px] text-graphite">
                {method.detail.value}
              </p>
            </div>
          ) : (
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-line bg-mist px-4 py-3.5">
              <div>
                <div className="text-[11px] font-semibold text-graphite uppercase tracking-wide">
                  {method.detail.label}
                </div>
                <div className="mt-0.5 font-mono text-[15px] font-bold text-ink">
                  {method.detail.value}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy payment number"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink text-ink transition active:scale-90"
              >
                <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-paper p-5">
          <h2 className="text-[13px] font-bold tracking-[0.15em] text-ink uppercase">
            Payment Steps
          </h2>
          <ol className="mt-3 flex flex-col gap-3">
            {method.steps.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-[13px] leading-relaxed text-graphite">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between rounded-3xl border border-line bg-paper px-5 py-4">
          <div>
            <div className="text-[12px] text-graphite">
              {services.length} service{services.length === 1 ? "" : "s"} ·{" "}
              {formatDuration(totalDuration)}
            </div>
            <div className="text-[13px] font-semibold text-ink">
              {services.map((service) => service.title).join(" + ")}
            </div>
          </div>
          <div className="text-[17px] font-bold text-ink">
            {formatPrice(totalPrice)}
          </div>
        </div>
      </div>

      <BottomBar>
        <PrimaryButton
          onClick={handleComplete}
          disabled={status !== "idle"}
          className={status !== "idle" ? "cursor-wait" : undefined}
        >
          {status === "submitting" ? "Processing..." : "Complete Payment"}
        </PrimaryButton>
      </BottomBar>

      {status !== "idle" ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="animate-fade-in absolute inset-0 bg-black/50" />
          <div className="animate-sheet-up relative w-full max-w-md rounded-t-3xl bg-paper px-6 py-8 sm:rounded-3xl">
            {status === "submitting" ? (
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-ink text-paper">
                  <Icon name="clock" className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-[19px] font-bold text-ink">
                  Verifying Payment…
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-graphite">
                  Checking payment via {method.name}. This would normally be
                  confirmed by the Midtrans backend.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-paper">
                  <Icon name="check" className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-[19px] font-bold text-ink">
                  Booking Confirmed!
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-graphite">
                  Your payment was received (simulated). We&apos;ve sent your
                  booking details to {state.user?.email ?? "your email"}. See
                  you at {STORE.name}!
                </p>
                <PrimaryButton onClick={handleDone} className="mt-6">
                  Done
                </PrimaryButton>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
