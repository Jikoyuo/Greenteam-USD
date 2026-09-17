"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  icon?: LucideIcon;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}

export function Dropdown({
  value,
  onChange,
  options,
  icon: Icon,
  placeholder = "Pilih",
  disabled = false,
  className = "",
  buttonClassName = "bg-[#f4f6fb] px-4 py-3.5 rounded-xl",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between transition-all ${buttonClassName} ${
          disabled
            ? "cursor-not-allowed opacity-80"
            : "cursor-pointer hover:bg-[#ebedf4] active:bg-[#e4e8f1]"
        } ${isOpen ? "ring-2 ring-emerald-500/20 bg-[#ebedf4]" : ""}`}
      >
        <div className="flex items-center gap-3 text-slate-700 truncate pr-4">
          {Icon && <Icon className="w-5 h-5 text-emerald-700 shrink-0" />}
          <span className={`font-semibold truncate ${!selectedOption ? "text-slate-400" : ""}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 py-2 max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100 origin-top">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">Data tidak tersedia</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full text-left px-4 py-2.5 text-[15px] transition-colors ${
                  option.value === value
                    ? "bg-emerald-50 text-emerald-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-50 font-medium"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
