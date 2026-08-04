"use client";

import { BookingProvider } from "@/context/BookingContext";
import Header from "@/components/Header";
import FloatingTimer from "@/components/FloatingTimer";

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      <Header />
      <FloatingTimer />
      <main className="mx-auto w-full max-w-md min-h-[100dvh] px-5 pt-6 pb-28">
        {children}
      </main>
    </BookingProvider>
  );
}
