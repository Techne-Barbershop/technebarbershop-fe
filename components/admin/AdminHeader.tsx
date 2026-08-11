"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import Avatar from "@/components/admin/Avatar";

const TITLES: Record<string, string> = {
  "/admin/beranda": "Beranda",
  "/admin/kalender": "Kalender",
  "/admin/penjualan": "Penjualan",
  "/admin/pelanggan": "Pelanggan",
  "/admin/staf": "Staf",
  "/admin/layanan": "Layanan",
  "/admin/layanan/baru": "Layanan Baru",
};

export default function AdminHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Admin";

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center gap-3 px-4 md:gap-4 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-black transition active:scale-95 lg:hidden"
        >
          <Icon name="menu" className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-black">{title}</h1>
        <div className="ml-auto hidden items-center gap-3 md:flex">
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Cari..."
              className="h-9 w-56 rounded-lg border border-transparent bg-gray-100 pr-3 pl-9 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black focus:bg-white focus:ring-1 focus:ring-black"
            />
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition active:scale-95 hover:bg-gray-50"
          >
            <Icon name="bell" className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition active:scale-95 hover:bg-gray-50"
          >
            <Icon name="settings" className="h-4.5 w-4.5" />
          </button>
          <Avatar name="Admin Hairnerds" size="sm" />
        </div>
      </div>
    </header>
  );
}
