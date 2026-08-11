"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import Modal from "@/components/admin/Modal";
import DateRangePicker from "@/components/admin/DateRangePicker";
import { cn } from "@/lib/utils/cn";
import { 
  ADMIN_TRANSACTIONS, 
  ADMIN_SALES_DETAILS, 
  ADMIN_TRANSACTIONS_LINE_ITEMS 
} from "@/lib/admin-data";

const SALES_STATS = [
  { label: "Penjualan Hari Ini", value: "Rp 3,2 jt", icon: "dollar" },
  { label: "Penjualan Bulan Ini", value: "Rp 48,5 jt", icon: "chart" },
  { label: "Transaksi Bulan Ini", value: "412", icon: "wallet" },
  { label: "Rata-rata per Transaksi", value: "Rp 117.000", icon: "info" },
] as const;

type TabType = "Detail Penjualan" | "Transaksi" | "Detail Transaksi";
const TABS: TabType[] = ["Detail Penjualan", "Transaksi", "Detail Transaksi"];

export default function PenjualanPage() {
  const [activeTab, setActiveTab] = useState<TabType>("Detail Penjualan");
  const [dateFilter, setDateFilter] = useState("Hari Ini");
  
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedLineItem, setSelectedLineItem] = useState<any>(null);

  const totalPenjualanDetail = ADMIN_SALES_DETAILS.reduce((acc, curr) => acc + curr.totalSales, 0);
  const totalPendapatanDetail = ADMIN_SALES_DETAILS.reduce((acc, curr) => acc + curr.grossRevenue, 0);

  return (
    <div className="space-y-6">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SALES_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Icon name={stat.icon as any} className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-black">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* TABS & CONTENT */}
      <div className="rounded-lg border border-gray-200 bg-white">
        
        {/* TABS HEADER WITH GLOBAL DATE PICKER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 px-2 pt-2 gap-4">
          <div className="flex flex-wrap items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "-mb-px border-b-2 px-5 py-3 text-sm font-semibold transition-colors",
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 px-3 pb-2 sm:pb-0">
            <span className="text-xs font-semibold text-gray-500">Filter Waktu:</span>
            <DateRangePicker 
              value={dateFilter} 
              onChange={setDateFilter} 
            />
          </div>
        </div>

        {/* TAB 1: Detail Penjualan */}
        {activeTab === "Detail Penjualan" && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-black">Detail Penjualan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
                    <th className="px-5 py-3 whitespace-nowrap">Tipe Item</th>
                    <th className="px-5 py-3 whitespace-nowrap">Nama Item</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Total Penjualan</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Pendapatan Kotor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ADMIN_SALES_DETAILS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        <span className={cn(
                          "rounded-md px-2 py-1 text-[10px] font-bold uppercase",
                          item.type === "Layanan" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                        )}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-black whitespace-nowrap">{item.item}</td>
                      <td className="px-5 py-3 text-right text-gray-600 whitespace-nowrap">{item.totalSales}</td>
                      <td className="px-5 py-3 text-right font-medium text-black whitespace-nowrap">
                        Rp {item.grossRevenue.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="border-t border-gray-200">
                    <td colSpan={2} className="px-5 py-3 text-right text-sm font-bold text-black uppercase whitespace-nowrap">
                      Total Penjualan Keseluruhan
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-black whitespace-nowrap">
                      {totalPenjualanDetail}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-black whitespace-nowrap">
                      Rp {totalPendapatanDetail.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Transaksi */}
        {activeTab === "Transaksi" && (
          <div>
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-black">Transaksi</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
                    <th className="px-5 py-3 whitespace-nowrap">ID Transaksi</th>
                    <th className="px-5 py-3 whitespace-nowrap">Pelanggan</th>
                    <th className="px-5 py-3 whitespace-nowrap">Staf/Worker</th>
                    <th className="px-5 py-3 min-w-[200px]">Service</th>
                    <th className="px-5 py-3 whitespace-nowrap">Waktu</th>
                    <th className="px-5 py-3 whitespace-nowrap">Durasi</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Pendapatan</th>
                    <th className="px-5 py-3 whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 text-center whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ADMIN_TRANSACTIONS.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium text-gray-600 whitespace-nowrap">{trx.id}</td>
                      <td className="px-5 py-3 font-semibold text-black whitespace-nowrap">{trx.customer}</td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{trx.workerName}</td>
                      <td className="px-5 py-3 text-gray-600 max-w-[250px] truncate">{trx.services.join(", ")}</td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{trx.date}</span>
                          <span className="text-xs text-gray-400">{trx.time}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{trx.duration} mnt</td>
                      <td className="px-5 py-3 text-right font-medium text-black whitespace-nowrap">
                        Rp {trx.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          trx.status === "Dibayar" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        )}>
                          {trx.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTransaction(trx)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-50"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Detail Transaksi */}
        {activeTab === "Detail Transaksi" && (
          <div>
             <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-black">Detail Transaksi per Service</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <table className="w-full min-w-[1200px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
                    <th className="px-5 py-3 whitespace-nowrap">ID Detail</th>
                    <th className="px-5 py-3 whitespace-nowrap">ID Transaksi</th>
                    <th className="px-5 py-3 whitespace-nowrap">Pelanggan</th>
                    <th className="px-5 py-3 whitespace-nowrap">Staf/Worker</th>
                    <th className="px-5 py-3 whitespace-nowrap">Service</th>
                    <th className="px-5 py-3 whitespace-nowrap">Waktu</th>
                    <th className="px-5 py-3 whitespace-nowrap">Durasi</th>
                    <th className="px-5 py-3 whitespace-nowrap">Status</th>
                    <th className="px-5 py-3 text-center whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ADMIN_TRANSACTIONS_LINE_ITEMS.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium text-gray-600 whitespace-nowrap">{item.id}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{item.trxId}</td>
                      <td className="px-5 py-3 font-semibold text-black whitespace-nowrap">{item.customer}</td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{item.workerName}</td>
                      <td className="px-5 py-3 font-medium text-black whitespace-nowrap">{item.service}</td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>{item.date}</span>
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{item.duration} mnt</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          item.status === "Selesai" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        )}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLineItem(item)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-50"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL TRANSAKSI HEADER */}
      <Modal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title="Detail Header Transaksi"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">ID Transaksi</span>
              <span className="font-semibold text-black">{selectedTransaction.id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Pelanggan</span>
              <span className="font-semibold text-black">{selectedTransaction.customer}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Staf/Worker</span>
              <span className="font-semibold text-black">{selectedTransaction.workerName}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Layanan/Produk ({selectedTransaction.services.length})</span>
              <div className="flex flex-col gap-1">
                {selectedTransaction.services.map((svc: string, i: number) => (
                  <span key={i} className="font-semibold text-black">- {svc}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Waktu</span>
              <span className="font-medium text-gray-600">{selectedTransaction.date} • {selectedTransaction.time}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Total Durasi</span>
              <span className="font-medium text-gray-600">{selectedTransaction.duration} Menit</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Pendapatan Kotor</span>
              <span className="text-lg font-bold text-black">Rp {selectedTransaction.amount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedTransaction(null)} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Tutup</button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL LINE ITEM */}
      <Modal
        isOpen={!!selectedLineItem}
        onClose={() => setSelectedLineItem(null)}
        title="Detail Line-Item"
      >
        {selectedLineItem && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">ID Detail</span>
              <span className="font-semibold text-black">{selectedLineItem.id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">ID Transaksi (Induk)</span>
              <span className="font-semibold text-gray-600">{selectedLineItem.trxId}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Pelanggan</span>
              <span className="font-semibold text-black">{selectedLineItem.customer}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Staf/Worker</span>
              <span className="font-semibold text-black">{selectedLineItem.workerName}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Layanan/Service</span>
              <span className="text-lg font-bold text-black">{selectedLineItem.service}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Waktu Pelaksanaan</span>
              <span className="font-medium text-gray-600">{selectedLineItem.date} • {selectedLineItem.time}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Durasi</span>
              <span className="font-medium text-gray-600">{selectedLineItem.duration} Menit</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Status</span>
              <span className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                selectedLineItem.status === "Selesai" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              )}>
                {selectedLineItem.status}
              </span>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedLineItem(null)} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Tutup</button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
