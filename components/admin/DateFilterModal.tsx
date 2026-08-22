"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import { cn } from "@/lib/utils/cn";

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (startDate: string, endDate: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

export default function DateFilterModal({
  isOpen,
  onClose,
  onApply,
  initialStartDate = "",
  initialEndDate = "",
}: DateFilterModalProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setActivePreset(null);
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  // Date Utilities
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const applyPreset = (presetName: string, getDates: () => [Date, Date]) => {
    const [start, end] = getDates();
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    setActivePreset(presetName);
  };

  // Preset Handlers
  const presets = [
    {
      name: "Hari ini",
      colSpan: 2,
      getDates: () => {
        const today = new Date();
        return [today, today] as [Date, Date];
      },
    },
    {
      name: "Bulan ini",
      colSpan: 1,
      getDates: () => {
        const date = new Date();
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return [start, end] as [Date, Date];
      },
    },
    {
      name: "Kemarin",
      colSpan: 1,
      getDates: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return [yesterday, yesterday] as [Date, Date];
      },
    },
    {
      name: "7 hari sebelumnya",
      colSpan: 2,
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return [start, end] as [Date, Date];
      },
    },
    {
      name: "30 hari sebelumnya",
      colSpan: 2,
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return [start, end] as [Date, Date];
      },
    },
    {
      name: "Bulan kemarin",
      colSpan: 1,
      getDates: () => {
        const date = new Date();
        const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
        const end = new Date(date.getFullYear(), date.getMonth(), 0);
        return [start, end] as [Date, Date];
      },
    },
    {
      name: "Tahun kemarin",
      colSpan: 1,
      getDates: () => {
        const date = new Date();
        const start = new Date(date.getFullYear() - 1, 0, 1);
        const end = new Date(date.getFullYear() - 1, 11, 31);
        return [start, end] as [Date, Date];
      },
    },
    {
      name: "Tahun ini",
      colSpan: 2,
      getDates: () => {
        const date = new Date();
        const start = new Date(date.getFullYear(), 0, 1);
        const end = new Date(date.getFullYear(), 11, 31);
        return [start, end] as [Date, Date];
      },
    },
  ];

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setActivePreset(null);
    onApply("", "");
    onClose();
  };

  const handleApply = () => {
    onApply(startDate, endDate);
    onClose();
  };

  // Check if current dates match a preset to highlight it, otherwise clear highlight if custom changed
  useEffect(() => {
    if (activePreset) {
      const preset = presets.find((p) => p.name === activePreset);
      if (preset) {
        const [pStart, pEnd] = preset.getDates();
        if (formatDate(pStart) !== startDate || formatDate(pEnd) !== endDate) {
          setActivePreset(null);
        }
      }
    }
  }, [startDate, endDate]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Date Filter">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Presets */}
        <div className="w-full md:w-1/3 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset.name, preset.getDates)}
                className={cn(
                  "py-2.5 px-3 text-xs font-semibold rounded-lg transition-colors text-center w-full",
                  preset.colSpan === 2 ? "col-span-2" : "col-span-1",
                  activePreset === preset.name
                    ? "bg-black text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-200"
                )}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Custom Dates */}
        <div className="flex-1 flex flex-col justify-center">
            <label className="text-s font-semibold text-gray-600">Custom</label>
            <hr className="mb-4 border-gray-1000 border-t-2" />
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Mulai Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset(null);
                }}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:bg-white"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset(null);
                }}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-black outline-none transition focus:border-black focus:bg-white"
              />
            </div>
          </div>
          
          <div className="mt-auto hidden md:block rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Pilih rentang tanggal khusus di atas,</p>
            <p className="text-xs text-gray-500">atau pilih jalan pintas di sebelah kiri.</p>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="rounded-lg border border-gray-300 bg-gray-50 px-6 py-2 text-sm font-semibold text-black transition hover:bg-gray-100"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="rounded-lg bg-black px-8 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Terapkan
        </button>
      </div>
    </Modal>
  );
}
