"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils/format";
import NumberInput from "@/components/ui/NumberInput";

interface Product { product_id: string; name: string; current_stock: number; price: string; image_url: string }

export default function ProductPickPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number | null>(null);
  const [savingStock, setSavingStock] = useState(false);

  const loadProducts = () =>
    api<{ data: { products: Product[] } }>("/api/cashier/products")
      .then((r) => { setProducts(r.data.products || []); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveStock = async (productId: string) => {
    if (stockValue === null) return;
    setSavingStock(true);
    try {
      await api(`/api/admin/products/${productId}/stock`, {
        method: "PATCH",
        body: { current_stock: stockValue },
      });
      await loadProducts();
      setEditingStock(null);
    } catch {
      // keep the editor open so the cashier can retry
    } finally {
      setSavingStock(false);
    }
  };

  const selected = products.filter((p) => (qty[p.product_id] ?? 0) > 0);
  const totalQty = selected.reduce((s, p) => s + (qty[p.product_id] ?? 0), 0);
  const totalPrice = selected.reduce((s, p) => s + (qty[p.product_id] ?? 0) * Number(p.price), 0);

  const handleNext = () => {
    if (selected.length === 0) return;
    const items = selected.map((p) => `${p.product_id}:${qty[p.product_id]}`).join(",");
    router.push(`/cashier/product/pay?items=${items}`);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24">
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-4">
          <Link href="/cashier" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Icon name="arrowLeft" className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-black">Pilih Produk</h1>
            <p className="text-sm text-gray-500">Pilih produk yang ingin dibeli.</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-10">Memuat produk...</p>
        ) : products.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">Tidak ada produk tersedia.</p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.product_id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <Icon name="tag" className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-black truncate">{p.name}</div>
                  {editingStock === p.product_id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Stok:</span>
                      <NumberInput value={stockValue} onChange={setStockValue} min={0} className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-xs text-black outline-none focus:border-black" />
                      <button onClick={() => saveStock(p.product_id)} disabled={savingStock || stockValue === null} className="rounded-lg bg-black px-2 py-1 text-xs font-semibold text-white disabled:opacity-40">
                        {savingStock ? "..." : "Simpan"}
                      </button>
                      <button onClick={() => setEditingStock(null)} className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600">
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingStock(p.product_id); setStockValue(p.current_stock); }}
                      className="text-xs text-gray-500 underline decoration-dotted underline-offset-2 hover:text-black"
                      title="Ubah stok"
                    >
                      Stok: {p.current_stock} · {formatPrice(Number(p.price))}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setQty((prev) => ({ ...prev, [p.product_id]: Math.max(0, (prev[p.product_id] ?? 0) - 1) }))} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95">
                    <div className="h-4 w-4 justify-center items-center mb-1"> - </div>
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-black">{qty[p.product_id] ?? 0}</span>
                  <button onClick={() => setQty((prev) => ({ ...prev, [p.product_id]: Math.min(p.current_stock, (prev[p.product_id] ?? 0) + 1) }))} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95">
                    <Icon name="plus" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalQty > 0 && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{totalQty} item</span>
              <span className="font-bold text-black">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-30 border-t border-gray-200 bg-white px-5 py-4">
        <button onClick={handleNext} disabled={selected.length === 0} className={cn("w-full rounded-xl py-3 text-sm font-bold transition active:scale-95", selected.length > 0 ? "bg-black text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed")}>
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  );
}
