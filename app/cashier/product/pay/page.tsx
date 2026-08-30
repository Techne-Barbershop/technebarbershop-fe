"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { PrimaryButton, SecondaryButton } from "@/components/Buttons";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils/format";

interface Product { product_id: string; name: string; price: string }

export default function ProductPayPage() {
  const router = useRouter();
  const params = useSearchParams();
  const itemsStr = params.get("items") ?? "";

  const items = (() => {
    if (!itemsStr) return [];
    const raw = itemsStr.split(",").map((entry) => {
      const [id, qtyStr] = entry.split(":");
      return { product_id: id?.trim() ?? "", quantity: Number(qtyStr) };
    });
    // Filter invalid entries
    const valid = raw.filter((i) => i.product_id && Number.isFinite(i.quantity) && i.quantity > 0);
    // Deduplicate by product_id (sum quantities)
    const merged = new Map<string, number>();
    for (const i of valid) {
      merged.set(i.product_id, (merged.get(i.product_id) ?? 0) + i.quantity);
    }
    return Array.from(merged, ([product_id, quantity]) => ({ product_id, quantity }));
  })();

  const [products, setProducts] = useState<Record<string, Product>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"CASH" | "QRIS" | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // QR state
  const [qrBatchId, setQrBatchId] = useState("");
  const [qrString, setQrString] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const qrPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api<{ data: { products: Product[] } }>("/api/cashier/products")
      .then((r) => {
        const map: Record<string, Product> = {};
        (r.data.products || []).forEach((p: Product) => { map[p.product_id] = p; });
        setProducts(map);
      });
  }, []);

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.quantity * Number(products[i.product_id]?.price ?? 0), 0);

  // --- Cash ---
  const handleCashConfirm = async () => {
    setConfirmAction(null);
    setSubmitting(true);
    try {
      await api("/api/cashier/products/sell/batch", {
        method: "POST",
        body: { items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })) },
      });
      setShowSuccess(true);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal memproses pembayaran");
      setSubmitting(false);
    }
  };


  // --- QRIS ---
  const stopQrPolling = () => {
    if (qrPollRef.current) {
      clearInterval(qrPollRef.current);
      qrPollRef.current = null;
    }
  };

  const pollQrStatus = async (batchId: string) => {
    try {
      const resp = await api<{ data: { payment_status: string } }>(
        `/api/cashier/products/sale-status/${batchId}`,
      );
      if (resp.data.payment_status === "SETTLEMENT") {
        stopQrPolling();
        setQrBatchId("");
        setQrString("");
        setShowSuccess(true);
      }
    } catch {
      // polling errors are non-fatal
    }
  };

  const handleQrisConfirm = async () => {
    setConfirmAction(null);
    setQrError(null);
    setQrLoading(true);
    try {
      const resp = await api<{ data: { batch_id: string; qr_string: string } }>(
        "/api/cashier/products/sell/qris",
        {
          method: "POST",
          body: { items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })) },
        },
      );
      setQrBatchId(resp.data.batch_id);
      setQrString(resp.data.qr_string);
      stopQrPolling();
      qrPollRef.current = setInterval(() => pollQrStatus(resp.data.batch_id), 3000);
    } catch (err) {
      setQrError(err instanceof Error ? err.message : "Gagal membuat QRIS");
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => () => stopQrPolling(), []);

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24">
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-4">
          <Link href="/cashier/product" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Icon name="arrowLeft" className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-black">Ringkasan Pembelian</h1>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Produk</h3>
          {items.map((item) => {
            const p = products[item.product_id];
            return (
              <div key={item.product_id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm font-bold text-black">{p?.name ?? item.product_id}</div>
                  <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="text-sm font-bold text-black">{formatPrice(Number(p?.price ?? 0) * item.quantity)}</div>
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200">
            <span className="text-sm font-bold text-black">Total</span>
            <span className="text-sm font-bold text-black">{totalQty} item · {formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Payment method choice */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Metode Pembayaran</h3>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmAction("CASH")}
              disabled={submitting}
              className="flex-1 rounded-xl border border-black bg-white py-3 text-sm font-bold text-black transition active:scale-95 disabled:opacity-50 hover:bg-gray-50"
            >
              <Icon name="wallet" className="mx-auto mb-1 h-5 w-5 text-gray-500" />
              {submitting ? "Memproses..." : "Bayar Cash"}
            </button>
            <button
              onClick={() => setConfirmAction("QRIS")}
              disabled={qrLoading}
              className="flex-1 rounded-xl border border-black bg-white py-3 text-sm font-bold text-black transition active:scale-95 disabled:opacity-50 hover:bg-gray-50"
            >
              <Icon name="qrcode" className="mx-auto mb-1 h-5 w-5" />
              {qrLoading ? "Memproses..." : "Bayar QRIS"}
            </button>
          </div>
          {qrError && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{qrError}</div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmAction(null)} />
          <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-black mb-2">
              <Icon name={confirmAction === "QRIS" ? "qrcode" : "wallet"} className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-black">Konfirmasi {confirmAction === "CASH" ? "Pembayaran" : "QRIS"}</h2>
            <p className="text-sm text-gray-500">
              {confirmAction === "CASH" && (
                <>Apakah Anda yakin ingin memproses pembayaran CASH untuk <strong>pembelian produk ini</strong>?</>
              )}
              {confirmAction === "QRIS" && (
                <>Generate kode QRIS untuk pembayaran <strong>pembelian produk ini</strong>?</>
              )}
            </p>
            <div className="flex w-full gap-3 mt-2">
              <SecondaryButton className="flex-1" onClick={() => setConfirmAction(null)}>Kembali</SecondaryButton>
              <PrimaryButton 
                className="flex-1"
                onClick={confirmAction === "CASH" ? handleCashConfirm : handleQrisConfirm}
              >
                Ya, Lanjutkan
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => { stopQrPolling(); setQrBatchId(""); setQrString(""); }} />
          <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex w-full items-center justify-between">
              <h2 className="text-lg font-bold text-black">Scan QRIS</h2>
              <button onClick={() => { stopQrPolling(); setQrBatchId(""); setQrString(""); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-center rounded-2xl border border-gray-200 p-4">
              {qrString ? (
                <QRCodeCanvas value={qrString} size={220} level="M" includeMargin />
              ) : (
                <div className="h-[220px] w-[220px] animate-pulse rounded-lg bg-gray-100" />
              )}
            </div>

            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4">
              {items.map((item) => {
                const p = products[item.product_id];
                return (
                  <div key={item.product_id} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">{p?.name ?? item.product_id} x{item.quantity}</span>
                    <span className="font-bold text-black">{formatPrice(Number(p?.price ?? 0) * item.quantity)}</span>
                  </div>
                );
              })}
              <div className="mt-2 flex justify-between border-t border-gray-300 pt-2">
                <span className="text-sm font-bold text-black">Total</span>
                <span className="text-sm font-bold text-black">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <div className="flex w-full items-center justify-center gap-2 text-xs font-medium text-gray-500 mt-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-black" />
              Menunggu pembayaran...
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl bg-white p-6 shadow-xl text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-2">
              <Icon name="check" className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-black">Pembayaran Berhasil!</h2>
            <p className="text-sm text-gray-500">
              Transaksi telah selesai dan stok produk telah diperbarui.
            </p>
            <div className="w-full mt-4">
              <PrimaryButton className="w-full" onClick={() => router.push("/cashier")}>
                Kembali ke Kasir
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
