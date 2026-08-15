"use client";

import { Icon } from "@/components/icons";

export default function TablePagination({
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: {
  total: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = total === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>
          Menampilkan {start} - {end} dari {total}
        </span>
        <span className="text-gray-300">|</span>
        <span>Baris:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            onRowsPerPageChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded-md border border-gray-200 px-2 py-1 text-xs text-black outline-none focus:border-black"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Halaman sebelumnya"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </button>
        <span className="px-2 text-xs font-semibold text-black">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          aria-label="Halaman berikutnya"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
