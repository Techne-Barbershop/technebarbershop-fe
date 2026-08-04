"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import Logo from "@/components/Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-fog bg-paper">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between pr-[7.5rem] pl-5">
        <Link href="/" aria-label="Hairnerds Studio home">
          <Logo />
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="hidden rounded-full border border-ink px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink transition active:scale-95 min-[400px]:inline-flex"
          >
            Visit Membership
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-mist text-graphite">
            <Icon name="user" className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
