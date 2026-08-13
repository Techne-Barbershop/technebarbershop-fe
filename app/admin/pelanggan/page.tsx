"use client";

import { useState } from "react";
import Avatar from "@/components/admin/Avatar";
import { Icon } from "@/components/icons";
import { api } from "@/lib/api";
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
  const [tab, setTab] = useState<"pelanggan" | "tag">("pelanggan");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useApiPath<{ data: CustomersResponse }>(
    "/api/admin/customers",
    { search, page, page_size: ROWS_PER_PAGE },
  );

  const customers = data?.data.customers ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));
  const start = total === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const end = Math.min(page * ROWS_PER_PAGE, total);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError("Nama dan No. Telpon wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/customers", { method: "POST", body: form });
      setForm({ name: "", phone: "", email: "" });
      setShowForm(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("pelanggan")}
          className={cn(
            "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
            tab === "pelanggan" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600",
          )}
        >
          Pelanggan
        </button>
        <button
          type="button"
          onClick={() => setTab("tag")}
          className={cn(
            "-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors",
            tab === "tag" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600",
          )}
        >
          Tag Pelanggan
        </button>
      </div>

      {tab === "pelanggan" ? (
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
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className="flex items-center gap-1.5 rounded-lg bg-black px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
            >
              <Icon name="plus" className="h-3.5 w-3.5" />
              Gabung
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="space-y-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
              <p className="text-sm font-semibold text-black">Tambah Pelanggan</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama"
                  className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="No. Telpon"
                  className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email (opsional)"
                  className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                />
              </div>
              {formError && <p className="text-xs font-medium text-red-500">{formError}</p>}
              <button type="submit" disabled={saving} className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            {loading && <p className="px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
            {error && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}
            {!loading && !error && (
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                    <th className="px-5 py-3 font-semibold">Nama</th>
                    <th className="px-5 py-3 font-semibold">No. Telpon</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">ID</th>
                    <th className="px-5 py-3 font-semibold">Bergabung</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-sm text-gray-400">Tidak ada pelanggan.</td>
                    </tr>
                  )}
                  {customers.map((customer, index) => (
                    <tr key={customer.customer_id} className={cn("border-b border-gray-100", index % 2 === 1 ? "bg-gray-50" : "bg-white")}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={customer.name} size="sm" />
                          <span className="font-semibold text-black">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-gray-600">{customer.phone}</td>
                      <td className="px-5 py-3 text-gray-600">{customer.email || "-"}</td>
                      <td className="px-5 py-3 font-medium text-gray-600">{customer.customer_id}</td>
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
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Icon name="tag" className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-semibold text-black">Belum ada tag pelanggan</p>
          <p className="mt-1 text-xs text-gray-500">Buat tag untuk mengelompokkan pelanggan Anda.</p>
        </div>
      )}
    </div>
  );
}
