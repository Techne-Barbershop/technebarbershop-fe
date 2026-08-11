import { Icon } from "@/components/icons";
import { ADMIN_TRANSACTIONS } from "@/lib/admin-data";

const STATS = [
  { label: "Total Pelanggan", value: "1.248", icon: "users" },
  { label: "Penjualan Bulan Ini", value: "Rp 48,5 jt", icon: "chart" },
  { label: "Kunjungan Hari Ini", value: "32", icon: "calendar" },
  { label: "Staf Aktif", value: "8", icon: "user" },
] as const;

const CHART_BARS = [42, 58, 47, 72, 65, 88, 54, 76, 61, 82, 68, 90];

const RECENT_BOOKINGS = [
  { name: "Budi Santoso", service: "Essential Cut", time: "10:00", status: "Selesai" },
  { name: "Siti Rahayu", service: "Korean Full Drip", time: "13:30", status: "Berlangsung" },
  { name: "Andi Wijaya", service: "Full Face Treatment", time: "15:00", status: "Terjadwal" },
  { name: "Dewi Lestari", service: "Black Basic Hair Coloring", time: "11:30", status: "Terjadwal" },
];

export default function BerandaPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => (
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-black">
              Penjualan Mingguan
            </h2>
            <span className="text-xs text-gray-400">Sen - Min</span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2">
            {CHART_BARS.map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t bg-gray-300"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-gray-400">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-bold text-black">Booking Terbaru</h2>
          <div className="mt-4 flex flex-col divide-y divide-gray-100">
            {RECENT_BOOKINGS.map((booking) => (
              <div key={booking.name} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                  {booking.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-black">
                    {booking.name}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {booking.service} · {booking.time}
                  </div>
                </div>
                <span className="rounded-full border border-gray-400 px-2.5 py-1 text-[10px] font-medium text-gray-600">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-bold text-black">Transaksi Terbaru</h2>
          <button
            type="button"
            className="rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-gray-50"
          >
            Lihat Semua
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                <th className="px-5 py-3 font-semibold">ID</th>
                <th className="px-5 py-3 font-semibold">Pelanggan</th>
                <th className="px-5 py-3 font-semibold">Layanan</th>
                <th className="px-5 py-3 font-semibold">Tanggal</th>
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
                    {transaction.services.join(", ")}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {transaction.date}
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
