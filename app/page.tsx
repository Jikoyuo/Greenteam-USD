import React from "react";
import {
  Calendar,
  ChevronDown,
  Building2,
  HelpCircle,
  FileUp,
  FolderOpen,
  Download,
  Sparkles,
  History,
} from "lucide-react";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-800 font-sans p-6 md:p-12 flex justify-center">
      <div className="max-w-[800px] w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a1f36] mb-3">
            Upload Waste Audit Data
          </h1>
          <p className="text-slate-500 text-[15px] leading-relaxed">
            Unggah berkas log penimbangan dan audit harian untuk memproses
            pembaruan analitik dashboard secara otomatis dengan toleransi
            anomali cerdas.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6">
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
              <div className="flex items-center justify-between bg-[#f4f6fb] px-4 py-3.5 rounded-xl cursor-pointer hover:bg-[#ebedf4] transition-colors">
                <div className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-5 h-5 text-emerald-700" />
                  <span className="font-semibold">September 2026</span>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400" />
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
              <div className="flex items-center justify-between bg-[#f4f6fb] px-4 py-3.5 rounded-xl cursor-pointer hover:bg-[#ebedf4] transition-colors">
                <div className="flex items-center gap-3 text-slate-700">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <span className="font-semibold">Kampus 3 (Paingan)</span>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400" />
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

            <div className="bg-[#f4f6fb] rounded-2xl p-10 flex flex-col items-center justify-center border-2 border-dashed border-transparent hover:border-slate-200 transition-colors cursor-pointer mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                <FileUp
                  className="w-8 h-8 text-emerald-700"
                  strokeWidth={2.5}
                />
              </div>

              <h3 className="text-[17px] font-semibold text-[#1a1f36] mb-3 text-center">
                Tarik & lepas berkas CSV di sini, atau klik untuk memilih
              </h3>

              <div className="flex items-center gap-2 text-[15px] text-slate-500 mb-8">
                <span>Mendukung format</span>
                <span className="bg-[#e9ecf5] text-[#1a1f36] font-bold text-xs px-2 py-1 rounded-md tracking-wide">
                  .CSV
                </span>
                <span>atau</span>
                <span className="bg-[#e9ecf5] text-[#1a1f36] font-bold text-xs px-2 py-1 rounded-md tracking-wide">
                  .XLSX
                </span>
              </div>

              <button className="flex items-center gap-2 bg-white text-[#1a1f36] font-semibold px-5 py-3 rounded-xl shadow-sm hover:shadow text-[15px] transition-shadow">
                <FolderOpen className="w-5 h-5 text-emerald-700" />
                Pilih Berkas dari Komputer
              </button>
            </div>

            <div className="flex items-center mb-8">
              <a
                href="#"
                className="flex items-center gap-2 text-[14.5px] font-semibold text-[#006699] hover:text-[#005580] transition-colors"
              >
                <Download className="w-4 h-4" />
                Unduh contoh template audit (.CSV) standar
              </a>
            </div>

            <button className="w-full bg-[#006837] hover:bg-[#005a30] text-white font-semibold text-[16px] py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
              <Sparkles className="w-5 h-5" />
              Unggah Data
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
              31 Agu 2026 • 17:40 WIB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
