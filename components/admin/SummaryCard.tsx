"use client";

import { cn } from "@/lib/utils/cn";

export default function SummaryCard({
  rows,
  className,
}: {
  rows: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-gray-200 bg-white", className)}>
      <ul className="divide-y divide-gray-100">
        {rows.map((row, index) => (
          <li
            key={row.label}
            className={cn(
              "flex items-center justify-between px-5 py-3.5",
              index % 2 === 1 ? "bg-gray-50" : "bg-white",
            )}
          >
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="text-sm font-bold text-black">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
