"use client";

import { useEffect, useState } from "react";

type NumberInputProps = {
  id?: string;
  value: number | string | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  placeholder?: string;
  required?: boolean;
  className?: string;
};

// Controlled numeric input that CAN be cleared (the "0 that can't be erased" fix).
// Internally it keeps the raw string so an empty field stays empty while typing,
// and normalizes values (strips leading zeros) on blur.
export default function NumberInput({
  id,
  value,
  onChange,
  min,
  max,
  allowDecimal = false,
  placeholder,
  required,
  className,
}: NumberInputProps) {
  const [raw, setRaw] = useState<string>(value === null || value === undefined ? "" : String(value));
  const [focused, setFocused] = useState(false);

  // Follow external resets (e.g. form cleared after save) — but never fight the
  // user mid-typing, otherwise the field snaps back to 0 the moment it's cleared.
  useEffect(() => {
    if (focused) return;
    setRaw((prev) => {
      const next = value === null || value === undefined ? "" : String(value);
      return prev === next ? prev : next;
    });
  }, [value, focused]);

  const sanitize = (s: string) => (allowDecimal ? s.replace(/[^\d.]/g, "") : s.replace(/[^\d]/g, ""));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = sanitize(e.target.value);
    setRaw(next);
    if (next === "") {
      onChange(null);
      return;
    }
    const parsed = allowDecimal ? parseFloat(next) : parseInt(next, 10);
    if (Number.isNaN(parsed)) {
      onChange(null);
      return;
    }
    let out = parsed;
    if (min !== undefined && out < min) out = min;
    if (max !== undefined && out > max) out = max;
    onChange(out);
  };

  const handleBlur = () => {
    if (raw === "") return;
    const parsed = allowDecimal ? parseFloat(raw) : parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setRaw("");
      onChange(null);
      return;
    }
    setRaw(String(parsed));
    onChange(parsed);
  };

  return (
    <input
      id={id}
      type="number"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      min={min}
      max={max}
      required={required}
      placeholder={placeholder}
      value={raw}
      onChange={handleChange}
      onBlur={() => {
        setFocused(false);
        handleBlur();
      }}
      onFocus={() => setFocused(true)}
      className={
        className ??
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black"
      }
    />
  );
}
