import React, { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import ImageCropperModal from "./ImageCropperModal";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  aspectRatio: number;
  label?: string;
}

export default function ImageUpload({ value, onChange, aspectRatio, label = "Upload Gambar" }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsCropping(false);
    setImageSrc(null);
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("image", croppedImageBlob, "upload.jpg");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      const res = await fetch(apiUrl + "/api/admin/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Gagal mengupload gambar");
      }

      const resData = await res.json();
      if (resData.data && resData.data.url) {
        onChange(apiUrl + resData.data.url);
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat mengupload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {label && <label className="text-sm font-semibold text-black self-start">{label}</label>}
      <div 
        className="flex h-48 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
        style={{ width: `min(100%, 12rem * ${aspectRatio})`, aspectRatio: aspectRatio }}
      >
        {value ? (
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <Icon name="image" className="h-10 w-10 text-gray-400" />
        )}
      </div>
      
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex w-max items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-50 disabled:opacity-50"
        >
          {isUploading ? "Mengupload..." : (value ? "Ubah Gambar" : "Pilih Gambar")}
        </button>
        <span className="text-[11px] text-gray-500 text-center">
          Format JPEG/PNG/WebP max 10MB.
        </span>
      </div>

        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

      {isCropping && imageSrc && (
        <ImageCropperModal
          isOpen={isCropping}
          onClose={() => {
            setIsCropping(false);
            setImageSrc(null);
          }}
          imageSrc={imageSrc}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
