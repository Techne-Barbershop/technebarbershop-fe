"use client";

import { useState } from "react";
import Avatar from "@/components/admin/Avatar";
import { Icon } from "@/components/icons";
import { api } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { Staff, StaffResponse, StaffSchedule } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const ROLE_LABELS: Record<string, string> = {
  CAPSTER: "Capster",
  CASHIER: "Kasir",
  ADMIN: "Admin",
};

function hasAnySchedule(member: Staff): boolean {
  return member.schedules.length > 0;
}

export default function StafPage() {
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
      await api(`/api/admin/staff/${editing.staff.user_id}/schedule`, {
        method: "PUT",
        body: { day_of_week: editing.day, start_time: form.start_time, end_time: form.end_time },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{staff.length} staf terdaftar</p>
        <p className="text-xs text-gray-400">Klik sel jadwal untuk mengedit jam kerja.</p>
      </div>

      {loading && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
      {error && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-red-500">{error}</p>}
      {!loading && !error && staff.length === 0 && (
        <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Belum ada staf terdaftar.</p>
      )}

      <div className="flex flex-col gap-6">
        {staff.map((member) => (
          <div key={member.user_id} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <Avatar name={member.name} size="lg" />
                <div>
                  <div className="text-base font-bold text-black">{member.name}</div>
                  <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:ml-auto sm:grid-cols-3 sm:text-right">
                <div className="flex items-center gap-2 sm:justify-end">
                  <Icon name="mail" className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="text-sm text-gray-600">{member.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Icon name="phone" className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="text-sm text-gray-600">{member.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Icon name="tag" className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="text-sm text-gray-600">{member.user_id}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Jadwal Mingguan</h3>
                {!hasAnySchedule(member) && (
                  <span className="text-xs text-gray-400">Belum ada jadwal</span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {DAYS.map((day, index) => {
                  const schedule = scheduleFor(member, index);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => openEditor(member, index)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition hover:bg-gray-50",
                        schedule ? "border-gray-200 bg-white" : "border-dashed border-gray-200 bg-gray-50",
                      )}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{day}</span>
                      {schedule ? (
                        <span className="text-xs font-semibold text-black whitespace-nowrap">
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
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
