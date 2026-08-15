import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Modal from "./Modal";
import getCroppedImg from "@/lib/utils/cropImage";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  aspectRatio: number;
  onCropComplete: (croppedImage: Blob) => void;
}

export default function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  aspectRatio,
  onCropComplete,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      alert("Gagal memproses gambar");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop Gambar">
      <div className="relative h-[60vh] w-full bg-gray-900 rounded-xl overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={setZoom}
          showGrid={false}
        />
      </div>
      
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Zoom</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-black"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="rounded-lg bg-black px-6 py-2 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? "Memproses..." : "Crop & Simpan"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
