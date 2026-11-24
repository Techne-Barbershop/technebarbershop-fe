"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Avatar from "@/components/admin/Avatar";
import { Icon } from "@/components/icons";
import { useApiPath } from "@/lib/useApi";
import type { Staff, StaffResponse, StaffLeavesResponse } from "@/lib/types/admin";
import { cn } from "@/lib/utils/cn";
import { formatDateDDMMYYYY } from "@/lib/utils/format";
import Modal from "@/components/admin/Modal";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const ROLE_LABELS: Record<string, string> = {
  CAPSTER: "Capster",
  CASHIER: "Kasir",
  ADMIN: "Admin",
};

export default function CashierStafPage() {
  const [mainTab, setMainTab] = useState<"list" | "calendar" | "leaves">("list");

  // Calendar View State
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    return d;
  });

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

  const formatLocalISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(`${e.target.value}T00:00:00`);
    if (!isNaN(d.getTime())) {
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      setCurrentWeekStart(d);
    }
  };

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  // List State
  const [dropdownConfig, setDropdownConfig] = useState<{
    id: string;
    pos: { top: number; right: number };
  } | null>(null);

  useEffect(() => {
    const handleClick = () => setDropdownConfig(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Detail Modal State
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Fetch Data
  const { data: staffData, loading: staffLoading, error: staffError } = useApiPath<{ data: StaffResponse }>("/api/admin/staff");
  const staffList = staffData?.data.staff ?? [];

  const { data: leaveData, loading: leaveLoading, error: leaveError } = useApiPath<{ data: StaffLeavesResponse }>("/api/admin/staff/leaves");
  const leavesList = leaveData?.data.leaves ?? [];

  const getCalendarCell = (member: Staff, date: Date, dayIndex: number) => {
    const dateStr = formatLocalISO(date);
    const isLeave = leavesList.some((l) => l.user_id === member.user_id && l.leave_date === dateStr);
    if (isLeave) {
      return { type: "leave" };
    }

    const shifts = member.schedules.filter((s) => s.day_of_week === dayIndex);
    if (shifts.length > 0) {
      return { type: "shifts", shifts };
    }

    return { type: "none" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setMainTab("list")}
          className={cn(
            "pb-3 text-sm font-bold transition-colors",
            mainTab === "list" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black",
          )}
        >
          Daftar Staf
        </button>
        <button
          onClick={() => setMainTab("calendar")}
          className={cn(
            "pb-3 text-sm font-bold transition-colors",
            mainTab === "calendar" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black",
          )}
        >
          Kalender
        </button>
        <button
          onClick={() => setMainTab("leaves")}
          className={cn(
            "pb-3 text-sm font-bold transition-colors",
            mainTab === "leaves" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-black",
          )}
        >
          Libur
        </button>
      </div>

      {mainTab === "list" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Daftar Staf</h2>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white">
            {staffLoading && <p className="px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
            {staffError && <p className="px-5 py-6 text-sm text-red-500">{staffError}</p>}
            {!staffLoading && !staffError && (
              <div className="overflow-x-auto min-h-[250px]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-gray-500">STAF</th>
                      <th className="px-5 py-4 font-semibold text-gray-500">ID STAF</th>
                      <th className="px-5 py-4 font-semibold text-gray-500">EMAIL</th>
                      <th className="px-5 py-4 font-semibold text-gray-500">NO. TELEPON</th>
                      <th className="px-5 py-4 font-semibold text-gray-500">ROLE</th>
                      <th className="px-5 py-4 font-semibold text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {staffList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                          Belum ada staf terdaftar.
                        </td>
                      </tr>
                    )}
                    {staffList.map((member) => (
                      <tr key={member.user_id} className="transition hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {member.image_url ? (
                              <img
                                src={member.image_url}
                                alt={member.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <Avatar name={member.name} size="sm" />
                            )}
                            <div className="font-bold text-black">{member.name}</div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">{member.user_id}</td>
                        <td className="px-5 py-3 text-gray-600">{member.email || "-"}</td>
                        <td className="px-5 py-3 text-gray-600">{member.phone}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                            {ROLE_LABELS[member.role] ?? member.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (dropdownConfig?.id === member.user_id) {
                                setDropdownConfig(null);
                                return;
                              }
                              const rect = e.currentTarget.getBoundingClientRect();
                              setDropdownConfig({
                                id: member.user_id,
                                pos: { top: rect.bottom + 8, right: window.innerWidth - rect.right },
                              });
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-200 hover:text-black"
                          >
                            <Icon name="moreVertical" className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {mainTab === "calendar" && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Pilih Tanggal:</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevWeek}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition"
                >
                  <Icon name="chevronLeft" className="h-4 w-4" />
                </button>
                <input
                  type="date"
                  value={formatLocalISO(currentWeekStart)}
                  onChange={handleDatePick}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none transition focus:border-black"
                />
                <button
                  onClick={handleNextWeek}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition"
                >
                  <Icon name="chevronRight" className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400">Jadwal kerja staf ditampilkan per minggu.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-44 px-5 py-3 text-xs font-bold text-gray-500 uppercase">Staf</th>
                  {weekDates.map((date, index) => (
                    <th key={index} className="border-l border-gray-100 px-3 py-3 text-center text-xs text-gray-500 uppercase">
                      <div className="font-bold">{DAYS[index]}</div>
                      <div className="text-[10px] font-medium mt-1">{formatDateDDMMYYYY(date).slice(0, 5)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.map((member) => (
                  <tr key={member.user_id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.name} size="sm" />
                        <div>
                          <div className="font-bold text-black">{member.name}</div>
                          <div className="text-xs text-gray-500">{ROLE_LABELS[member.role] ?? member.role}</div>
                        </div>
                      </div>
                    </td>
                    {weekDates.map((date, index) => {
                      const cell = getCalendarCell(member, date, index);
                      return (
                        <td key={index} className="border-l border-gray-100 px-3 py-3 text-center align-top">
                          {cell.type === "leave" && (
                            <div className="flex h-full min-h-[40px] items-center justify-center rounded-lg bg-gray-200 text-xs font-bold text-gray-500">
                              Libur
                            </div>
                          )}
                          {cell.type === "shifts" && (
                            <div className="flex flex-col gap-1.5">
                              {cell.shifts?.map((s, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700"
                                >
                                  {s.start_time} - {s.end_time}
                                </span>
                              ))}
                            </div>
                          )}
                          {cell.type === "none" && (
                            <div className="flex h-full min-h-[40px] items-center justify-center text-xs text-gray-300">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === "leaves" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">Daftar Libur Khusus</h2>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white">
            {leaveLoading && <p className="px-5 py-6 text-sm text-gray-400">Memuat data libur...</p>}
            {leaveError && <p className="px-5 py-6 text-sm text-red-500">{leaveError}</p>}
            {!leaveLoading && !leaveError && (
              <div className="overflow-x-auto min-h-[250px]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50/50">
                    <tr>
                      <th className="px-5 py-4 font-semibold text-gray-500">Staf</th>
                      <th className="px-5 py-4 font-semibold text-gray-500">Email</th>
                      <th className="px-5 py-4 font-semibold text-gray-500">Role</th>
                      <th className="px-5 py-4 font-semibold text-gray-500">Tanggal Libur</th>
                      <th className="px-5 py-4 font-semibold text-gray-500">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leavesList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                          Belum ada hari libur yang diatur.
                        </td>
                      </tr>
                    )}
                    {leavesList.map((leave) => (
                      <tr key={leave.leave_id} className="transition hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {leave.image_url ? (
                              <img
                                src={leave.image_url}
                                alt={leave.name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <Avatar name={leave.name} size="sm" />
                            )}
                            <div className="font-bold text-black">{leave.name}</div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{leave.email || "-"}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                            {ROLE_LABELS[leave.role] ?? leave.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex flex-col items-center justify-center rounded-md bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 font-bold text-xs text-center">
                            <span>
                              {(() => {
                                const [y, m, d] = leave.leave_date.split("-");
                                const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                                return dateObj.toLocaleDateString("id-ID", { weekday: "long" });
                              })()}
                            </span>
                            <span>
                              {(() => {
                                const [y, m, d] = leave.leave_date.split("-");
                                const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                                return formatDateDDMMYYYY(dateObj);
                              })()}
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{leave.reason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Staff Modal */}
      <Modal isOpen={!!selectedStaff} onClose={() => setSelectedStaff(null)} title="Detail Staf">
        {selectedStaff && (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-4">
              {selectedStaff.image_url ? (
                <img
                  src={selectedStaff.image_url}
                  alt={selectedStaff.name}
                  className="aspect-[16/9] w-full rounded-2xl object-cover border border-gray-200"
                />
              ) : (
                <div className="flex aspect-[16/9] w-full shrink-0 items-center justify-center rounded-2xl bg-black text-4xl font-bold text-white">
                  {selectedStaff.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-black">{selectedStaff.name}</h3>
                <p className="text-sm font-medium text-gray-500 uppercase">
                  {ROLE_LABELS[selectedStaff.role] ?? selectedStaff.role}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">ID User</p>
                <p className="font-semibold text-black">{selectedStaff.user_id}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Nomor HP</p>
                <p className="font-semibold text-black">{selectedStaff.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Email</p>
                <p className="font-semibold text-black">{selectedStaff.email || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Jadwal Reguler</p>
              {selectedStaff.schedules.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Belum ada jadwal.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {DAYS.map((day, idx) => {
                    const s = selectedStaff.schedules.filter((x) => x.day_of_week === idx);
                    if (s.length === 0) return null;
                    return (
                      <div key={idx} className="flex items-start justify-between text-sm border-b border-gray-50 pb-1.5">
                        <span className="font-semibold text-gray-700 w-24">{day}</span>
                        <div className="flex flex-col items-end gap-1">
                          {s.map((sc, i) => (
                            <span key={i} className="text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                              {sc.start_time} - {sc.end_time}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStaff(null)}
                className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dropdown Menu */}
      {dropdownConfig && (
        <div
          className="fixed z-50 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          style={{ top: dropdownConfig.pos.top, right: dropdownConfig.pos.right }}
          onClick={(e) => e.stopPropagation()}
        >
          {(() => {
            const member = staffList.find((s) => s.user_id === dropdownConfig.id);
            if (!member) return null;
            return (
              <>
                <button
                  onClick={() => {
                    setDropdownConfig(null);
                    setSelectedStaff(member);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                >
                  <Icon name="info" className="h-4 w-4" /> Lihat Detail
                </button>
                {member.role === "CAPSTER" && (
                  <Link
                    href={`/cashier/staf/${member.user_id}/performa`}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                  >
                    <Icon name="chart" className="h-4 w-4" /> Performa
                  </Link>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

