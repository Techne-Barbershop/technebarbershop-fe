"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { api } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { CategoriesResponse } from "@/lib/types/admin";
import { formatDuration, formatPrice } from "@/lib/utils/format";

export default function LayananPage() {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const { data, loading, error, refetch } = useApiPath<{ data: CategoriesResponse }>("/api/admin/categories");
  const categories = data?.data.categories ?? [];

  const toggleCategory = (id: string) => {
    setOpenCategories((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const totalServices = categories.reduce((total, category) => total + category.services.length, 0);

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Hapus layanan ini?")) return;
    try {
      await api(`/api/admin/services/${serviceId}`, { method: "DELETE" });
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {categories.length} kategori · {totalServices} layanan
        </p>
        <Link
          href="/admin/layanan/baru"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95"
        >
          <Icon name="plus" className="h-4 w-4" />
          Tambah Layanan
        </Link>
      </div>

      {loading && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
      {error && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-red-500">{error}</p>}
      {!loading && !error && categories.length === 0 && (
        <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Belum ada kategori layanan.</p>
      )}

      {categories.map((category) => {
        const isOpen = openCategories.includes(category.category_id);
        return (
          <div key={category.category_id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => toggleCategory(category.category_id)}
              className="flex w-full items-center gap-3 border-b border-gray-200 px-5 py-4 text-left"
            >
              <div className="placeholder-stripes flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400">
                <Icon name="image" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-black uppercase">{category.name}</div>
                <div className="text-xs text-gray-500">{category.services.length} layanan</div>
              </div>
              <Icon name={isOpen ? "chevronUp" : "chevronDown"} className="h-5 w-5 text-gray-500" />
            </button>

            {isOpen ? (
              <div className="divide-y divide-gray-100">
                {category.services.length === 0 && (
                  <p className="px-5 py-3.5 text-xs text-gray-400">Belum ada layanan dalam kategori ini.</p>
                )}
                {category.services.map((service) => (
                  <div key={service.service_id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="placeholder-stripes flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400">
                      <Icon name="scissors" className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-black">{service.name}</div>
                      <div className="text-xs text-gray-500">{formatDuration(service.duration_minutes)}</div>
                    </div>
                    <div className="text-sm font-semibold text-black">{formatPrice(Number(service.price))}</div>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.service_id)}
                      aria-label={`Hapus ${service.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
