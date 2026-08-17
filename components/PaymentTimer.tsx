"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { Icon } from "@/components/icons";

export default function PaymentTimer() {
  const { state, reset } = useBooking();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!state.expiresAt) return;

    const target = new Date(state.expiresAt).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.floor((target - now) / 1000);
      
      if (diff <= 0) {
        setTimeLeft(0);
        alert("Waktu pembayaran telah habis. Reservasi Anda otomatis dibatalkan.");
        reset();
        router.push("/");
      } else {
        setTimeLeft(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [state.expiresAt, reset, router]);

  if (!state.expiresAt) return null;

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-red-600">
      <Icon name="clock" className="h-4 w-4" />
      <span className="text-[13px] font-bold tabular-nums">
        {m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
