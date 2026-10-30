"use client";

import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Icon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-paper text-ink">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-paper px-5">
        <Logo />
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="flex items-center justify-center rounded-full bg-mist p-2 text-ink transition hover:bg-line/50"
          >
            <Icon name="logout" className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
