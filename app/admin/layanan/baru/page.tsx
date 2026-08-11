"use client";

import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils/cn";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black outline-none placeholder:text-gray-400 transition focus:border-black focus:ring-1 focus:ring-black";

export default function LayananBaruPage() {
  const router = useRouter();

  return (
    <div className="pb-28">
      <div className="mb-4 flex items-center gap-3">
        <BackButton href="/admin/layanan" />
        <h1 className="text-lg font-bold text-black">Tambah Layanan Baru</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="p-5 md:p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-black">
                Nama Layanan
              </label>
              <input id="name" type="text" placeholder="Contoh: Essential Cut" className={INPUT_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="type" className="text-sm font-semibold text-black">
                Type
              </label>
              <select id="type" defaultValue="" className={INPUT_CLASS}>
                <option value="" disabled>
                  Pilih tipe layanan
                </option>
                <option>Haircut</option>
                <option>Chemical</option>
                <option>Coloring</option>
                <option>Treatment</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="duration" className="text-sm font-semibold text-black">
                Durasi
              </label>
              <input id="duration" type="number" placeholder="Menit, contoh: 45" className={INPUT_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="price" className="text-sm font-semibold text-black">
                Harga Retail
              </label>
              <input id="price" type="number" placeholder="Rp" className={INPUT_CLASS} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="description" className="text-sm font-semibold text-black">
                Deskripsi
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Deskripsi singkat layanan..."
                className={cn(INPUT_CLASS, "resize-none")}
              />
            </div>
            <div className="md:col-span-2">
              <span className="text-sm font-semibold text-black">
                Foto Layanan
              </span>
              <div className="mt-1.5 flex aspect-[16/5] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-black bg-white text-gray-400 transition hover:bg-gray-50">
                <Icon name="image" className="h-8 w-8" />
                <span className="text-xs font-medium">Upload foto layanan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-end gap-3 px-4 py-3 md:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => router.push("/admin/layanan")}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/layanan")}
            className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white transition active:scale-95"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
