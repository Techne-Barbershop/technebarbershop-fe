"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import Logo from "@/components/Logo";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-fog bg-paper">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between pr-[7.5rem] pl-5">
        <Link href="/" aria-label="Techné a Barbershop home">
          <Logo />
        </Link>
      </div>
    </header>
  );
}
