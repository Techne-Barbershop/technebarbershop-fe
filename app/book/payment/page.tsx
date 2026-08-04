"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import { useBooking } from "@/context/BookingContext";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatPrice, sumPrices } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { PaymentMethodId } from "@/lib/types";

export default function PaymentMethodPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [selectedId, setSelectedId] = useState<PaymentMethodId | null>(
    state.paymentMethod?.id ?? null,
  );

  const totalPrice = sumPrices(state.services);

  const handleContinue = () => {
    const method = PAYMENT_METHODS.find((item) => item.id === selectedId);
    if (!method) return;
    dispatch({ type: "SET_PAYMENT", payload: method });
    router.push("/book/payment/instructions");
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <BackButton href="/book/confirm" />
        <div>
          <h1 className="text-[22px] font-bold text-ink">Payment Method</h1>
          <p className="text-[13px] text-graphite">
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
            disabled={!selectedId}
            className={cn(!selectedId && "cursor-not-allowed")}
          >
            Continue to Payment
          </PrimaryButton>
        </div>
      </BottomBar>
    </div>
  );
}
