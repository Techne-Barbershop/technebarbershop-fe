"use client";

import { useState } from "react";
import Avatar from "@/components/admin/Avatar";
import { Icon } from "@/components/icons";
import { ADMIN_DAYS, ADMIN_STAFF } from "@/lib/admin-data";
import { cn } from "@/lib/utils/cn";

const TABS = ["Jam Kerja", "Anggota Staf", "Kehadiran", "Komisi"] as const;

export default function StafPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Jam Kerja");
  const [view, setView] = useState<"week" | "month">("week");

  return (
    <div className="space-y-4">
      <div className="flex gap-6 border-b border-gray-200">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
              tab === item
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-gray-600",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={() => setView("week")}
              className={cn(
                "px-4 py-2 text-xs font-semibold transition-colors",
                view === "week"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-50",
              )}
            >
              Minggu
            </button>
            <button
              type="button"
              onClick={() => setView("month")}
              className={cn(
                "px-4 py-2 text-xs font-semibold transition-colors",
                view === "month"
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-50",
              )}
            >
              Bulan
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              aria-label="Previous range"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50"
            >
              <Icon name="chevronLeft" className="h-4 w-4" />
            </button>
            <span className="px-2 font-semibold text-black">
              {view === "week" ? "10 - 16 Agu 2026" : "Agu 2026"}
            </span>
            <button
              type="button"
              aria-label="Next range"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50"
            >
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {tab === "Jam Kerja" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-44 px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Staf
                  </th>
                  {ADMIN_DAYS.map((day) => (
                    <th
                      key={day}
                      className="border-l border-gray-100 px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ADMIN_STAFF.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} size="sm" />
                        <div>
                          <div className="font-semibold text-black">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    {ADMIN_DAYS.map((day) => {
                      const hours = member.schedule[day];
                      return (
                        <td
                          key={day}
                          className="border-l border-gray-100 px-3 py-3 text-center"
                        >
                          {hours ? (
                            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                              {hours}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Icon name="user" className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-semibold text-black">
              Modul {tab} belum tersedia
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Konten untuk tab ini akan ditambahkan kemudian.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
