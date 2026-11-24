"use client";

import NumberInput from "@/components/ui/NumberInput";
import type { Category } from "@/lib/types/admin";

export type ServiceFormValues = {
  category_id: string;
  name: string;
  duration_minutes: number;
  price: string;
  description: string;
};

type ServiceFormProps = {
  categories: Category[];
  value: ServiceFormValues;
  onChange: (next: ServiceFormValues) => void;
};

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black";

// Shared service form used by the cashier (and admin) service editors.
export default function ServiceForm({ categories, value, onChange }: ServiceFormProps) {
  const set = (patch: Partial<ServiceFormValues>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-black">Nama Layanan</label>
        <input
          type="text"
          required
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Contoh: Essential Cut"
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-black">Kategori</label>
        <select
          value={value.category_id}
          onChange={(e) => set({ category_id: e.target.value })}
          className={INPUT_CLASS}
        >
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-black">Durasi (menit)</label>
          <NumberInput
            min={1}
            required
            value={value.duration_minutes}
            onChange={(v) => set({ duration_minutes: v ?? 0 })}
            placeholder="Menit, contoh: 45"
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-black">Harga</label>
          <NumberInput
            min={0}
            allowDecimal
            value={value.price}
            onChange={(v) => set({ price: v === null ? "" : String(v) })}
            placeholder="Rp"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-black">Deskripsi</label>
        <textarea
          value={value.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Deskripsi singkat layanan..."
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>
    </div>
  );
}
