"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";
import { api } from "@/lib/api";
import { formatDuration, formatPrice } from "@/lib/utils/format";

interface Category {
  category_id: string;
  name: string;
  image_url: string | null;
  services: { service_id: string; name: string; duration_minutes: number; price: string }[];
}

export default function WalkinPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMap, setSelectedMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ data: { categories: Category[] } }>("/api/categories")
      .then((res) => { setCategories(res.data.categories || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleService = (categoryId: string, serviceId: string) => {
    setSelectedMap((prev) => {
      const next = { ...prev };
      if (next[categoryId] === serviceId) {
        delete next[categoryId];
      } else {
        next[categoryId] = serviceId;
      }
      return next;
    });
  };

  const selectedServiceIds = Object.values(selectedMap).filter(Boolean);
  const allServices = categories.flatMap((c) => c.services);
  const selectedServices = allServices.filter((s) => selectedServiceIds.includes(s.service_id));
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const pickedCount = selectedServiceIds.length;

  const handleNext = () => {
    if (pickedCount === 0) return;
    const ids = selectedServiceIds.join(",");
    router.push(`/cashier/walkin/schedule?services=${ids}&duration=${totalDuration}`);
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24">
      <div className="border-b border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center gap-4">
          <Link href="/cashier" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
            <Icon name="arrowLeft" className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-black">Pilih Layanan</h1>
            <p className="text-sm text-gray-500">Pilih satu layanan dari setiap kategori.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-5 py-4 pb-24">
        {loading && <p className="text-center text-sm text-gray-400 py-10">Memuat layanan...</p>}
        {categories.map((category) => (
          <section key={category.category_id} className="mt-6 first:mt-0">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon name="scissors" className="h-5 w-5 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold uppercase tracking-wide text-black">{category.name}</div>
                <div className="text-xs text-gray-500">{category.services.length} layanan</div>
              </div>
            </div>

            <div className="divide-y divide-gray-100 border border-t-0 border-gray-200 bg-white rounded-b-xl rounded-t-none">
              {category.services.map((service) => {
                const picked = selectedMap[category.category_id] === service.service_id;
                return (
                  <div key={service.service_id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-bold text-black">{service.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatDuration(service.duration_minutes)}
                        <span className="mx-1.5 text-gray-300">·</span>
                        <span className="font-semibold text-black">{formatPrice(Number(service.price))}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={picked}
                      onClick={() => toggleService(category.category_id, service.service_id)}
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-95",
                        picked ? "border-black bg-black text-white" : "border-gray-300 text-transparent",
                      )}
                    >
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {pickedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white px-5 py-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>{pickedCount} layanan dipilih</span>
            <span className="font-bold text-black">{formatDuration(totalDuration)}</span>
          </div>
          <button onClick={handleNext} className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white transition active:scale-95">
            Lanjut ke Jadwal
          </button>
        </div>
      )}
    </div>
  );
}
