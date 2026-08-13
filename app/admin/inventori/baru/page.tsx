"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { Icon } from "@/components/icons";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils/cn";

const TABS = ["Detail Produk", "Variasi", "Settings"] as const;

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black outline-none placeholder:text-gray-400 transition focus:border-black focus:ring-1 focus:ring-black";

export default function TambahInventoriPage() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Detail Produk");
  const [form, setForm] = useState({ name: "", price: "", current_stock: 0 });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Nama produk wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/products", {
        method: "POST",
        body: {
          name: form.name,
          current_stock: Number(form.current_stock),
          price: form.price,
          image_url: "",
        },
      });
      router.push("/admin/inventori");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-28">
      <div className="mb-4 flex items-center gap-3">
        <BackButton href="/admin/inventori" />
        <h1 className="text-lg font-bold text-black">Tambah Produk Baru</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <div className="flex gap-1 border-b border-gray-200 px-2 pt-2">
            {TABS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cn(
                  "-mb-px border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors",
                  tab === item ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-8">
            {tab === "Detail Produk" ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="name" className="text-sm font-semibold text-black">
                    Nama Produk
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Contoh: Pomade Matte Clay"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="price" className="text-sm font-semibold text-black">
                    Harga Produk
                  </label>
                  <input
                    id="price"
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Rp"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="quantity" className="text-sm font-semibold text-black">
                    Kuantitas
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min={0}
                    value={form.current_stock}
                    onChange={(e) => setForm({ ...form, current_stock: Number(e.target.value) })}
                    placeholder="Jumlah Stok"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            ) : (
              <div className="py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Icon name="info" className="h-6 w-6" />
                </div>
                <p className="mt-4 text-sm font-semibold text-black">Form {tab} belum tersedia</p>
                <p className="mt-1 text-xs text-gray-500">Anda tetap dapat menyimpan produk ini.</p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-xs font-medium text-red-500">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-3 px-4 py-3 md:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/admin/inventori")}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
