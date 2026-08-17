"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import BottomBar from "@/components/BottomBar";
import { PrimaryButton } from "@/components/Buttons";
import { useBooking } from "@/context/BookingContext";
import { cn } from "@/lib/utils/cn";

export default function OTPVerificationPage() {
  const router = useRouter();
  const { state, dispatch } = useBooking();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  useEffect(() => {
    if (!state.user || !state.user.email) {
      router.push("/book/details");
    }
  }, [state.user, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setResendCooldown(60);
      const res = await fetch("http://localhost:8080/api/auth/customer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.user?.email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to resend OTP");
      } else {
        setError(null);
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/auth/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.user?.email,
          otp: otp,
          name: state.user?.name,
          phone: state.user?.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        setLoading(false);
      } else {
        // Save the session token securely (for simplicity, using document.cookie or localStorage. we can use localStorage for this project)
        localStorage.setItem("customer_token", data.data.token);
        router.push("/book/confirm");
      }
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <BackButton href="/book/details" />
        <div>
          <h1 className="text-[22px] font-bold text-ink">Verify Email</h1>
          <p className="text-[13px] text-graphite">
            We sent a 6-digit code to {state.user?.email}
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-5">
        <div>
          <label
            htmlFor="otp"
            className="text-[13px] font-semibold text-ink"
          >
            OTP Code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className={cn(
              "mt-1.5 h-13 w-full rounded-xl border bg-paper px-4 text-center text-[20px] tracking-[0.5em] text-ink outline-none transition focus:border-ink placeholder:tracking-normal placeholder:text-smoke",
              error ? "border-ink" : "border-line"
            )}
          />
          {error && (
            <p className="mt-1.5 text-[12px] text-graphite italic">{error}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0}
          className="text-left text-[13px] font-semibold text-ink transition active:scale-95 disabled:text-graphite disabled:active:scale-100"
        >
          {resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : "Resend Code"}
        </button>
      </div>

      <BottomBar>
        <PrimaryButton onClick={handleVerify} disabled={loading || otp.length !== 6}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}
