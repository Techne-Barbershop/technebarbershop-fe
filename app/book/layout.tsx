"use client";

import Header from "@/components/Header";

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-md min-h-[100dvh] px-5 pt-6 pb-28">
        {children}
      </main>
    </>
  );
}
