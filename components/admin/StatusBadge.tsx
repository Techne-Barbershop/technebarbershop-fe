import { cn } from "@/lib/utils/cn";

export default function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const muted = status === "Tidak Aktif";
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        muted
          ? "border-gray-400 text-gray-500"
          : "border-black text-black",
        className,
      )}
    >
      {status}
    </span>
  );
}
