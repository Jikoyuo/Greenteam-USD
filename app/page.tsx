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
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Dropdown } from "@/components/ui/Dropdown";

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
  topLocations: {
    name: string;
    total: number;
    percentage: number;
    dominantName: string;
    dominantVal: number;
    dominantColorClass: string;
  }[];
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("2026-05");
  const [campus, setCampus] = useState("Kampus 3 USD");
  const [campuses, setCampuses] = useState<
    { id_campus: number; campus_name: string }[]
  >([]);
  const [periodOptions, setPeriodOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
    fetchLastUpdate();
  }, [period, campus, campuses]);

  useEffect(() => {
    fetchCampuses();

    const options = [];
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
      const res = await fetch(
        `/api/dashboard?period=${period}&campus_id=${campusId}`,
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

  const SummaryCard = ({ title, value, unit, change, icon }: any) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;
    const changeColor = isPositive
      ? "text-emerald-700"
      : isNeutral
        ? "text-slate-600"
        : "text-emerald-700";

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
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700`}
          >
            {isPositive ? (
              <ArrowUp className="w-3 h-3" />
            ) : isNeutral ? (
              ""
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {Math.abs(change).toFixed(1)}% vs previous month
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

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans pb-12">
      <div className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">
            Smart Waste Management Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white">
            <Calendar className="w-4 h-4 text-slate-400 mr-2" />
            <div className="flex flex-col mr-6 z-20">
              <span className="text-[10px] text-slate-500 font-semibold leading-none mb-1">
                PERIODE
              </span>
              <div className="w-32">
                <Dropdown
                  value={period}
                  onChange={setPeriod}
                  options={periodOptions}
                  className="!px-0 !py-0 !bg-transparent text-sm shadow-none"
                  placeholder="Pilih"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2 bg-white">
            <Building2 className="w-4 h-4 text-slate-400 mr-2" />
            <div className="flex flex-col mr-6 z-20">
              <span className="text-[10px] text-slate-500 font-semibold leading-none mb-1">
                LOKASI
              </span>
              <div className="w-36">
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

          <button className="bg-[#006837] hover:bg-[#005a30] text-white px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 mt-8">
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
                icon={<ArrowUpDown className="w-4 h-4" />}
              />
              <SummaryCard
                title="Total Waste Managed"
                value={data.summary.totalManaged.value.toFixed(2)}
                unit="kg"
                change={data.summary.totalManaged.change}
                icon={<ArrowUpDown className="w-4 h-4" />}
              />
              <SummaryCard
                title="Per Capita Generation"
                value={data.summary.perCapita.value.toFixed(2)}
                unit="g/org/hari"
                change={data.summary.perCapita.change}
                icon={<Building2 className="w-4 h-4" />}
              />
              <SummaryCard
                title="Residual Waste Volume"
                value={data.summary.residualVolume.value.toFixed(2)}
                unit="L"
                change={data.summary.residualVolume.change}
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
          </>
        )}
      </div>
    </div>
  );
}
