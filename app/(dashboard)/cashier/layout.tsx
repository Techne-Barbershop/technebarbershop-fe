"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "CASHIER" && user.role !== "ADMIN"))) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || (user.role !== "CASHIER" && user.role !== "ADMIN")) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper">
        <p className="text-sm text-graphite">Memuat...</p>
      </div>
    );
  }

  return <>{children}</>;
}
