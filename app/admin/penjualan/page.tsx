import { Icon } from "@/components/icons";
import { ADMIN_TRANSACTIONS } from "@/lib/admin-data";

const SALES_STATS = [
  { label: "Penjualan Hari Ini", value: "Rp 3,2 jt", icon: "dollar" },
  { label: "Penjualan Bulan Ini", value: "Rp 48,5 jt", icon: "chart" },
  { label: "Transaksi Bulan Ini", value: "412", icon: "wallet" },
  { label: "Rata-rata per Transaksi", value: "Rp 117.000", icon: "info" },
] as const;

export default function PenjualanPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SALES_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Icon name={stat.icon} className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-black">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-bold text-black">Riwayat Transaksi</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-gray-50"
            >
              <Icon name="download" className="h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-gray-50"
            >
              <Icon name="filter" className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Pelanggan</th>
                <th className="px-5 py-3 font-semibold">Layanan</th>
                <th className="px-5 py-3 font-semibold">Tanggal</th>
                <th className="px-5 py-3 font-semibold">Waktu</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ADMIN_TRANSACTIONS.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-600">
                    {transaction.id}
                  </td>
                  <td className="px-5 py-3 font-semibold text-black">
                    {transaction.customer}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {transaction.service}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {transaction.date}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {transaction.time}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-black">
                    {transaction.amount.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
