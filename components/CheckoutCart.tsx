"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import {
  formatDurationShort,
  formatPrice,
  sumDurations,
} from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Service } from "@/lib/types/admin";

export default function CheckoutCart({
  items,
  onRemove,
  onNext,
}: {
  items: Service[];
  onRemove: (id: string) => void;
  onNext: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const count = items.length;
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + parseFloat(item.price), 0),
    [items],
  );
  const totalDuration = useMemo(
    () => items.reduce((sum, item) => sum + item.duration_minutes, 0),
    [items],
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto w-full max-w-md">
        {expanded ? (
          <div className="animate-fade-in max-h-[42dvh] overflow-y-auto border-t border-line bg-paper">
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[14px] font-bold text-ink">
                  Selected Services
                </h3>
                <span className="text-[12px] text-graphite">
                  {count} item{count === 1 ? "" : "s"} ·{" "}
                  {formatDurationShort(totalDuration)}
                </span>
              </div>
              <div className="mt-1 flex flex-col divide-y divide-fog">
                {items.map((item) => (
                  <div
                    key={item.service_id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <span className="min-w-0 truncate text-[12px] font-semibold tracking-wide text-graphite uppercase">
                      {item.name} ({formatDurationShort(item.duration_minutes)})
                    </span>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className="text-[12.5px] text-graphite">
                        (1) {parseFloat(item.price).toLocaleString("id-ID")}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemove(item.service_id)}
                        aria-label={`Remove ${item.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-graphite transition hover:bg-fog active:scale-90"
                      >
                        <Icon name="close" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {count === 0 ? (
                  <p className="py-3 text-[12px] text-graphite">
                    No services selected yet.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-3 border-t border-line bg-paper px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] text-graphite">
              {count === 0
                ? "No item"
                : `${count} item${count === 1 ? "" : "s"}`}
            </div>
            <div className="truncate text-[16px] font-bold text-ink">
              {formatPrice(totalPrice)}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-label={expanded ? "Hide cart details" : "Show cart details"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-fog text-graphite transition active:scale-95"
          >
            <Icon name={expanded ? "chevronDown" : "chevronUp"} className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={count === 0}
            className={cn(
              "h-12 flex-1 rounded-xl bg-ink text-[15px] font-semibold text-paper transition active:scale-[0.99]",
              count === 0 && "cursor-not-allowed bg-fog text-smoke",
            )}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
