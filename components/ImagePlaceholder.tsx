import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icons";

export default function ImagePlaceholder({
  icon = "image",
  label,
  className,
  iconClassName,
}: {
  icon?: IconName;
  label?: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "placeholder-stripes relative flex items-center justify-center overflow-hidden",
        className,
      )}
      role="img"
      aria-label={label ?? "Image placeholder"}
    >
      <div className="flex flex-col items-center gap-2 text-neutral-400">
        <Icon name={icon} className={cn("h-9 w-9", iconClassName)} />
        {label ? (
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
