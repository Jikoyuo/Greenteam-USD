"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  error: <XCircle className="w-5 h-5 text-red-600" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
  info: <Info className="w-5 h-5 text-blue-600" />,
};

const bgColors = {
  success: "bg-emerald-50 border-emerald-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-amber-50 border-amber-200",
  info: "bg-blue-50 border-blue-200",
};

const textColors = {
  success: "text-emerald-800",
  error: "text-red-800",
  warning: "text-amber-800",
  info: "text-blue-800",
};

export function Toast({ message, type, onClose }: ToastProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4700);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full pointer-events-auto transition-all duration-300 ${
        bgColors[type]
      } ${
        isClosing
          ? "opacity-0 translate-x-8"
          : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"
      }`}
    >
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div
        className={`flex-1 text-sm font-medium leading-relaxed ${textColors[type]}`}
      >
        {message}
      </div>
      <button
        onClick={handleClose}
        className={`shrink-0 opacity-50 hover:opacity-100 transition-opacity p-1 -m-1 ${textColors[type]}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
