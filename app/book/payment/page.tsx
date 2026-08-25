"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import { useBooking } from "@/context/BookingContext";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatPrice, sumPrices, sumDurations } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { PaymentMethodId } from "@/lib/types";

export default function PaymentMethodPage() {
  const router = useRouter();
  const { state, dispatch, reset } = useBooking();
  const [selectedId, setSelectedId] = useState<PaymentMethodId | "counter" | null>(
    state.paymentMethod?.id ?? null,
  );

  const totalPrice = sumPrices(state.services);

  const [submitting, setSubmitting] = useState(false);
  const [counterDone, setCounterDone] = useState(false);

  const handleContinue = async () => {
    if (!selectedId || submitting) return;
    setSubmitting(true);

    const token = localStorage.getItem("customer_token");

    if (selectedId === "counter") {
      try {
        const res = await fetch("http://localhost:8080/api/reservations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            capster_id: state.artist?.id,
            service_ids: state.services.map((s) => s.service_id),
            booking_date: state.date,
            start_time: state.time,
            duration_minutes: sumDurations(state.services),
            notes: "Bayar di Tempat",
            pay_at_counter: true,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal membuat reservasi.");
        }

        setCounterDone(true);
      } catch (err: any) {
        alert(err.message);
        setSubmitting(false);
      }
      return;
    }

    const method = PAYMENT_METHODS.find((item) => item.id === selectedId);
    if (!method) return;

    try {
      const res = await fetch("http://localhost:8080/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          capster_id: state.artist?.id,
          service_ids: state.services.map((s) => s.service_id),
          booking_date: state.date,
          start_time: state.time,
          duration_minutes: sumDurations(state.services),
          notes: `Payment Method: ${method.name}`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal membuat reservasi. Jadwal mungkin telah diambil orang lain.");
      }

      const resData = await res.json();

      dispatch({
        type: "SET_RESERVATION",
        payload: {
          id: resData.data.reservation_id,
          expiresAt: resData.data.expires_at,
        },
      });

      dispatch({ type: "SET_PAYMENT", payload: method });
      router.push("/book/payment/instructions");
    } catch (err: any) {
      alert(err.message);
      setSubmitting(false);
      router.push("/book/schedule");
    }
  };

  const handleDone = () => {
    reset();
    router.push("/");
  };

  if (counterDone) {
    return (
      <div>
        <div className="mt-10 flex flex-col items-center px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-paper">
            <Icon name="check" className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-[22px] font-bold text-ink">Booking Confirmed!</h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-graphite">
            Pembayaran akan dilakukan di kasir. Silakan datang ke counter Techne
            pada waktu yang dipilih dan selesaikan pembayaran di sana.
          </p>
          <PrimaryButton onClick={handleDone} className="mt-8">
            Done
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <BackButton href="/book/confirm" />
        <div>
          <h1 className="text-[22px] font-bold text-ink">Payment Method</h1>
          <p className="text-[13px] text-graphite mt-1">
            Choose how you&apos;d like to pay for your booking.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedId === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedId(method.id)}
              className={cn(
                "flex items-center gap-4 rounded-2xl border bg-paper p-4 text-left transition active:bg-mist",
                isSelected
                  ? "border-ink ring-2 ring-ink ring-offset-1"
                  : "border-line",
              )}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-mist text-ink">
                <Icon name={method.icon} className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-bold text-ink">
                  {method.name}
                </div>
                <div className="mt-0.5 text-[12.5px] leading-relaxed text-graphite">
                  {method.description}
                </div>
              </div>
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
                  isSelected
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-transparent",
                )}
              >
                <Icon name="check" className="h-3.5 w-3.5" />
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setSelectedId("counter")}
          className={cn(
            "flex items-center gap-4 rounded-2xl border bg-paper p-4 text-left transition active:bg-mist",
            selectedId === "counter"
              ? "border-ink ring-2 ring-ink ring-offset-1"
              : "border-line",
          )}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-mist text-ink">
            <Icon name="box" className="h-5.5 w-5.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold text-ink">
              Bayar di Tempat
            </div>
            <div className="mt-0.5 text-[12.5px] leading-relaxed text-graphite">
              Selesaikan pembayaran tunai atau non-tunai langsung di kasir counter.
            </div>
          </div>
          <div
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
              selectedId === "counter"
                ? "border-ink bg-ink text-paper"
                : "border-line text-transparent",
            )}
          >
            <Icon name="check" className="h-3.5 w-3.5" />
          </div>
        </button>
      </div>

      <BottomBar>
        <div className="flex w-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-graphite">Total to pay</span>
            <span className="text-[16px] font-bold text-ink">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <PrimaryButton
            onClick={handleContinue}
            disabled={!selectedId || submitting}
            className={cn((!selectedId || submitting) && "cursor-not-allowed")}
          >
            {submitting ? "Processing..." : "Confirm Booking"}
          </PrimaryButton>
        </div>
      </BottomBar>
    </div>
  );
}