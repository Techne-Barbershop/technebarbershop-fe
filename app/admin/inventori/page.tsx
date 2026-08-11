"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import Modal from "@/components/admin/Modal";
import { ADMIN_INVENTORY } from "@/lib/admin-data";
import { cn } from "@/lib/utils/cn";

const INVENTORY_STATS = [
  { label: "Total Produk", value: "124", icon: "tag" },
  { label: "Produk Hampir Habis", value: "8", icon: "info" },
  { label: "Nilai Inventori", value: "Rp 15.4 jt", icon: "dollar" },
  { label: "Produk Baru Bulan Ini", value: "12", icon: "plus" },
] as const;

type InventoryItem = (typeof ADMIN_INVENTORY)[number];

export default function InventoriPage() {
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openDetail = (product: InventoryItem) => {
    setSelectedProduct(product);
    setIsEditMode(false);
    setOpenDropdownId(null);
  };

  const openEdit = (product: InventoryItem) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setOpenDropdownId(null);
  };
  
  const handleDelete = (id: string) => {
    // Mock delete action
    setOpenDropdownId(null);
  }

  const closeModal = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {INVENTORY_STATS.map((stat) => (
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
          <h2 className="text-base font-bold text-black">Daftar Inventori Produk</h2>
          <Link
            href="/admin/inventori/baru"
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
          >
            <Icon name="plus" className="h-4 w-4" />
            Tambah Produk
          </Link>
        </div>
        <div className="overflow-x-auto pb-32">
          <table className="w-full min-w-[720px] text-sm" ref={dropdownRef}>
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-bold uppercase text-gray-500">
                <th className="px-5 py-3 whitespace-nowrap">ID Produk</th>
                <th className="px-5 py-3 whitespace-nowrap"></th>
                <th className="px-5 py-3 whitespace-nowrap">Nama Produk</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Harga</th>
                <th className="px-5 py-3 text-right whitespace-nowrap">Kuantitas</th>
                <th className="px-5 py-3 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ADMIN_INVENTORY.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-600 whitespace-nowrap">{item.id}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <Icon name="image" className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-black whitespace-nowrap">{item.name}</td>
                  <td className="px-5 py-3 text-right font-medium text-black whitespace-nowrap">
                    Rp {item.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-gray-600 whitespace-nowrap">
                    {item.quantity}
                  </td>
                  <td className="px-5 py-3 text-center relative whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-black"
                    >
                      <Icon name="moreVertical" className="h-5 w-5" />
                    </button>

                    {/* DROPDOWN MENU */}
                    {openDropdownId === item.id && (
                      <div className="absolute right-8 top-10 z-50 w-36 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                        <button
                          onClick={() => openDetail(item)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                        >
                          <Icon name="info" className="h-4 w-4" />
                          Lihat Detail
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedProduct}
        onClose={closeModal}
        title={isEditMode ? "Edit Produk" : "Detail Produk"}
      >
        {selectedProduct && (
          <div className="space-y-4">
            
            {/* THUMBNAIL PLACEHOLDER DI MODAL */}
            <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Icon name="image" className="h-8 w-8" />
                  <span className="text-xs font-medium">No Image Available</span>
                </div>
              )}
            </div>

            {isEditMode ? (
              <form className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-id" className="text-sm font-semibold text-black">ID Produk</label>
                  <input 
                    id="edit-id" 
                    type="text" 
                    defaultValue={selectedProduct.id} 
                    disabled 
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-name" className="text-sm font-semibold text-black">Nama Produk</label>
                  <input 
                    id="edit-name" 
                    type="text" 
                    defaultValue={selectedProduct.name} 
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-price" className="text-sm font-semibold text-black">Harga Produk</label>
                  <input 
                    id="edit-price" 
                    type="number" 
                    defaultValue={selectedProduct.price} 
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-qty" className="text-sm font-semibold text-black">Kuantitas</label>
                  <input 
                    id="edit-qty" 
                    type="number" 
                    defaultValue={selectedProduct.quantity} 
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" 
                  />
                </div>
                <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50">
                    Batal
                  </button>
                  <button type="button" onClick={closeModal} className="rounded-lg bg-black px-6 py-2 text-sm font-semibold text-white transition active:scale-95">
                    Simpan
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs font-bold uppercase text-gray-500">ID Produk</span>
                  <span className="font-semibold text-black">{selectedProduct.id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs font-bold uppercase text-gray-500">Nama Produk</span>
                  <span className="font-semibold text-black">{selectedProduct.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs font-bold uppercase text-gray-500">Harga</span>
                  <span className="font-semibold text-black">Rp {selectedProduct.price.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs font-bold uppercase text-gray-500">Kuantitas</span>
                  <span className="font-medium text-gray-600">{selectedProduct.quantity} Pcs</span>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={closeModal} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Tutup</button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
}
