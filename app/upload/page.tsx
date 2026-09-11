"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  Building2,
  HelpCircle,
  FileUp,
  FolderOpen,
  Download,
  History,
  FileText,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { Dropdown } from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/ToastProvider";

export default function UploadPage() {
  const { success, error: showError } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [period, setPeriod] = useState("2026-05");
  const [campus, setCampus] = useState("Kampus 3 USD");
  const [campuses, setCampuses] = useState<
    { id_campus: number; campus_name: string }[]
  >([]);
  const [periodOptions, setPeriodOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [showMappingModal, setShowMappingModal] = useState(false);
  const [unrecognizedLocations, setUnrecognizedLocations] = useState<string[]>(
    [],
  );
  const [existingLocations, setExistingLocations] = useState<
    { id: number; name: string }[]
  >([]);
  const [mappings, setMappings] = useState<
    Record<string, { action: "create" | "map"; targetId?: number }>
  >({});

  const [lastUpload, setLastUpload] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLastUpload = async () => {
    try {
      const res = await fetch("/api/last-upload");
      if (res.ok) {
        const data = await res.json();
        setLastUpload(data.lastUpload);
      }
    } catch (e) {
      console.error("Failed to fetch last upload", e);
    }
  };

  const fetchCampuses = async () => {
    try {
      const res = await fetch("/api/campuses");
      if (res.ok) {
        const data = await res.json();
        setCampuses(data);
        if (data.length > 0) setCampus(data[0].campus_name);
      }
    } catch (e) {
      console.error("Failed to fetch campuses", e);
    }
  };

  useEffect(() => {
    fetchLastUpload();
    fetchCampuses();

    const options = [];
    // Generate 12 months (6 months before and 6 months after current date)
    const currentDate = new Date();
    for (let i = -6; i <= 6; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + i,
        1,
      );
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
    setPeriodOptions(options);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext),
    );
    const maxSize = 25 * 1024 * 1024;

    if (!isValidExtension && !validTypes.includes(selectedFile.type)) {
      showError(
        "Format file tidak didukung. Harap unggah file .CSV atau .XLSX",
      );
      return;
    }

    if (selectedFile.size > maxSize) {
      showError("Ukuran file melebihi batas maksimal 25 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const submitFile = async (currentMappings = {}) => {
    if (!file) {
      showError("Pilih berkas terlebih dahulu!");
      return;
    }
    if (!period) {
      showError("Pilih periode audit terlebih dahulu!");
      return;
    }
    if (!campus) {
      showError("Pilih lokasi kampus terlebih dahulu!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("period", period);
    formData.append("campus", campus);
    formData.append("mappings", JSON.stringify(currentMappings));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.requireConfirmation) {
        setUnrecognizedLocations(result.unrecognizedLocations);
        setExistingLocations(result.existingLocations);

        const initialMappings: any = {};
        result.unrecognizedLocations.forEach((loc: string) => {
          initialMappings[loc] = { action: "create" };
        });
        setMappings(initialMappings);
        setShowMappingModal(true);
      } else if (response.ok) {
        success(
          "Yeay! Berkas berhasil diproses dan data telah disimpan ke Database Supabase!",
        );
        setFile(null);
        setShowMappingModal(false);
        fetchLastUpload();
      } else {
        showError("Gagal memproses berkas: " + result.error);
      }
    } catch (error) {
      console.error(error);
      showError("Terjadi kesalahan saat mengunggah berkas.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    submitFile({});
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-800 font-sans p-6 md:p-12 flex justify-center">
      <div className="max-w-[800px] w-full">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1f36] mb-3">
              Upload Waste Audit Data
            </h1>
            <p className="text-slate-500 text-[15px] leading-relaxed">
              Unggah berkas log penimbangan dan audit harian untuk memproses
              pembaruan analitik dashboard secara otomatis dengan toleransi
              anomali cerdas.
            </p>
          </div>
          <Link
            href="/"
            className="bg-[#e6f0ff] text-[#006699] hover:bg-[#d0e3ff] transition-colors font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap"
          >
            Lihat Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6 relative z-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[15px] font-semibold text-slate-800">
                  Periode Audit (Period) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-medium">
                  Bulan Aktif
                </span>
              </div>
              <div className="relative">
                <Dropdown
                  value={period}
                  onChange={setPeriod}
                  options={periodOptions}
                  icon={Calendar}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-[13px]">
                <HelpCircle className="w-4 h-4" />
                <span>Pilih siklus log penimbangan yang sesuai</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[15px] font-semibold text-slate-800">
                  Lokasi Kampus (Campus Location){" "}
                  <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative z-20">
                <Dropdown
                  value={campus}
                  onChange={setCampus}
                  options={campuses.map((c) => ({
                    value: c.campus_name,
                    label: c.campus_name,
                  }))}
                  icon={Building2}
                  disabled={campuses.length === 0}
                  placeholder="Memuat..."
                />
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-[13px]">
                <Building2 className="w-4 h-4" />
                <span>Zona operasional pengumpulan sampah</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[15px] font-semibold text-slate-800">
                Berkas Log Timbangan <span className="text-red-500">*</span>
              </label>
              <span className="text-xs font-bold text-emerald-700">
                Maksimal 25 MB
              </span>
            </div>

            <div
              className={`bg-[#f4f6fb] rounded-2xl p-10 flex flex-col items-center justify-center border-2 border-dashed transition-colors cursor-pointer mb-6 ${isDragging ? "border-emerald-500 bg-[#ebf0f8]" : "border-transparent hover:border-slate-300"}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBoxClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />

              {!file ? (
                <>
                  <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 pointer-events-none">
                    <FileUp
                      className="w-8 h-8 text-emerald-700"
                      strokeWidth={2.5}
                    />
                  </div>

                  <h3 className="text-[17px] font-semibold text-[#1a1f36] mb-3 text-center pointer-events-none">
                    Tarik & lepas berkas CSV di sini, atau klik untuk memilih
                  </h3>

                  <div className="flex items-center gap-2 text-[15px] text-slate-500 mb-8 pointer-events-none">
                    <span>Mendukung format</span>
                    <span className="bg-[#e9ecf5] text-[#1a1f36] font-bold text-xs px-2 py-1 rounded-md tracking-wide">
                      .CSV
                    </span>
                    <span>atau</span>
                    <span className="bg-[#e9ecf5] text-[#1a1f36] font-bold text-xs px-2 py-1 rounded-md tracking-wide">
                      .XLSX
                    </span>
                  </div>

                  <button className="flex items-center gap-2 bg-white text-[#1a1f36] font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow text-[15px] transition-shadow pointer-events-none">
                    <FolderOpen className="w-5 h-5 text-emerald-700" />
                    Pilih Berkas dari Komputer
                  </button>
                </>
              ) : (
                <div
                  className="flex flex-col items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100 w-full max-w-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-12 h-12 text-emerald-600 mb-3" />
                  <span className="font-semibold text-slate-800 text-center break-all">
                    {file.name}
                  </span>
                  <span className="text-sm text-slate-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={removeFile}
                    className="mt-5 flex items-center gap-1.5 text-[14px] px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Batal Pilih
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleUploadClick}
              disabled={isUploading || !file}
              className="w-full bg-[#006837] hover:bg-[#005a30] disabled:bg-[#006837]/60 disabled:cursor-not-allowed text-white font-semibold text-[16px] py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>Unggah Data</>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4">
          <div className="bg-[#e6f0ff] p-3 rounded-xl">
            <History className="w-5 h-5 text-[#4a85f6]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">
              UNGGAHAN TERAKHIR
            </span>
            <span className="text-[15px] font-bold text-[#1a1f36]">
              {lastUpload
                ? new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(lastUpload))
                : "Belum ada unggahan"}
            </span>
          </div>
        </div>
      </div>

      {showMappingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-full text-amber-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Lokasi Asing Terdeteksi
                </h2>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  Kami menemukan <b>{unrecognizedLocations.length} lokasi</b> di
                  dalam file Anda yang tidak ada di database <b>{campus}</b>.
                  Apakah ini lokasi baru atau hanya salah ketik (typo)?
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
              <div className="space-y-4">
                {unrecognizedLocations.map((loc) => (
                  <div
                    key={loc}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200"
                  >
                    <span className="block font-semibold text-slate-700 mb-2">
                      {loc}
                    </span>
                    <select
                      className="w-full bg-[#f4f6fb] border border-slate-200 rounded-lg px-3 py-2.5 text-[14.5px] text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                      value={
                        mappings[loc]?.action === "create"
                          ? "create"
                          : `map-${mappings[loc]?.targetId}`
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "create") {
                          setMappings((prev) => ({
                            ...prev,
                            [loc]: { action: "create" },
                          }));
                        } else {
                          const targetId = parseInt(val.replace("map-", ""));
                          setMappings((prev) => ({
                            ...prev,
                            [loc]: { action: "map", targetId },
                          }));
                        }
                      }}
                    >
                      <option value="create">Buat sebagai Lokasi Baru</option>
                      <optgroup label="Atau Cocokkan dengan Lokasi yang Ada:">
                        {existingLocations.map((ex) => (
                          <option key={ex.id} value={`map-${ex.id}`}>
                            ↪ Cocokkan dengan: {ex.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal Unggah
              </button>
              <button
                onClick={() => submitFile(mappings)}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors flex items-center gap-2 shadow-sm"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Setuju & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
