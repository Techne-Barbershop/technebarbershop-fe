"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin/beranda", label: "Beranda", icon: "home" },
  { href: "/admin/kalender", label: "Kalender", icon: "calendar" },
  { href: "/admin/penjualan", label: "Penjualan", icon: "chart" },
  { href: "/admin/pelanggan", label: "Pelanggan", icon: "users" },
  { href: "/admin/staf", label: "Staf", icon: "user" },
  { href: "/admin/layanan", label: "Layanan", icon: "scissors" },
  { href: "/admin/inventori", label: "Inventori", icon: "box" },
];

export default function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
            <Icon name="scissors" className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <div className="text-sm font-extrabold tracking-wide text-black uppercase">
              Hairnerds
            </div>
            <div className="mt-1 text-[10px] tracking-[0.3em] text-gray-400 uppercase">
              Admin Panel
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive(item.href)
                  ? "bg-gray-100 font-bold text-black"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black",
              )}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-black"
          >
            <Icon name="logout" className="h-5 w-5" />
            Kembali ke Aplikasi
          </Link>
        </div>
      </aside>
    </>
  );
}
