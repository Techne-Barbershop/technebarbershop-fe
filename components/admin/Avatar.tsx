import { cn } from "@/lib/utils/cn";

export default function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const sizes = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
  };
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-600",
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
