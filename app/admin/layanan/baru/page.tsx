"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { api } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { CategoriesResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black outline-none placeholder:text-gray-400 transition focus:border-black focus:ring-1 focus:ring-black";

export default function LayananBaruPage() {
  const router = useRouter();
  const { data } = useApiPath<{ data: CategoriesResponse }>("/api/admin/categories");
  const categories = data?.data.categories ?? [];

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    duration_minutes: 45,
    price: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.category_id) {
      setError("Nama layanan dan kategori wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/services", {
        method: "POST",
        body: {
          category_id: form.category_id,
          name: form.name,
          duration_minutes: Number(form.duration_minutes),
          price: form.price,
          description: form.description,
          image_url: "",
        },
      });
      router.push("/admin/layanan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan layanan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-28">
      <div className="mb-4 flex items-center gap-3">
        <BackButton href="/admin/layanan" />
        <h1 className="text-lg font-bold text-black">Tambah Layanan Baru</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="p-5 md:p-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-black">
                  Nama Layanan
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Essential Cut"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className="text-sm font-semibold text-black">
                  Kategori
                </label>
                <select
                  id="category"
                  required
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className={INPUT_CLASS}
                >
                  <option value="" disabled>
                    Pilih kategori
                  </option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="duration" className="text-sm font-semibold text-black">
                  Durasi
                </label>
                <input
                  id="duration"
                  type="number"
                  min={1}
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                  placeholder="Menit, contoh: 45"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="price" className="text-sm font-semibold text-black">
                  Harga
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
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="description" className="text-sm font-semibold text-black">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsi singkat layanan..."
                  className={cn(INPUT_CLASS, "resize-none")}
                />
              </div>
            </div>

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
              onClick={() => router.push("/admin/layanan")}
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
