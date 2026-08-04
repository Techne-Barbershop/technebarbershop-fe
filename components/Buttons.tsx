import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PrimaryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={cn(
        "inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-[15px] font-semibold text-paper transition active:scale-[0.99] disabled:bg-fog disabled:text-smoke",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={cn(
        "inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-line bg-paper text-[15px] font-semibold text-ink transition active:scale-[0.99]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
