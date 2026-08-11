"use client";

import { useMemo, useState } from "react";
import Avatar from "@/components/admin/Avatar";
import StatusBadge from "@/components/admin/StatusBadge";
import { Icon } from "@/components/icons";
import { ADMIN_CUSTOMERS } from "@/lib/admin-data";
import { cn } from "@/lib/utils/cn";

const ROWS_PER_PAGE = 6;

export default function PelangganPage() {
  const [tab, setTab] = useState<"pelanggan" | "tag">("pelanggan");
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(ADMIN_CUSTOMERS.length / ROWS_PER_PAGE);
  const rows = useMemo(
    () =>
      ADMIN_CUSTOMERS.slice(
        (page - 1) * ROWS_PER_PAGE,
        page * ROWS_PER_PAGE,
      ),
    [page],
  );

  const start = (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, ADMIN_CUSTOMERS.length);

  return (
    <div className="space-y-4">
      <div className="flex gap-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("pelanggan")}
          className={cn(
            "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
            tab === "pelanggan"
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600",
          )}
        >
          Pelanggan
        </button>
        <button
          type="button"
          onClick={() => setTab("tag")}
          className={cn(
            "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
            tab === "tag"
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-600",
          )}
        >
          Tag Pelanggan
        </button>
      </div>

      {tab === "pelanggan" ? (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <p className="text-sm text-gray-500">
              {ADMIN_CUSTOMERS.length} pelanggan terdaftar
            </p>
            <div className="flex flex-wrap gap-2">
              {["Gabung", "Import", "Export"].map((action) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-gray-50"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                  <th className="px-5 py-3 font-semibold">Nama</th>
                  <th className="px-5 py-3 font-semibold">No. Telpon</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Member ID</th>
                  <th className="px-5 py-3 font-semibold">Loyalty Point</th>
                  <th className="px-5 py-3 font-semibold">
                    Kunjungan Terakhir
                  </th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={cn(
                      "border-b border-gray-100",
                      index % 2 === 1 ? "bg-gray-50" : "bg-white",
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={customer.name} size="sm" />
                        <span className="font-semibold text-black">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-600">
                      {customer.phone}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {customer.email}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-600">
                      {customer.memberId}
                    </td>
                    <td className="px-5 py-3 font-semibold text-black">
                      {customer.loyaltyPoints.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-600">
                      {customer.lastVisit}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={customer.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <span className="text-xs text-gray-500">
              Menampilkan {start} - {end} dari {ADMIN_CUSTOMERS.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous page"
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="chevronLeft" className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-semibold transition",
                      page === number
                        ? "bg-black text-white"
                        : "border border-gray-300 text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {number}
                  </button>
                ),
              )}
              <button
                type="button"
                aria-label="Next page"
                disabled={page === totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name="chevronRight" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Icon name="tag" className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-semibold text-black">
            Belum ada tag pelanggan
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Buat tag untuk mengelompokkan pelanggan Anda.
          </p>
        </div>
      )}
    </div>
  );
}
