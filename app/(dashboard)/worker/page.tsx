"use client";

import { useState, useMemo } from "react";
import { MOCK_RESERVATIONS } from "@/lib/constants";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

const TABS: { id: ReservationStatus; label: string }[] = [
  { id: "Booked", label: "Booked" },
  { id: "Completed", label: "Completed" },
  { id: "Canceled", label: "Canceled" },
];

export default function WorkerDashboardPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState<ReservationStatus>("Booked");
  
  // Local state to simulate backend updates
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);

  // Filter reservations based on selected date and tab
  const filteredReservations = useMemo(() => {
    return reservations.filter(
      (res) => res.date === selectedDate && res.status === activeTab
    );
  }, [reservations, selectedDate, activeTab]);

  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
    );
  };

  return (
    <div className="flex flex-col pb-20">
      {/* Date Picker Section */}
      <div className="sticky top-16 z-40 border-b border-line bg-paper/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-ink">My Schedule</h1>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 w-36 rounded-lg border border-line bg-paper px-3 text-[13px] font-semibold text-ink outline-none focus:border-ink"
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex h-9 items-center justify-center whitespace-nowrap rounded-full px-5 text-[13px] font-semibold transition active:scale-95",
                  isActive
                    ? "bg-ink text-paper"
                    : "border border-line bg-paper text-ink hover:bg-mist"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reservation List */}
      <div className="mt-4 flex flex-col gap-4 px-5">
        {filteredReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-graphite">
            <Icon name="calendar" className="mb-4 h-12 w-12 opacity-20" />
            <p className="text-[14px]">No {activeTab.toLowerCase()} reservations found for this date.</p>
          </div>
        ) : (
          filteredReservations.map((res) => (
            <div
              key={res.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-ink">{res.customerName}</h3>
                  <p className="text-[13px] font-medium text-graphite">
                    {res.time} • {res.serviceName}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                    res.status === "Booked" && "bg-mist text-ink",
                    res.status === "Completed" && "bg-ink text-paper",
                    res.status === "Canceled" && "border border-line text-smoke"
                  )}
                >
                  {res.status}
                </div>
              </div>

              {/* Action Buttons */}
              {res.status === "Booked" && (
                <div className="mt-2 flex gap-2 border-t border-line/50 pt-4">
                  <button
                    onClick={() => handleStatusChange(res.id, "Canceled")}
                    className="flex-1 rounded-xl border border-line bg-paper py-2.5 text-[13px] font-bold text-ink transition hover:bg-mist active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusChange(res.id, "Completed")}
                    className="flex-1 rounded-xl bg-ink py-2.5 text-[13px] font-bold text-paper transition active:scale-95"
                  >
                    Mark Completed
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
