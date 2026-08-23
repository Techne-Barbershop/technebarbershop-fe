"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import PaymentTimer from "@/components/PaymentTimer";
import { PrimaryButton } from "@/components/Buttons";
import { Icon } from "@/components/icons";
import { useBooking } from "@/context/BookingContext";
import { STORE } from "@/lib/constants";
import { formatDuration, formatPrice, sumDurations, sumPrices } from "@/lib/utils/format";
import { QRCodeSVG } from "qrcode.react";

type Status = "idle" | "submitting" | "success";

export default function PaymentInstructionsPage() {
  const router = useRouter();
  const { state, reset, dispatch } = useBooking();
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  const [qrString, setQrString] = useState<string | null>(null);

  const method = state.paymentMethod;
  const services = state.services;
  const totalPrice = sumPrices(services);
  const totalDuration = sumDurations(services);
  const isQris = method?.id === "qris";

  useEffect(() => {
    if (!state.reservationId || !isQris) return;

    let isMounted = true;
    const fetchQR = async () => {
      try {
        const token = localStorage.getItem("customer_token");
        const res = await fetch(`http://localhost:8080/api/reservations/${state.reservationId}/payment/qris`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        if (!res.ok) throw new Error("Failed to load QR");
        const data = await res.json();
        if (isMounted) setQrString(data.data.qr_string);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQR();
    
    // Polling interval
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("customer_token");
        const res = await fetch(`http://localhost:8080/api/reservations/${state.reservationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await res.json();
        
        // Cek jika response sukses dan status berubah
        if (meData?.data?.status) {
          if (meData.data.status === "BOOKED" || meData.data.status === "COMPLETED") {
            setStatus("success");
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [state.reservationId, isQris]);

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

  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!state.reservationId) {
      router.push("/");
      return;
    }
    
    if (!confirm("Yakin ingin membatalkan reservasi ini?")) return;
    
    setCancelling(true);
    try {
      const token = localStorage.getItem("customer_token");
      await fetch(`http://localhost:8080/api/reservations/${state.reservationId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch({ type: "RESET" });
      router.push("/");
    } catch (e) {
      alert("Gagal membatalkan");
      setCancelling(false);
    }
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

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[22px] font-bold text-ink">Payment</h1>
        <PaymentTimer />
      </div>

      <div className="mt-1">
        <p className="text-[13px] text-graphite">
          {method.name} · {formatPrice(totalPrice)}
        </p>
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
              <div className="rounded-2xl border-2 border-ink p-3 bg-white flex items-center justify-center h-52 w-52">
                {qrString ? (
                  <QRCodeSVG value={qrString} size={180} />
                ) : (
                  <span className="text-graphite text-xs animate-pulse">Memuat QR...</span>
                )}
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
              {services.map((service) => service.name).join(" + ")}
            </div>
          </div>
          <div className="text-[17px] font-bold text-ink">
            {formatPrice(totalPrice)}
          </div>
        </div>
      </div>

      <BottomBar>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleCancel}
            disabled={cancelling || status !== "idle"}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 text-[15px] font-bold text-red-600 transition active:scale-[0.99] disabled:opacity-50"
          >
            {cancelling ? "Membatalkan..." : "Batalkan Reservasi"}
          </button>
        </div>
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
                  Your payment was received. We&apos;ve sent your
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
