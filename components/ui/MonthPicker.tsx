"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function MonthPicker({
  value,
  onChange,
  placeholder = "Pilih",
  disabled = false,
  className = "",
}: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse the current value (e.g., "2026-05")
  const [selectedYear, selectedMonth] = value
    ? value.split("-").map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  const [viewYear, setViewYear] = useState(selectedYear || new Date().getFullYear());

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

  // When opening, reset the viewYear to the currently selected year
  useEffect(() => {
    if (isOpen && value) {
      setViewYear(Number(value.split("-")[0]));
    }
  }, [isOpen, value]);

  const handleMonthClick = (monthIndex: number) => {
    const formattedMonth = String(monthIndex + 1).padStart(2, "0");
    const newValue = `${viewYear}-${formattedMonth}`;
    onChange(newValue);
    setIsOpen(false);
  };

  const displayLabel = value
    ? `${MONTHS[selectedMonth - 1]} ${selectedYear}`
    : placeholder;

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all border border-slate-200 bg-white ${
          disabled
            ? "cursor-not-allowed opacity-80"
            : "cursor-pointer hover:bg-slate-50 active:bg-slate-100"
        } ${isOpen ? "ring-2 ring-emerald-500/20 border-emerald-500" : ""}`}
      >
        <span className={`font-semibold text-sm truncate ${!value ? "text-slate-400" : "text-slate-700"}`}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-100 w-[240px] mt-2 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 p-3 animate-in fade-in zoom-in-95 duration-100 origin-top">
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={() => setViewYear(viewYear - 1)}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-700 text-sm">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear(viewYear + 1)}
              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, index) => {
              const isSelected = value && selectedYear === viewYear && selectedMonth === index + 1;
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthClick(index)}
                  className={`py-2 text-sm font-medium rounded-lg transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
