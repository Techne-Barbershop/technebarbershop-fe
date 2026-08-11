"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

export default function AdminFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, []);

  if (pathname.startsWith("/admin/layanan/baru")) return null;

  return (
    <div
      ref={containerRef}
      className="fixed right-6 bottom-6 z-40 flex flex-col items-end gap-3"
    >
      {open ? (
        <div className="w-48 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg">
          <Link
            href="/admin/layanan/baru"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-100"
          >
            <Icon name="plus" className="h-4 w-4" />
            New Service
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-100"
          >
            <Icon name="tag" className="h-4 w-4" />
            New Category
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Create new"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-lg transition active:scale-95"
      >
        <Icon name={open ? "close" : "plus"} className="h-6 w-6" />
      </button>
    </div>
  );
}
