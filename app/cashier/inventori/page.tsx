"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/icons";
import Modal from "@/components/admin/Modal";
import { useApiPath } from "@/lib/useApi";
import type { Product, ProductsResponse } from "@/lib/types/admin";

function formatRupiah(value: string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
}

export default function CashierInventoriPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLTableElement>(null);

  const { data, loading, error } = useApiPath<{ data: ProductsResponse }>("/api/admin/products");
  const products = data?.data.products ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setOpenDropdownId(null);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-black">Daftar Inventori Produk</h2>
            <p className="mt-0.5 text-xs text-gray-400">{products.length} produk</p>
          </div>
        </div>

        {loading && <p className="px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
        {error && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto pb-32">
            <table className="w-full min-w-[720px] text-sm" ref={dropdownRef}>
              <thead className="border-b border-gray-100 bg-gray-50/50">
                <tr className="text-left text-xs font-bold uppercase text-gray-500">
                  <th className="px-5 py-4 whitespace-nowrap">PRODUK</th>
                  <th className="px-5 py-4 whitespace-nowrap">ID PRODUK</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">HARGA</th>
                  <th className="px-5 py-4 text-right whitespace-nowrap">KUANTITAS</th>
                  <th className="px-5 py-4 text-center whitespace-nowrap">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-sm text-gray-400">
                      Belum ada produk.
                    </td>
                  </tr>
                )}
                {products.map((item) => (
                  <tr key={item.product_id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <Icon name="image" className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="font-bold text-black">{item.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{item.product_id}</td>
                    <td className="px-5 py-3 text-right font-medium text-black whitespace-nowrap">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-gray-600 whitespace-nowrap">
                      {item.current_stock}
                    </td>
                    <td className="px-5 py-3 text-center relative whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === item.product_id ? null : item.product_id);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-black"
                      >
                        <Icon name="moreVertical" className="h-5 w-5" />
                      </button>

                      {openDropdownId === item.product_id && (
                        <div className="absolute right-8 top-10 z-50 w-36 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                          <button
                            onClick={() => openDetail(item)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                          >
                            <Icon name="info" className="h-4 w-4" />
                            Lihat Detail
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!selectedProduct} onClose={closeModal} title="Detail Produk">
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex h-48 w-48 mx-auto items-center justify-center overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
              {selectedProduct.image_url ? (
                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="h-full w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Icon name="image" className="h-8 w-8" />
                  <span className="text-xs font-medium">No Image Available</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase text-gray-500">ID Produk</span>
                <span className="font-semibold text-black">{selectedProduct.product_id}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase text-gray-500">Nama Produk</span>
                <span className="font-semibold text-black">{selectedProduct.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase text-gray-500">Harga</span>
                <span className="font-semibold text-black">{formatRupiah(selectedProduct.price || "0")}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase text-gray-500">Kuantitas</span>
                <span className="font-medium text-gray-600">{selectedProduct.current_stock} Pcs</span>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={closeModal} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

