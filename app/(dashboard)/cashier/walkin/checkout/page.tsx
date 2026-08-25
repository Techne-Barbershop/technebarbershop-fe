"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api";
import { formatDuration, formatPrice } from "@/lib/utils/format";

interface Service { service_id: string; name: string; duration_minutes: number; price: string }

export default function WalkinCheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const serviceIds = params.get("services")?.split(",") ?? [];
  const totalDuration = Number(params.get("duration") ?? "45");
  const capsterId = params.get("capster") ?? "";
  const date = params.get("date") ?? "";
  const time = params.get("time") ?? "";

  const [services, setServices] = useState<Service[]>([]);
  const [capsterName, setCapsterName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api<{ data: { categories: { services: Service[] }[] } }>("/api/categories").then((r) => {
      const all = (r.data.categories || []).flatMap((c) => c.services);
      setServices(all);
    });
    api<{ data: { staff: { user_id: string; name: string }[] } }>("/api/staff").then((r) => {
      const c = (r.data.staff || []).find((s) => s.user_id === capsterId);
      if (c) setCapsterName(c.name);
    });
  }, [capsterId]);

  if (!serviceIds.length || !date || !time || !capsterId) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-sm text-gray-500">Data walk-in tidak lengkap. Silakan ulangi dari awal.</p>
        <Link href="/cashier/walkin" className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white">
          Kembali
        </Link>
      </div>
    );
  }

  const selectedServices = services.filter((s) => serviceIds.includes(s.service_id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

  const reservationEnd = time ? (() => {
    const [h, m] = time.split(":").map(Number);
    const t = h * 60 + m + totalDuration;
    return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  })() : "";

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await api("/api/cashier/walkin", {
        method: "POST",
        body: { service_ids: serviceIds, capster_id: capsterId, booking_date: date, start_time: time },
      });
      router.push("/cashier");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal membuat walk-in");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24">
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-4">
          <Link href="/cashier/walkin/schedule" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Icon name="arrowLeft" className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-black">Ringkasan Walk In</h1>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Layanan</h3>
          {selectedServices.map((s) => (
            <div key={s.service_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <div className="text-sm font-bold text-black">{s.name}</div>
                <div className="text-xs text-gray-500">{formatDuration(s.duration_minutes)}</div>
              </div>
              <div className="text-sm font-bold text-black">{formatPrice(Number(s.price))}</div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200">
            <span className="text-sm font-bold text-black">Total</span>
            <span className="text-sm font-bold text-black">{formatPrice(totalPrice)} · {formatDuration(totalDuration)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Detail</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Capster</span><span className="font-semibold text-black">{capsterName || capsterId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span className="font-semibold text-black">{date}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Waktu</span><span className="font-semibold text-black">{time} – {reservationEnd}</span></div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs text-gray-500">
            Walk-in akan dibuat sebagai sesi <span className="font-semibold text-black">Booked</span>. Pembayaran dilakukan di kasir (Bayar di Tempat / Bayar QRIS) setelah sesi dibuat.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white px-5 py-4">
        <button onClick={handleConfirm} disabled={submitting} className={cn("w-full rounded-xl py-3 text-sm font-bold transition active:scale-95", submitting ? "bg-gray-200 text-gray-400" : "bg-black text-white")}>
          {submitting ? "Memproses..." : "Buat Walk In"}
        </button>
      </div>
    </div>
  );
}
