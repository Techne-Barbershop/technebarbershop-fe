"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";

export default function CashierOrderPage() {
  return (
    <div className="flex flex-col gap-6 p-2 md:p-4 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/cashier/walkin"
          className="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-black hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-110">
            <Icon name="plus" className="h-8 w-8" />
          </div>
          <div className="text-center items-center">
            <h2 className="text-xl font-bold text-black">Walk In</h2>
            <p className="mt-2 text-sm text-gray-500">
              Buat reservasi langsung di tempat untuk pelanggan yang datang tanpa janji.
            </p>
          </div>
        </Link>
        
        <Link
          href="/cashier/product"
          className="group flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:border-black hover:shadow-md active:scale-[0.98]"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-110">
            <Icon name="tag" className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-black">Beli Produk</h2>
            <p className="mt-2 text-sm text-gray-500">
              Jual produk retail, pomade, atau merchandise kepada pelanggan.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
