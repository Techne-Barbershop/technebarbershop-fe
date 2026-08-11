"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ADMIN_SERVICE_CATEGORIES } from "@/lib/admin-data";
import { formatDuration, formatPrice } from "@/lib/utils/format";

export default function LayananPage() {
  const [openCategories, setOpenCategories] = useState<string[]>(
    ADMIN_SERVICE_CATEGORIES.map((category) => category.id),
  );

  const toggleCategory = (id: string) => {
    setOpenCategories((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {ADMIN_SERVICE_CATEGORIES.length} kategori ·{" "}
          {ADMIN_SERVICE_CATEGORIES.reduce(
            (total, category) => total + category.services.length,
            0,
          )}{" "}
          layanan
        </p>
        <Link
          href="/admin/layanan/baru"
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95"
        >
          <Icon name="plus" className="h-4 w-4" />
          Tambah Layanan
        </Link>
      </div>

      {ADMIN_SERVICE_CATEGORIES.map((category) => {
        const isOpen = openCategories.includes(category.id);
        return (
          <div
            key={category.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white"
          >
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="flex w-full items-center gap-3 border-b border-gray-200 px-5 py-4 text-left"
            >
              <div className="placeholder-stripes flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400">
                <Icon name="image" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-black uppercase">
                  {category.name}
                </div>
                <div className="text-xs text-gray-500">
                  {category.services.length} layanan
                </div>
              </div>
              <Icon
                name={isOpen ? "chevronUp" : "chevronDown"}
                className="h-5 w-5 text-gray-500"
              />
            </button>

            {isOpen ? (
              <div className="divide-y divide-gray-100">
                {category.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-3 px-5 py-3.5"
                  >
                    <div className="placeholder-stripes flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400">
                      <Icon name="scissors" className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-black">
                        {service.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDuration(service.durationMinutes)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-black">
                      {formatPrice(service.price)}
                    </div>
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
