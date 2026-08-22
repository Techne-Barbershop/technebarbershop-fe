"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils/format";

interface Product { product_id: string; name: string; price: string }

export default function ProductPayPage() {
  const router = useRouter();
  const params = useSearchParams();
  const itemsStr = params.get("items") ?? "";
  const [submitting, setSubmitting] = useState(false);

  const items = useMemo(() => {
    if (!itemsStr) return [];
    return itemsStr.split(",").map((entry) => {
      const [id, qtyStr] = entry.split(":");
      return { product_id: id, quantity: Number(qtyStr) };
    });
  }, [itemsStr]);

  const [products, setProducts] = useState<Record<string, Product>>({});

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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      for (const item of items) {
        await api("/api/cashier/products/sell", {
          method: "POST",
          body: { product_id: item.product_id, quantity: item.quantity, payment_method: "CASH" },
        });
      }
      router.push("/cashier");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal memproses pembayaran");
      setSubmitting(false);
    }
  };

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

        <div className="rounded-xl border border-gray-200 bg-black p-4">
          <div className="flex items-center gap-3 text-white">
            <Icon name="check" className="h-5 w-5" />
            <div>
              <div className="text-sm font-bold">Lunas</div>
              <div className="text-xs text-gray-400">Pembelian langsung dibayar cash</div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white px-5 py-4">
        <button onClick={handleSubmit} disabled={submitting} className={cn("w-full rounded-xl py-3 text-sm font-bold transition active:scale-95", submitting ? "bg-gray-200 text-gray-400" : "bg-black text-white")}>
          {submitting ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </div>
    </div>
  );
}

function useMemo<T>(fn: () => T, deps: unknown[]): T {
  const ref = { deps, value: fn(), fn } as { deps: unknown; value: T; fn: () => T };
  if (JSON.stringify(ref.deps) !== JSON.stringify(deps)) {
    ref.value = fn();
    ref.deps = deps;
  }
  return ref.value;
}
