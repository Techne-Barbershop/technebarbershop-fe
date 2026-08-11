import {
  getMonthMatrix,
  MONTHS_LONG,
  WEEKDAYS,
  toISODate,
} from "@/lib/utils/availability";

const BOOKED_DAYS = new Set(["2026-08-03", "2026-08-05", "2026-08-08", "2026-08-11", "2026-08-14", "2026-08-17", "2026-08-19", "2026-08-22", "2026-08-25", "2026-08-28"]);

export default function KalenderPage() {
  const cells = getMonthMatrix(2026, 7);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-black">
          {MONTHS_LONG[7]} 2026
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50"
          >
            {"<"}
          </button>
          <span className="px-2 font-semibold text-black">Hari Ini</span>
          <button
            type="button"
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50"
          >
            {">"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-gray-400"
          >
            {day}
          </div>
        ))}
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="min-h-20" />;
          }
          const iso = toISODate(cell);
          const isToday = iso === "2026-08-11";
          const hasBooking = BOOKED_DAYS.has(iso);
          return (
            <div
              key={iso}
              className={`flex min-h-20 flex-col items-center gap-1 rounded-lg border p-2 ${
                isToday
                  ? "border-black bg-gray-100"
                  : "border-gray-100"
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  isToday ? "text-black" : "text-gray-600"
                }`}
              >
                {cell.getDate()}
              </span>
              {hasBooking ? (
                <div className="h-1.5 w-1.5 rounded-full bg-black" />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-5 text-xs text-gray-500">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-black" />
          Ada booking
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-black bg-gray-100" />
          Hari ini
        </span>
      </div>
    </div>
  );
}
