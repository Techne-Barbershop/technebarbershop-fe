"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-5">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 shrink-0">
          <h2 className="text-lg font-bold text-black">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-5 no-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
