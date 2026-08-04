"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons";
import { useBooking } from "@/context/BookingContext";
import { formatTimer } from "@/lib/format";

export default function FloatingTimer({ className }: { className?: string }) {
  const { timer } = useBooking();

  return (
    <div
      className={cn(
        "fixed right-3 top-3 z-50 flex items-center gap-1.5 rounded-full bg-charcoal px-3 py-1.5 text-paper shadow-lg",
        className,
      )}
      aria-live="off"
    >
      <Icon name="clock" className="h-3.5 w-3.5" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-paper/80">
        Timer
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums">
        {formatTimer(timer)}
      </span>
    </div>
  );
}
