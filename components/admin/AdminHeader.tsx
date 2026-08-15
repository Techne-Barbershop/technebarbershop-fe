"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import Avatar from "@/components/admin/Avatar";
import { useAuth } from "@/context/AuthContext";

const TITLES: Record<string, string> = {
  "/admin/beranda": "Beranda",
  "/admin/kalender": "Kalender",
  "/admin/penjualan": "Penjualan",
  "/admin/pelanggan": "Pelanggan",
  "/admin/staf": "Staf",
  "/admin/layanan": "Layanan",
  "/admin/layanan/baru": "Layanan Baru",
  "/admin/inventori": "Inventori",
  "/admin/inventori/baru": "Tambah Produk",
  "/admin/analytics/item-sales": "Penjualan berdasarkan item",
  "/admin/analytics/payments": "Ringkasan pembayaran",
};

export default function AdminHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const title = TITLES[pathname] ?? "Admin";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition active:scale-95 hover:bg-gray-50"
          >
            <Icon name="bell" className="h-4.5 w-4.5" />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition active:scale-95 hover:bg-gray-50"
          >
            <Icon name="logout" className="h-4.5 w-4.5" />
          </button>
          <Avatar name={user?.name ?? "Admin"} size="sm" />
        </div>
      </div>
    </header>
  );
}
