"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import SummaryCard from "@/components/admin/SummaryCard";
import TablePagination from "@/components/admin/TablePagination";
import AnalyticsDateFilter from "@/components/admin/AnalyticsDateFilter";
import { useApiPath } from "@/lib/useApi";
import { downloadCSV } from "@/lib/export";
import { formatPrice } from "@/lib/utils/format";
import type { ItemSalesResponse, StaffResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ItemSalesPage() {
  const [location, setLocation] = useState("Techné a Barbershop");
  const [staffId, setStaffId] = useState("");
  const [dateRange, setDateRange] = useState({ start: daysAgo(7), end: todayISO() });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: staffData } = useApiPath<{ data: StaffResponse }>("/api/admin/staff");
  const staff = staffData?.data.staff ?? [];

  const { data, loading, error } = useApiPath<{ data: ItemSalesResponse }>(
    "/api/admin/analytics/item-sales",
    {
      start_date: dateRange.start,
      end_date: dateRange.end,
      staff_id: staffId || undefined,
    },
  );

  const response = data?.data;
  const summary = response?.summary;
  const allItems = response?.items ?? [];
  const total = allItems.length;
  const items = allItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleExport = () => {
    if (!response) return;
    downloadCSV(
      "penjualan-item.csv",
      [
        "Tipe",
        "Nama",
        "Sold",
        "Kotor",
        "Diskon",
        "Diskon Penjualan",
        "Pengembalian",
        "Nett",
        "Tax",
        "Penggunaan Voucher",
        "Total Penjualan",
      ],
      response.items.map((item) => [
        item.tipe,
        item.nama,
        item.sold,
        item.kotor,
        item.diskon,
        item.diskon_penjualan,
        item.pengembalian,
        item.nett,
        item.tax,
        item.penggunaan_voucher,
        item.total_penjualan,
      ]),
    );
  };

  const summaryRows = summary
    ? [
        { label: "Jumlah Terjual", value: summary.jumlah_terjual },
        { label: "Kotor", value: formatPrice(Number(summary.kotor)) },
        { label: "Diskon Item", value: formatPrice(Number(summary.diskon_item)) },
        { label: "Total Diskon Penjualan", value: formatPrice(Number(summary.total_diskon_penjualan)) },
        { label: "Pengembalian", value: formatPrice(Number(summary.pengembalian)) },
        { label: "Nett", value: formatPrice(Number(summary.nett)) },
        { label: "Pajak", value: formatPrice(Number(summary.pajak)) },
        { label: "Total Penjualan", value: formatPrice(Number(summary.total_penjualan)) },
        { label: "Penggunaan Voucher", value: summary.penggunaan_voucher },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          aria-label="Kembali"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
        >
          <Icon name="arrowLeft" className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-black">Penjualan berdasarkan item</h1>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 outline-none focus:border-black"
          >
            <option>Techné a Barbershop</option>
          </select>

          <select
            value={staffId}
            onChange={(e) => {
              setStaffId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 outline-none focus:border-black"
          >
            <option value="">Semua Staff</option>
            {staff.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                {member.name}
              </option>
            ))}
          </select>

          <AnalyticsDateFilter value={dateRange} onChange={setDateRange} />
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-50"
        >
          <Icon name="download" className="h-4 w-4" />
          Export
        </button>
      </div>

      {loading && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
      {error && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-1">
            <h2 className="mb-3 text-sm font-bold text-black">Ringkasan</h2>
            <SummaryCard rows={summaryRows} />
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white xl:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
                    <th className="px-5 py-3 whitespace-nowrap">Tipe</th>
                    <th className="px-5 py-3 whitespace-nowrap">Nama</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Sold</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Kotor</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Diskon</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Diskon Penjualan</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Pengembalian</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Nett</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Tax</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Penggunaan Voucher</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Total Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={11} className="px-5 py-6 text-sm text-gray-400">
                        Tidak ada data penjualan pada rentang ini.
                      </td>
                    </tr>
                  )}
                  {items.map((item, index) => (
                    <tr key={`${item.nama}-${index}`} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{item.tipe}</td>
                      <td className="px-5 py-3 font-semibold text-black whitespace-nowrap">{item.nama}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{item.sold}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(Number(item.kotor))}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(Number(item.diskon))}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(Number(item.diskon_penjualan))}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(Number(item.pengembalian))}</td>
                      <td className="px-5 py-3 text-right font-medium text-black whitespace-nowrap">{formatPrice(Number(item.nett))}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{formatPrice(Number(item.tax))}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{item.penggunaan_voucher}</td>
                      <td className={cn("px-5 py-3 text-right font-bold whitespace-nowrap")}>{formatPrice(Number(item.total_penjualan))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              total={total}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
