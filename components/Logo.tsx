import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons";

export default function Logo({
  light = false,
  compact = false,
  className,
}: {
  light?: boolean;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md",
          light ? "bg-paper text-ink" : "bg-ink text-paper",
        )}
      >
        <Icon name="scissors" className="h-4.5 w-4.5" />
      </div>
      {!compact ? (
        <div className="leading-none">
          <div
            className={cn(
              "text-sm font-extrabold uppercase tracking-wide",
              light ? "text-paper" : "text-ink",
            )}
          >
            Techné a
          </div>
          <div
            className={cn(
              "text-[9px] font-medium uppercase tracking-[0.35em]",
              light ? "text-paper/80" : "text-graphite",
            )}
          >
            Barbershop
          </div>
        </div>
      ) : null}
    </div>
  );
}
