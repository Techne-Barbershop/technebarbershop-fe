"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CashierSidebar from "@/components/cashier/CashierSidebar";
import CashierHeader from "@/components/cashier/CashierHeader";

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "CASHIER" && user.role !== "ADMIN"))) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || (user.role !== "CASHIER" && user.role !== "ADMIN")) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CashierSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64">
        <CashierHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
