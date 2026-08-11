import { useState } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

interface CalendarProps {
  value?: Date | null;
  onChange: (date: Date) => void;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function Calendar({ value, onChange }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(value || new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    onChange(new Date(year, month, day));
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    return value.getDate() === day && value.getMonth() === month && value.getFullYear() === year;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  // Generate blank cells for days before the 1st of the month
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  // Generate days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="w-full min-w-[260px] rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-black"
        >
          <Icon name="chevronLeft" className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-black">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-black"
        >
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map(b => (
          <div key={`blank-${b}`} className="h-8 w-8"></div>
        ))}
        {days.map(d => (
          <button
            key={d}
            onClick={() => handleDateClick(d)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
              isSelected(d) 
                ? "bg-black text-white shadow-md scale-105" 
                : isToday(d)
                  ? "bg-gray-100 text-black border border-gray-300"
                  : "text-gray-700 hover:bg-gray-100 hover:text-black"
            )}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
