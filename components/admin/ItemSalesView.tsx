"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/icons";
import SummaryCard from "@/components/admin/SummaryCard";
import TablePagination from "@/components/admin/TablePagination";
import DateFilterModal from "@/components/admin/DateFilterModal";
import { useApiPath } from "@/lib/useApi";
import { downloadCSV } from "@/lib/export";
import { formatPrice } from "@/lib/utils/format";
import type { ItemSalesResponse, StaffResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

interface ItemSalesViewProps {
  startDate?: string;
  endDate?: string;
  onOpenDateFilter: () => void;
}


export default function ItemSalesView({ startDate, endDate, onOpenDateFilter }: ItemSalesViewProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const { data, loading, error } = useApiPath<{ data: ItemSalesResponse }>(
    "/api/admin/analytics/item-sales",
    {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
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
    <div className="flex flex-col space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-4">
          <h2 className="text-base font-bold text-black">Ringkasan Penjualan</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-gray-500">Filter Tanggal:</span>
            <button
              onClick={onOpenDateFilter}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
              <Icon name="calendar" className="h-4 w-4" />
              {startDate && endDate ? `${startDate} s/d ${endDate}` : (startDate || endDate || "Semua Waktu")}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
              <Icon name="download" className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
      {error && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-1">
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
