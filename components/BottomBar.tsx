import { cn } from "@/lib/utils/cn";

export default function BottomBar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-fog bg-paper/95 backdrop-blur",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-md gap-3 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </div>
  );
}
