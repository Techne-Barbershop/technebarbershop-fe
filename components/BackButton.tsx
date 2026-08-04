import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons";

export default function BackButton({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Go back"
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-ink transition active:scale-95",
        className,
      )}
    >
      <Icon name="chevronLeft" className="h-5 w-5" />
    </Link>
  );
}
