"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/icons";
import Modal from "@/components/admin/Modal";
import { api } from "@/lib/api";
import { useApiPath } from "@/lib/useApi";
import type { Category, Service, CategoriesResponse } from "@/lib/types/admin";
import { formatDuration, formatPrice } from "@/lib/utils/format";
import ImageUpload from "@/components/admin/ImageUpload";

export default function LayananPage() {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<{ type: "category" | "service"; id: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [modalState, setModalState] = useState<{
    type: "category" | "service";
    mode: "add" | "edit" | "detail";
    data?: Category | Service | null;
    categoryId?: string; // used when adding service
  } | null>(null);

  const [catForm, setCatForm] = useState({ name: "", description: "", image_url: "" });
  const [svcForm, setSvcForm] = useState({ name: "", duration_minutes: 0, price: "", description: "", image_url: "", category_id: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const { data, loading, error, refetch } = useApiPath<{ data: CategoriesResponse }>("/api/admin/categories");
  const categories = data?.data.categories ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategory = (id: string) => {
    setOpenCategories((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const totalServices = categories.reduce((total, category) => total + category.services.length, 0);

  // --- ACTIONS ---

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Hapus kategori ini? Semua layanan di dalamnya juga akan terhapus!")) return;
    try {
      await api(`/api/admin/categories/${id}`, { method: "DELETE" });
      setOpenDropdown(null);
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus kategori");
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm("Hapus layanan ini?")) return;
    try {
      await api(`/api/admin/services/${serviceId}`, { method: "DELETE" });
      setOpenDropdown(null);
      refetch();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Gagal menghapus layanan");
    }
  };

  const closeModal = () => {
    setModalState(null);
    setFormError("");
  };

  // --- CATEGORY SUBMITS ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalState?.mode === "add") {
        await api(`/api/admin/categories`, { method: "POST", body: catForm });
      } else if (modalState?.mode === "edit" && modalState.data) {
        await api(`/api/admin/categories/${(modalState.data as Category).category_id}`, { method: "PUT", body: catForm });
      }
      closeModal();
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan kategori");
    } finally {
      setSaving(false);
    }
  };

  // --- SERVICE SUBMITS ---
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modalState?.mode === "add") {
        await api(`/api/admin/services`, { method: "POST", body: svcForm });
      } else if (modalState?.mode === "edit" && modalState.data) {
        await api(`/api/admin/services/${(modalState.data as Service).service_id}`, { method: "PUT", body: svcForm });
      }
      closeModal();
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan layanan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {categories.length} kategori · {totalServices} layanan
        </p>
        <button
          onClick={() => {
            setCatForm({ name: "", description: "", image_url: "" });
            setModalState({ type: "category", mode: "add" });
          }}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95 hover:bg-gray-800"
        >
          <Icon name="plus" className="h-4 w-4" />
          Tambah Kategori
        </button>
      </div>

      {loading && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Memuat data...</p>}
      {error && <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-red-500">{error}</p>}
      {!loading && !error && categories.length === 0 && (
        <p className="rounded-lg border border-gray-200 bg-white px-5 py-6 text-sm text-gray-400">Belum ada kategori layanan.</p>
      )}

      {categories.map((category) => {
        const isOpen = openCategories.includes(category.category_id);
        const isCatDropdownOpen = openDropdown?.type === "category" && openDropdown.id === category.category_id;

        return (
          <div key={category.category_id} className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className={`flex w-full items-center gap-3 px-5 py-4 bg-gray-50/50 transition-colors ${isOpen ? "border-b border-gray-200 rounded-t-lg" : "rounded-lg"}`}>
              <div className="placeholder-stripes flex h-12 w-32 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 bg-white overflow-hidden">
                {category.image_url ? (
                  <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
                ) : (
                  <Icon name="image" className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleCategory(category.category_id)}>
                <div className="truncate text-sm font-bold text-black uppercase">{category.name}</div>
                <div className="text-xs text-gray-500">{category.services.length} layanan</div>
              </div>
              
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(isCatDropdownOpen ? null : { type: "category", id: category.category_id });
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-200 hover:text-black"
                >
                  <Icon name="moreVertical" className="h-5 w-5" />
                </button>
                {isCatDropdownOpen && (
                  <div className="absolute right-0 top-10 z-50 w-36 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                    <button
                      onClick={() => {
                        setModalState({ type: "category", mode: "detail", data: category });
                        setOpenDropdown(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                    >
                      <Icon name="info" className="h-4 w-4" /> Detail
                    </button>
                    <button
                      onClick={() => {
                        setCatForm({ name: category.name, description: category.description, image_url: category.image_url });
                        setModalState({ type: "category", mode: "edit", data: category });
                        setOpenDropdown(null);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                    >
                      <Icon name="edit" className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.category_id)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Icon name="trash" className="h-4 w-4" /> Hapus
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => toggleCategory(category.category_id)} className="h-8 w-8 inline-flex items-center justify-center text-gray-400 hover:text-black transition">
                <Icon name={isOpen ? "chevronUp" : "chevronDown"} className="h-5 w-5" />
              </button>
            </div>

            {isOpen && (
              <div className="divide-y divide-gray-100 bg-white rounded-b-lg">
                <div className="bg-gray-50/30 px-5 py-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSvcForm({ name: "", duration_minutes: 0, price: "", description: "", image_url: "", category_id: category.category_id });
                      setModalState({ type: "service", mode: "add", categoryId: category.category_id });
                    }}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-gray-100"
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" /> Tambah Layanan
                  </button>
                </div>

                {category.services.length === 0 && (
                  <p className="px-5 py-4 text-xs text-gray-400">Belum ada layanan dalam kategori ini.</p>
                )}
                {category.services.map((service) => {
                  const isSvcDropdownOpen = openDropdown?.type === "service" && openDropdown.id === service.service_id;
                  
                  return (
                    <div key={service.service_id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                      <div className="placeholder-stripes flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 text-gray-400 bg-white">
                        {service.image_url ? (
                          <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" />
                        ) : (
                          <Icon name="scissors" className="h-4.5 w-4.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => setModalState({ type: "service", mode: "detail", data: service })}>
                        <div className="truncate text-sm font-bold text-black">{service.name}</div>
                        <div className="text-xs text-gray-500">{formatDuration(service.duration_minutes)}</div>
                      </div>
                      <div className="text-sm font-semibold text-black">{formatPrice(Number(service.price))}</div>
                      
                      <div className="relative ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(isSvcDropdownOpen ? null : { type: "service", id: service.service_id });
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-black"
                        >
                          <Icon name="moreVertical" className="h-4.5 w-4.5" />
                        </button>
                        {isSvcDropdownOpen && (
                          <div className="absolute right-0 top-10 z-50 w-36 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                            <button
                              onClick={() => {
                                setModalState({ type: "service", mode: "detail", data: service });
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                              <Icon name="info" className="h-4 w-4" /> Detail
                            </button>
                            <button
                              onClick={() => {
                                setSvcForm({ 
                                  name: service.name, 
                                  duration_minutes: service.duration_minutes, 
                                  price: service.price, 
                                  description: service.description, 
                                  image_url: service.image_url, 
                                  category_id: service.category_id 
                                });
                                setModalState({ type: "service", mode: "edit", data: service });
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-black"
                            >
                              <Icon name="edit" className="h-4 w-4" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.service_id)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              <Icon name="trash" className="h-4 w-4" /> Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* --- MODAL --- */}
      <Modal 
        isOpen={!!modalState} 
        onClose={closeModal} 
        title={
          modalState?.mode === "add" ? `Tambah ${modalState.type === "category" ? "Kategori" : "Layanan"}` :
          modalState?.mode === "edit" ? `Edit ${modalState.type === "category" ? "Kategori" : "Layanan"}` : 
          `Detail ${modalState?.type === "category" ? "Kategori" : "Layanan"}`
        }
      >
        {modalState?.type === "category" && modalState.mode !== "detail" && (
          <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
            <ImageUpload 
              value={catForm.image_url} 
              onChange={(url) => setCatForm({ ...catForm, image_url: url })} 
              aspectRatio={16/6} 
              label="Gambar Kategori"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-black">Nama Kategori</label>
              <input type="text" required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-black">Deskripsi Singkat</label>
              <input type="text" required value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" />
            </div>

            {formError && <p className="text-xs font-medium text-red-500">{formError}</p>}
            <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50">Batal</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-black px-6 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        )}

        {modalState?.type === "category" && modalState.mode === "detail" && modalState.data && (
          <div className="flex flex-col gap-4">
             <div className="flex h-48 w-full max-w-[32rem] mx-auto items-center justify-center overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
              {(modalState.data as Category).image_url ? (
                <img src={(modalState.data as Category).image_url} alt={modalState.data.name} className="h-full w-full object-cover" />
              ) : (
                <Icon name="image" className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">ID Kategori</span>
              <span className="font-semibold text-black">{(modalState.data as Category).category_id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Nama Kategori</span>
              <span className="font-semibold text-black">{modalState.data.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Deskripsi</span>
              <span className="font-semibold text-gray-600">{(modalState.data as Category).description || "-"}</span>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={closeModal} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Tutup</button>
            </div>
          </div>
        )}

        {modalState?.type === "service" && modalState.mode !== "detail" && (
          <form onSubmit={handleSaveService} className="flex flex-col gap-4">
            <ImageUpload 
              value={svcForm.image_url} 
              onChange={(url) => setSvcForm({ ...svcForm, image_url: url })} 
              aspectRatio={1} 
              label="Gambar Layanan"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-black">Nama Layanan</label>
              <input type="text" required value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-black">Harga (Rp)</label>
              <input type="number" min={1} required value={svcForm.price} onChange={(e) => setSvcForm({ ...svcForm, price: String(e.target.value) })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-black">Durasi (Menit)</label>
              <input type="number" min={1} required value={svcForm.duration_minutes} onChange={(e) => setSvcForm({ ...svcForm, duration_minutes: Number(e.target.value) })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-black">Deskripsi Singkat</label>
              <input type="text" required value={svcForm.description} onChange={(e) => setSvcForm({ ...svcForm, description: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black" />
            </div>

            {formError && <p className="text-xs font-medium text-red-500">{formError}</p>}
            <div className="mt-2 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50">Batal</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-black px-6 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50">{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        )}

        {modalState?.type === "service" && modalState.mode === "detail" && modalState.data && (
           <div className="flex flex-col gap-4">
             <div className="flex h-48 w-48 mx-auto items-center justify-center overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
              {(modalState.data as Service).image_url ? (
                <img src={(modalState.data as Service).image_url} alt={modalState.data.name} className="h-full w-full object-contain" />
              ) : (
                <Icon name="image" className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Nama Layanan</span>
              <span className="font-semibold text-black">{modalState.data.name}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Harga</span>
              <span className="font-semibold text-black">{formatPrice(Number((modalState.data as Service).price))}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Durasi</span>
              <span className="font-semibold text-black">{formatDuration((modalState.data as Service).duration_minutes)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-bold uppercase text-gray-500">Deskripsi</span>
              <span className="font-semibold text-gray-600">{(modalState.data as Service).description || "-"}</span>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={closeModal} className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">Tutup</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
