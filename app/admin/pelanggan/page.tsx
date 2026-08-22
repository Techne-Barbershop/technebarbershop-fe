"use client";

import { useState } from "react";
import Avatar from "@/components/admin/Avatar";
import { Icon } from "@/components/icons";
import { useApiPath } from "@/lib/useApi";
import type { CustomersResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

const ROWS_PER_PAGE = 6;

function formatDate(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function PelangganPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, loading, error } = useApiPath<{ data: CustomersResponse }>(
    "/api/admin/customers",
    { search, page, page_size: ROWS_PER_PAGE },
  );

  const customers = data?.data.customers ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  const start = total === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, total);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama, telepon, email..."
                className="h-9 w-56 rounded-lg border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-gray-400"
              />
            </div>
            <span className="text-sm text-gray-500">{total} pelanggan terdaftar</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading && <p className="px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
          {error && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}
          {!loading && !error && (
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr className="text-left text-xs font-bold text-gray-500 uppercase">
                  <th className="px-5 py-4">PELANGGAN</th>
                  <th className="px-5 py-4">ID PELANGGAN</th>
                  <th className="px-5 py-4">EMAIL</th>
                  <th className="px-5 py-4">NO. TELPON</th>
                  <th className="px-5 py-4">BERGABUNG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-sm text-gray-400">Tidak ada pelanggan.</td>
                  </tr>
                )}
                {customers.map((customer) => (
                  <tr key={customer.customer_id} className="transition hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={customer.name} size="sm" />
                        <span className="font-bold text-black">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{customer.customer_id}</td>
                    <td className="px-5 py-3 text-gray-600">{customer.email || "-"}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-600">{customer.phone}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-600">{formatDate(customer.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <span className="text-xs text-gray-500">
            {total === 0 ? "Tidak ada data" : `Menampilkan ${start} - ${end} dari ${total}`}
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
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                className={cn(
                  "h-8 w-8 rounded-lg text-xs font-semibold transition",
                  page === number ? "bg-black text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50",
                )}
              >
                {number}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={page === totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="chevronRight" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
