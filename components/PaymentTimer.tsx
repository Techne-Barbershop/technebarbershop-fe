"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { API_URL } from "@/lib/api";
import { Icon } from "@/components/icons";

export default function PaymentTimer() {
  const { state, reset } = useBooking();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!state.expiresAt) return;

    const target = new Date(state.expiresAt).getTime();

    let expiredHandled = false;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.floor((target - now) / 1000);
      
      if (diff <= 0) {
        if (expiredHandled) return;
        expiredHandled = true;
        clearInterval(interval);
        setTimeLeft(0);
        if (state.reservationId) {
          const token = localStorage.getItem("customer_token");
          fetch(`${API_URL}/api/reservations/${state.reservationId}/cancel`, {
            method: "PATCH",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }).catch(() => {});
        }
        alert("Waktu pembayaran telah habis (maksimal 3 menit). Reservasi dan QRIS Anda otomatis dibatalkan.");
        reset();
        router.push("/");
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    const initialDiff = Math.floor((target - new Date().getTime()) / 1000);
    setTimeLeft(Math.max(0, initialDiff));

    return () => clearInterval(interval);
  }, [state.expiresAt, state.reservationId, reset, router]);

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
