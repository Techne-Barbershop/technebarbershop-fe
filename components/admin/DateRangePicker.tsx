"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/icons";
import Calendar from "@/components/admin/Calendar";
import { cn } from "@/lib/utils/cn";

interface DateRangePickerProps {
  value: string;
  onChange: (val: string) => void;
}

const PRESETS = ["Hari Ini", "Minggu Ini", "Bulan Ini", "Tahun Ini"];

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomView, setIsCustomView] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // reset custom view state if closed without applying
        setTimeout(() => setIsCustomView(false), 200);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleSelectPreset = (preset: string) => {
    onChange(preset);
    setIsOpen(false);
    setIsCustomView(false);
  };

  const handleApplyCustom = () => {
    if (startDate && endDate) {
      onChange(`${formatDate(startDate)} - ${formatDate(endDate)}`);
      setIsOpen(false);
      setIsCustomView(false);
    }
  };

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
      setTimeout(() => setIsCustomView(false), 200);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-50 focus:border-black focus:ring-1 focus:ring-black outline-none"
      >
        <Icon name="clock" className="h-4 w-4 text-gray-500" />
        <span>{value}</span>
        <Icon name="chevronDown" className={cn("h-3 w-3 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* POPOVER DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl transition-all">
          
          {!isCustomView ? (
            <div className="flex w-48 flex-col py-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={cn(
                    "px-4 py-2 text-left text-sm font-semibold transition-colors hover:bg-gray-50",
                    value === preset ? "text-black bg-gray-50" : "text-gray-600"
                  )}
                >
                  {preset}
                </button>
              ))}
              <div className="my-1 h-px w-full bg-gray-100"></div>
              <button
                onClick={() => setIsCustomView(true)}
                className={cn(
                  "px-4 py-2 text-left text-sm font-semibold transition-colors hover:bg-gray-50",
                  value.includes(" - ") ? "text-black bg-gray-50" : "text-gray-600"
                )}
              >
                Custom Range...
              </button>
            </div>
          ) : (
            <div className="p-4 w-[280px] sm:w-[580px]">
              <div className="mb-4 flex items-center gap-2">
                <button 
                  onClick={() => setIsCustomView(false)}
                  className="rounded p-1 hover:bg-gray-100 transition"
                >
                  <Icon name="chevronLeft" className="h-4 w-4 text-gray-500" />
                </button>
                <span className="text-sm font-bold text-black">Pilih Rentang Kustom</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 text-center uppercase tracking-wider">Mulai</label>
                  <Calendar value={startDate} onChange={setStartDate} />
                </div>
                
                <div className="hidden sm:flex flex-col items-center justify-center">
                  <div className="h-full w-px bg-gray-200 mt-6"></div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 text-center uppercase tracking-wider">Akhir</label>
                  <Calendar value={endDate} onChange={setEndDate} />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setTimeout(() => setIsCustomView(false), 200);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleApplyCustom}
                  disabled={!startDate || !endDate}
                  className="rounded-lg bg-black px-6 py-2 text-xs font-semibold text-white transition disabled:opacity-50 active:scale-95"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
