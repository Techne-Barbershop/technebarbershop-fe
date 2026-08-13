"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import Modal from "@/components/admin/Modal";
import { api } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { Product, ProductsResponse } from "@/lib/types/admin";

function formatRupiah(value: string): string {
  const num = Number(value);
  if (Number.isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
}

export default function InventoriPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", current_stock: 0 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const dropdownRef = useRef<HTMLTableElement>(null);

  const { data, loading, error, refetch } = useApiPath<{ data: ProductsResponse }>("/api/admin/products");
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
    setIsEditMode(false);
    setOpenDropdownId(null);
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({ name: product.name, price: product.price, current_stock: product.current_stock });
    setIsEditMode(true);
    setOpenDropdownId(null);
    setFormError("");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus produk ini?")) return;
    try {
      await api(`/api/admin/products/${id}`, { method: "DELETE" });
      setOpenDropdownId(null);
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus produk");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);
    try {
      await api(`/api/admin/products/${selectedProduct.product_id}`, {
        method: "PUT",
        body: {
          name: editForm.name,
          current_stock: Number(editForm.current_stock),
          price: editForm.price,
          image_url: selectedProduct.image_url,
        },
      });
      setSelectedProduct(null);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-black">Daftar Inventori Produk</h2>
            <p className="mt-0.5 text-xs text-gray-400">{products.length} produk</p>
          </div>
          <Link
            href="/admin/inventori/baru"
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
          >
            <Icon name="plus" className="h-4 w-4" />
            Tambah Produk
          </Link>
        </div>

        {loading && <p className="px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
        {error && <p className="px-5 py-6 text-sm text-red-500">{error}</p>}
        {!loading && !error && (
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
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-sm text-gray-400">Belum ada produk.</td>
                  </tr>
                )}
                {products.map((item) => (
                  <tr key={item.product_id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-600 whitespace-nowrap">{item.product_id}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <Icon name="image" className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-black whitespace-nowrap">{item.name}</td>
                    <td className="px-5 py-3 text-right font-medium text-black whitespace-nowrap">{formatRupiah(item.price)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-600 whitespace-nowrap">{item.current_stock}</td>
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
                          <button
                            onClick={() => openEdit(item)}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.product_id)}
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
        )}
      </div>

      <Modal isOpen={!!selectedProduct} onClose={closeModal} title={isEditMode ? "Edit Produk" : "Detail Produk"}>
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
              {selectedProduct.image_url ? (
                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Icon name="image" className="h-8 w-8" />
                  <span className="text-xs font-medium">No Image Available</span>
                </div>
              )}
            </div>

            {isEditMode ? (
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-id" className="text-sm font-semibold text-black">ID Produk</label>
                  <input id="edit-id" type="text" value={selectedProduct.product_id} disabled className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-name" className="text-sm font-semibold text-black">Nama Produk</label>
                  <input id="edit-name" type="text" required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-price" className="text-sm font-semibold text-black">Harga Produk</label>
                  <input id="edit-price" type="number" min={0} required value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-qty" className="text-sm font-semibold text-black">Kuantitas</label>
                  <input id="edit-qty" type="number" min={0} required value={editForm.current_stock} onChange={(e) => setEditForm({ ...editForm, current_stock: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" />
                </div>
                {formError && <p className="text-xs font-medium text-red-500">{formError}</p>}
                <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50">
                    Batal
                  </button>
                  <button type="submit" disabled={saving} className="rounded-lg bg-black px-6 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50">
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            ) : (
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
                  <span className="font-semibold text-black">{formatRupiah(selectedProduct.price)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs font-bold uppercase text-gray-500">Kuantitas</span>
                  <span className="font-medium text-gray-600">{selectedProduct.current_stock} Pcs</span>
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
