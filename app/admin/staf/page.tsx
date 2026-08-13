"use client";

import { useState } from "react";
import Avatar from "@/components/admin/Avatar";
import { Icon } from "@/components/icons";
import { useApiPath } from "@/lib/useApi";
import type { Staff, StaffResponse, StaffSchedule } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const ROLE_LABELS: Record<string, string> = {
  CAPSTER: "Capster",
  CASHIER: "Kasir",
  ADMIN: "Admin",
};

export default function StafPage() {
  const [view, setView] = useState<"week" | "month">("week");
  const [editing, setEditing] = useState<{ staff: Staff; day: number; schedule?: StaffSchedule } | null>(null);
  const [form, setForm] = useState({ start_time: "", end_time: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useApiPath<{ data: StaffResponse }>("/api/admin/staff");
  const staff = data?.data.staff ?? [];

  const scheduleFor = (member: Staff, day: number): StaffSchedule | undefined =>
    member.schedules.find((schedule) => schedule.day_of_week === day);

  const openEditor = (member: Staff, day: number) => {
    const existing = scheduleFor(member, day);
    setEditing({ staff: member, day, schedule: existing });
    setForm(
      existing
        ? { start_time: existing.start_time, end_time: existing.end_time }
        : { start_time: "09:00", end_time: "17:00" },
    );
    setFormError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!form.start_time || !form.end_time) {
      setFormError("Jam mulai dan jam selesai wajib diisi");
      return;
    }
    setSaving(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/staff/${editing.staff.user_id}/schedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("techne_token")}`,
        },
        body: JSON.stringify({ day_of_week: editing.day, start_time: form.start_time, end_time: form.end_time }),
      });
      setEditing(null);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan jadwal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={() => setView("week")}
              className={cn(
                "px-4 py-2 text-xs font-semibold transition-colors",
                view === "week" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50",
              )}
            >
              Minggu
            </button>
            <button
              type="button"
              onClick={() => setView("month")}
              className={cn(
                "px-4 py-2 text-xs font-semibold transition-colors",
                view === "month" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50",
              )}
            >
              Bulan
            </button>
          </div>
          <p className="text-xs text-gray-400">Klik sel pada jadwal untuk mengedit jam kerja.</p>
        </div>

        {loading && <p className="px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
        {error && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-44 px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Staf</th>
                  {DAYS.map((day) => (
                    <th key={day} className="border-l border-gray-100 px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-6 text-sm text-gray-400">Belum ada staf terdaftar.</td>
                  </tr>
                )}
                {staff.map((member) => (
                  <tr key={member.user_id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} size="sm" />
                        <div>
                          <div className="font-semibold text-black">{member.name}</div>
                          <div className="text-xs text-gray-500">{ROLE_LABELS[member.role] ?? member.role}</div>
                        </div>
                      </div>
                    </td>
                    {DAYS.map((day, index) => {
                      const schedule = scheduleFor(member, index);
                      return (
                        <td key={day} className="border-l border-gray-100 px-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => openEditor(member, index)}
                            className="rounded px-2 py-1 transition hover:bg-gray-100"
                          >
                            {schedule ? (
                              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                                {schedule.start_time} - {schedule.end_time}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">-</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setEditing(null)}>
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-black">Edit Jadwal</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="text-gray-400 hover:text-gray-600">
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {editing.staff.name} · {DAYS[editing.day]}
            </p>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600">Jam Mulai</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600">Jam Selesai</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400"
                  />
                </div>
              </div>
              {formError && <p className="text-xs font-medium text-red-500">{formError}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-50">
                Batal
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
