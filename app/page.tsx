"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  Building2,
  Download,
  Clock,
  ArrowUp,
  ArrowDown,
  Info,
  ArrowUpDown,
  Loader2,
  Filter,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Dropdown } from "@/components/ui/Dropdown";
import { MonthPicker } from "@/components/ui/MonthPicker";

interface DashboardData {
  summary: {
    diversionRate: { value: number; change: number };
    totalManaged: { value: number; change: number };
    perCapita: { value: number; change: number };
    residualVolume: { value: number; change: number };
  };
  composition: {
    plastic: number;
    paper: number;
    organic: number;
    residual: number;
    total: number;
  };
  compareComposition: {
    period: string;
    plastic: number;
    paper: number;
    organic: number;
    residual: number;
    total: number;
  };
  topLocations: {
    name: string;
    total: number;
    percentage: number;
    dominantName: string;
    dominantVal: number;
    dominantColorClass: string;
  }[];
  rawData: {
    date: string;
    location: string;
    hardPlastic: number;
    paper: number;
    food: number;
    residualKg: number;
    residualVol: number;
    totalKg: number;
    totalVol: number;
  }[];
  compareRawData: {
    date: string;
    location: string;
    hardPlastic: number;
    paper: number;
    food: number;
    residualKg: number;
    residualVol: number;
    totalKg: number;
    totalVol: number;
  }[];
}

export default function DashboardPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [comparePeriod, setComparePeriod] = useState("");
  const [campus, setCampus] = useState("Kampus 3 USD");
  const [campuses, setCampuses] = useState<
    { id_campus: number; campus_name: string }[]
  >([]);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDownloadMenu(false);
    if (showDownloadMenu) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDownloadMenu]);

  useEffect(() => {
    fetchDashboardData();
    fetchLastUpdate();
  }, [period, comparePeriod, campus, campuses]);

  useEffect(() => {
    fetchCampuses();
  }, []);

  useEffect(() => {
    if (!period) return;
    const [yearStr, monthStr] = period.split("-");
    let year = parseInt(yearStr);
    let month = parseInt(monthStr);

    if (month === 1) {
      month = 12;
      year -= 1;
    } else {
      month -= 1;
    }

    const prevValue = `${year}-${String(month).padStart(2, "0")}`;
    setComparePeriod(prevValue);
  }, [period]);

  const fetchCampuses = async () => {
    try {
      const res = await fetch("/api/campuses");
      if (res.ok) {
        const json = await res.json();
        setCampuses(json);
        if (json.length > 0) {
          setCampus(json[0].campus_name);
        }
      }
    } catch (e) {}
  };

  const fetchLastUpdate = async () => {
    try {
      const res = await fetch("/api/last-upload");
      if (res.ok) {
        const json = await res.json();
        if (json.lastUpload) {
          const date = new Date(json.lastUpload);
          setLastUpdate(
            new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).format(date) + " WIB",
          );
        }
      }
    } catch (e) {}
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const selectedCampus = campuses.find((c) => c.campus_name === campus);
      const campusId = selectedCampus ? selectedCampus.id_campus : 1;
      const compareQuery = comparePeriod
        ? `&compare_period=${comparePeriod}`
        : "";
      const res = await fetch(
        `/api/dashboard?period=${period}${compareQuery}&campus_id=${campusId}`,
      );
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const SummaryCard = ({ title, value, unit, change, icon, type }: any) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;

    let badgeBg = "bg-slate-100";
    let badgeText = "text-slate-600";

    if (change > 0) {
      if (type === "diversionRate") {
        badgeBg = "bg-emerald-100";
        badgeText = "text-emerald-700";
      } else {
        badgeBg = "bg-red-100";
        badgeText = "text-red-700";
      }
    } else if (change < 0) {
      if (type === "diversionRate") {
        badgeBg = "bg-red-100";
        badgeText = "text-red-700";
      } else {
        badgeBg = "bg-emerald-100";
        badgeText = "text-emerald-700";
      }
    }

    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <div className="text-slate-400">{icon}</div>
        </div>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-bold text-[#1a1f36]">{value}</span>
          <span className="text-sm font-medium text-slate-500">{unit}</span>
        </div>
        <div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${badgeBg} ${badgeText}`}
          >
            {isPositive ? (
              <ArrowUp className="w-3 h-3" />
            ) : isNeutral ? (
              ""
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}% vs periode pembanding
          </span>
        </div>
      </div>
    );
  };

  const compositionData = data
    ? [
        {
          name: "Plastik",
          value: data.composition.plastic,
          color: "#006699",
          textClass: "text-[#006699]",
        },
        {
          name: "Kertas & Kardus",
          value: data.composition.paper,
          color: "#66b3ff",
          textClass: "text-[#66b3ff]",
        },
        {
          name: "Organik / Pangan",
          value: data.composition.organic,
          color: "#66ccff",
          textClass: "text-[#66ccff]",
        },
        {
          name: "Residu TPA",
          value: data.composition.residual,
          color: "#cc0000",
          textClass: "text-[#cc0000]",
        },
      ]
    : [];

  const formatMonth = (periodStr: string) => {
    if (!periodStr) return "";
    const [year, month] = periodStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  };

  const comparisonData = data
    ? [
        {
          name: "Plastik",
          [formatMonth(data.compareComposition.period)]:
            data.compareComposition.plastic,
          [formatMonth(period)]: data.composition.plastic,
        },
        {
          name: "Kertas & Kardus",
          [formatMonth(data.compareComposition.period)]:
            data.compareComposition.paper,
          [formatMonth(period)]: data.composition.paper,
        },
        {
          name: "Organik / Pangan",
          [formatMonth(data.compareComposition.period)]:
            data.compareComposition.organic,
          [formatMonth(period)]: data.composition.organic,
        },
        /*
    ,
    {
      name: "Residual",
      [formatMonth(data.compareComposition.period)]: data.compareComposition.residual,
      [formatMonth(period)]: data.composition.residual,
    }
    */
      ]
    : [];

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const element = document.getElementById("dashboard-content");
      if (!element) return;

      const htmlToImage = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const imgData = await htmlToImage.toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#f8f9fb",
        width: element.scrollWidth,
        height: element.scrollHeight,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          margin: "0",
        },
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Smart-Waste-Dashboard-${period}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!data) return;
    try {
      const ExcelJS = await import("exceljs");
      const workbook = new (ExcelJS.Workbook || ExcelJS.default.Workbook)();

      const generateSheet = (
        wsName: string,
        titlePeriod: string,
        dataset: any[],
      ) => {
        // ExcelJS sometimes fails if worksheet name is longer than 31 chars or has invalid chars
        const safeName = wsName.replace(/[\\\/\?\*\[\]]/g, "").substring(0, 31);
        const ws = workbook.addWorksheet(safeName);

        // Title
        ws.mergeCells("A1:K1");
        const titleCell = ws.getCell("A1");
        titleCell.value = `DATA AUDIT SAMPAH KAMPUS (Zero Waste Campus Project)`;
        titleCell.font = { bold: true, size: 14 };
        titleCell.alignment = { horizontal: "center" };
        titleCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2CC" },
        };

        ws.mergeCells("A2:K2");
        const subtitleCell = ws.getCell("A2");
        subtitleCell.value = `Sampling Date: ${titlePeriod}`;
        subtitleCell.font = { bold: true, size: 12 };
        subtitleCell.alignment = { horizontal: "center" };
        subtitleCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2CC" },
        };

        ws.addRow([]); // empty row 3

        // Headers row 4
        ws.addRow([
          "Day",
          "Date",
          "Location",
          "Weight of Hard Plastic (Kg)",
          "Weight",
          "Weight",
          "Residu",
          "Residu",
          "Total",
          "Total",
        ]);
        ws.addRow([
          "",
          "",
          "",
          "",
          "",
          "Paper (Kg)",
          "Food Waste (Kg)",
          "Kg",
          "Volume (L)",
          "Waste (Kg)",
          "Volume (L)",
        ]);

        // Merge header cells vertically
        ["A", "B", "C", "D", "E"].forEach((col) => {
          ws.mergeCells(`${col}4:${col}5`);
        });

        const setHeaderStyle = (cell: any, fgColor: string) => {
          cell.font = { bold: true };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fgColor },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        };

        // Header Colors
        ["A4", "B4", "C4", "D4", "E4", "K4", "K5"].forEach((c) =>
          setHeaderStyle(ws.getCell(c), "FFFFFF00"),
        ); // Yellow
        ["F4", "F5"].forEach((c) => setHeaderStyle(ws.getCell(c), "FFCCFFFF")); // Light Blue
        ["G4", "G5"].forEach((c) => setHeaderStyle(ws.getCell(c), "FFCCFFCC")); // Light Green
        ["H4", "H5"].forEach((c) => setHeaderStyle(ws.getCell(c), "FFFFCC99")); // Orange
        ["I4", "I5", "J4", "J5"].forEach((c) =>
          setHeaderStyle(ws.getCell(c), "FFFF99CC"),
        ); // Pink

        // Data Rows
        let totalHardPlastic = 0;
        let totalPaper = 0;
        let totalFood = 0;
        let totalResidualKg = 0;
        let totalResidualVol = 0;
        let totalWasteKg = 0;
        let totalWasteVol = 0;

        const dayNames = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];

        dataset.forEach((row) => {
          const d = new Date(row.date);
          const dayStr = isNaN(d.getTime()) ? "" : dayNames[d.getDay()];

          const dataRow = ws.addRow([
            dayStr,
            row.date,
            row.location,
            row.hardPlastic,
            row.paper,
            row.food,
            row.residualKg,
            row.residualVol,
            row.totalKg,
            row.totalVol,
          ]);

          totalHardPlastic += row.hardPlastic;
          totalPaper += row.paper;
          totalFood += row.food;
          totalResidualKg += row.residualKg;
          totalResidualVol += row.residualVol;
          totalWasteKg += row.totalKg;
          totalWasteVol += row.totalVol;

          const setRowBg = (colNum: number, color: string) => {
            dataRow.getCell(colNum).fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: color },
            };
            dataRow.getCell(colNum).border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          };

          [1, 2, 3, 4, 11].forEach((c) => setRowBg(c, "FFFFFF00")); // Yellow
          [5, 6].forEach((c) => setRowBg(c, "FFCCFFFF")); // Blue
          setRowBg(7, "FFCCFFCC"); // Green
          setRowBg(8, "FFFFCC99"); // Orange
          [9, 10].forEach((c) => setRowBg(c, "FFFF99CC")); // Pink
        });

        // Total Row
        const totalRow = ws.addRow([
          "TOTAL",
          "",
          "",
          "",
          totalHardPlastic,
          totalPaper,
          totalFood,
          totalResidualKg,
          totalResidualVol,
          totalWasteKg,
          totalWasteVol,
        ]);
        ws.mergeCells(`A${totalRow.number}:D${totalRow.number}`);

        for (let i = 1; i <= 11; i++) {
          const cell = totalRow.getCell(i);
          cell.font = { bold: true };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF00" },
          };
          cell.border = {
            top: { style: "thick" },
            bottom: { style: "thick" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        }

        // Column widths
        ws.getColumn("A").width = 10;
        ws.getColumn("B").width = 15;
        ws.getColumn("C").width = 30;
        ws.getColumn("D").width = 15;
        ws.getColumn("E").width = 25;
        ws.getColumn("F").width = 15;
        ws.getColumn("G").width = 15;
        ws.getColumn("H").width = 15;
        ws.getColumn("I").width = 15;
        ws.getColumn("J").width = 15;
        ws.getColumn("K").width = 15;
      };

      generateSheet(
        `Periode ${formatMonth(period)}`,
        formatMonth(period),
        data.rawData,
      );

      if (
        data.compareComposition &&
        data.compareRawData &&
        data.compareRawData.length > 0
      ) {
        generateSheet(
          `Banding ${formatMonth(data.compareComposition.period)}`,
          formatMonth(data.compareComposition.period),
          data.compareRawData,
        );
      }

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Raw-Data-Waste-Management-${period}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate Excel", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans pb-12">
      <div className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-30">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">
              Smart Waste Management Dashboard
            </h1>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`${showFilters ? "flex" : "hidden"} md:flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-3 w-full md:w-auto mt-4 md:mt-0`}
        >
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white w-full md:w-auto">
            <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <div className="flex flex-col mr-2 flex-grow">
              <span className="text-[10px] text-slate-500 font-semibold leading-none mb-1">
                PERIODE
              </span>
              <div className="w-full md:w-36">
                <MonthPicker value={period} onChange={setPeriod} />
              </div>
            </div>
          </div>

          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white w-full md:w-auto">
            <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <div className="flex flex-col mr-2 flex-grow">
              <span className="text-[10px] text-slate-500 font-semibold leading-none mb-1">
                BANDINGKAN
              </span>
              <div className="w-full md:w-36">
                <MonthPicker
                  value={comparePeriod}
                  onChange={setComparePeriod}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white w-full md:w-auto">
            <Building2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <div className="flex flex-col mr-2 flex-grow">
              <span className="text-[10px] text-slate-500 font-semibold leading-none mb-1">
                LOKASI
              </span>
              <div className="w-full md:w-44">
                <Dropdown
                  value={campus}
                  onChange={setCampus}
                  options={campuses.map((c) => ({
                    value: c.campus_name,
                    label: c.campus_name,
                  }))}
                  className="!px-0 !py-0 !bg-transparent text-sm shadow-none"
                  placeholder="Memuat..."
                />
              </div>
            </div>
          </div>

          <div
            className="relative w-full md:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              disabled={isDownloadingPdf}
              className="bg-[#006837] hover:bg-[#005a30] text-white px-4 py-3 md:py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors w-full md:w-auto"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloadingPdf ? "Memproses PDF..." : "Download Report"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showDownloadMenu ? "rotate-180" : ""}`}
              />
            </button>

            {showDownloadMenu && (
              <div className="absolute right-0 mt-2 w-full md:w-56 bg-white border border-slate-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] py-2 z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setShowDownloadMenu(false);
                    handleDownloadPDF();
                  }}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      Format PDF
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Tampilan dashboard visual
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowDownloadMenu(false);
                    handleDownloadExcel();
                  }}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors border-t border-slate-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      Format Excel
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Data mentah lengkap
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        id="dashboard-content"
        className="max-w-[1200px] mx-auto px-6 md:px-12 mt-8"
      >
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
              <span className="text-emerald-700 font-bold text-sm tracking-wide uppercase">
                {campus}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#1a1f36]">
              Ringkasan Analitik Pengelolaan Sampah
            </h2>
          </div>
          <div className="bg-slate-50 text-slate-500 text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 border border-slate-100">
            <Clock className="w-4 h-4" />
            Terakhir diperbarui: {lastUpdate || "Belum ada data"}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-slate-500">
            Gagal memuat data.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <SummaryCard
                title="Total Waste Diversion Rate"
                value={data.summary.diversionRate.value.toFixed(1)}
                unit="%"
                change={data.summary.diversionRate.change}
                type="diversionRate"
                icon={<ArrowUpDown className="w-4 h-4" />}
              />
              <SummaryCard
                title="Total Waste Managed"
                value={data.summary.totalManaged.value.toFixed(2)}
                unit="kg"
                change={data.summary.totalManaged.change}
                type="totalManaged"
                icon={<ArrowUpDown className="w-4 h-4" />}
              />
              <SummaryCard
                title="Per Capita Generation"
                // value={data.summary.perCapita.value.toFixed(2)}
                value="17,41"
                unit="g/org/hari"
                // change={data.summary.perCapita.change}
                change={0}
                type="perCapita"
                icon={<Building2 className="w-4 h-4" />}
              />
              <SummaryCard
                title="Residual Waste Volume"
                value={data.summary.residualVolume.value.toFixed(2)}
                unit="L"
                change={data.summary.residualVolume.change}
                type="residualVolume"
                icon={<ArrowUpDown className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm col-span-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1f36]">
                      Komposisi Aliran Sampah
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Distribusi pemilahan material daur ulang vs residu
                    </p>
                  </div>
                  <Info className="w-5 h-5 text-slate-400" />
                </div>

                <div className="relative h-[250px] w-full flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={compositionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {compositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                      TOTAL TIMBULAN
                    </span>
                    <span className="text-xl font-bold text-[#1a1f36]">
                      {data.composition.total.toFixed(1)} kg
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 bg-slate-50 p-4 rounded-xl">
                  {compositionData.map((item, i) => {
                    const pct =
                      data.composition.total > 0
                        ? (item.value / data.composition.total) * 100
                        : 0;
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <div
                          className={`w-3 h-3 rounded-full mt-1 shrink-0`}
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div>
                          <div
                            className={`text-xs font-bold ${item.textClass}`}
                          >
                            {item.name} ({pct.toFixed(0)}%)
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {item.value.toFixed(2)} kg
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm col-span-1 lg:col-span-2 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#1a1f36]">
                      Peringkat Lokasi Timbulan Sampah Tertinggi
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Diurutkan berdasarkan akumulasi volume sampah terkumpul
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <ArrowUpDown className="w-3 h-3" /> Urutan: Tertinggi ke
                    Terendah
                  </div>
                </div>

                <div className="flex flex-col gap-4 flex-grow justify-center">
                  {data.topLocations.map((loc, i) => (
                    <div
                      key={i}
                      className="bg-slate-50/50 rounded-xl p-3 border border-slate-100"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-[#e6f0ff] text-[#006699] flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">
                            {loc.name}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                          Dominan: {loc.dominantName}{" "}
                          <span className="font-bold text-slate-800 ml-1 text-sm">
                            {loc.total.toFixed(1)} kg
                          </span>
                        </div>
                      </div>
                      <div className="relative h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-1">
                        <div
                          className={`absolute top-0 left-0 h-full ${loc.dominantColorClass} rounded-full`}
                          style={{ width: `${loc.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {loc.percentage.toFixed(1)}% dari total sampah di kampus
                        3
                      </div>
                    </div>
                  ))}

                  {data.topLocations.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                      Tidak ada data lokasi untuk periode ini.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#1a1f36]">
                    Perbandingan Penyusun Diversion Rate
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Komparasi berat sampah (kg) yang didaur ulang antara dua
                    periode
                  </p>
                </div>
                <Info className="w-5 h-5 text-slate-400" />
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    <Bar
                      dataKey={
                        data
                          ? formatMonth(data.compareComposition.period)
                          : "Bulan Lalu"
                      }
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
                      name={`Periode ${data ? formatMonth(data.compareComposition.period) : ""}`}
                    />
                    <Bar
                      dataKey={data ? formatMonth(period) : "Bulan Ini"}
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                      name={`Periode ${data ? formatMonth(period) : ""}`}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
