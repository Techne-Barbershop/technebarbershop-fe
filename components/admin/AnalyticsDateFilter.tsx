"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons";

const PRESETS = [
  { label: "7 hari sebelumnya", days: 7 },
  { label: "30 hari sebelumnya", days: 30 },
  { label: "90 hari sebelumnya", days: 90 },
];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function AnalyticsDateFilter({
  value,
  onChange,
}: {
  value: { start: string; end: string };
  onChange: (range: { start: string; end: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onChange({ start: toISO(start), end: toISO(end) });
    setOpen(false);
  };

  const label =
    value.start && value.end
      ? `${value.start} s/d ${value.end}`
      : "Pilih rentang tanggal";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
      >
        <Icon name="calendar" className="h-4 w-4 text-gray-400" />
        <span className="whitespace-nowrap">{label}</span>
        <Icon name="chevronDown" className="h-3 w-3 text-gray-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <div className="flex flex-col py-1">
            {PRESETS.map((preset) => (
              <button
                key={preset.days}
                type="button"
                onClick={() => applyPreset(preset.days)}
                className="flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-black"
              >
                <Icon name="clock" className="h-3.5 w-3.5 text-gray-400" />
                {preset.label}
              </button>
            ))}
          </div>
          <div className="my-1 h-px w-full bg-gray-100" />
          <div className="flex flex-col gap-2 p-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Dari
              </label>
              <input
                type="date"
                value={value.start}
                onChange={(e) => onChange({ ...value, start: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-black outline-none focus:border-black"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Sampai
              </label>
              <input
                type="date"
                value={value.end}
                onChange={(e) => onChange({ ...value, end: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-black outline-none focus:border-black"
              />
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
