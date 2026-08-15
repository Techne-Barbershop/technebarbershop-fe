"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "CAPSTER")) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "CAPSTER") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper">
        <p className="text-sm text-graphite">Memuat...</p>
      </div>
    );
  }

  return <>{children}</>;
}
