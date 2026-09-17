import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export const dynamic = "force-dynamic";

function getPreviousPeriod(period: string) {
  const [yearStr, monthStr] = period.split("-");
  let year = parseInt(yearStr);
  let month = parseInt(monthStr);
  if (month === 1) {
    month = 12;
    year -= 1;
  } else {
    month -= 1;
  }
  return `${year}-${month.toString().padStart(2, "0")}`;
}

function getDaysInMonth(period: string) {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || ""; // e.g. "2026-05"
    const comparePeriodParam = searchParams.get("compare_period");
    const campusId = parseInt(searchParams.get("campus_id") || "1");

    if (!period) {
      return NextResponse.json(
        { error: "Period is required" },
        { status: 400 },
      );
    }

    const prevPeriod = comparePeriodParam || getPreviousPeriod(period);
    const daysInMonth = getDaysInMonth(period);
    const POPULATION_ESTIMATE = 1000;

    const { data: auditData, error } = await supabase
      .from("DataAudit")
      .select(
        `
        *,
        Locations!inner(id_campus, location_name)
      `,
      )
      .eq("Locations.id_campus", campusId)
      .in("period", [period, prevPeriod])
      .eq("is_active", true);

    if (error) {
      console.error("Dashboard Supabase error:", error);
      throw error;
    }

    const { data: metaData } = await supabase
      .from("AuditMetadata")
      .select("*")
      .eq("id_campus", campusId)
      .in("period", [period, prevPeriod]);

    const currMeta = metaData?.find(m => m.period === period);
    const prevMeta = metaData?.find(m => m.period === prevPeriod);

    const currPop = currMeta?.population || POPULATION_ESTIMATE;
    const currDays = currMeta?.sampling_days || daysInMonth;

    const prevPop = prevMeta?.population || POPULATION_ESTIMATE;
    const prevDays = prevMeta?.sampling_days || getDaysInMonth(prevPeriod);

    const currentData = auditData.filter((d) => d.period === period);
    const prevData = auditData.filter((d) => d.period === prevPeriod);

    const sumMetric = (dataset: any[], key: string) =>
      dataset.reduce((sum, row) => sum + (Number(row[key]) || 0), 0);

    const currPlastic = sumMetric(currentData, "hard_plastic_kg");
    const currPaper = sumMetric(currentData, "paper_kg");
    const currFood = sumMetric(currentData, "food_waste_kg");
    const currResidual = sumMetric(currentData, "residual_kg");

    const currTotalManaged = sumMetric(currentData, "total_waste_kg");
    const currTotalResidualVol = sumMetric(currentData, "residual_volume_l");

    // Diversion Rate = (Plastik + Kertas + Makanan) / Total Waste * 100
    const currRecyclables = currPlastic + currPaper + currFood;
    const currDiversionRate =
      currTotalManaged > 0 ? (currRecyclables / currTotalManaged) * 100 : 0;

    // Per Capita = (TotalWaste * 1000) / (Populasi * Hari) -> grams/person/day
    const currPerCapita =
      (currTotalManaged * 1000) / (currPop * currDays);

    // --- PREVIOUS PERIOD METRICS ---
    const prevPlastic = sumMetric(prevData, "hard_plastic_kg");
    const prevPaper = sumMetric(prevData, "paper_kg");
    const prevFood = sumMetric(prevData, "food_waste_kg");
    const prevResidual = sumMetric(prevData, "residual_kg");

    const prevTotalManaged = sumMetric(prevData, "total_waste_kg");
    const prevTotalResidualVol = sumMetric(prevData, "residual_volume_l");

    const prevRecyclables = prevPlastic + prevPaper + prevFood;
    const prevDiversionRate =
      prevTotalManaged > 0 ? (prevRecyclables / prevTotalManaged) * 100 : 0;
    const prevPerCapita =
      (prevTotalManaged * 1000) / (prevPop * prevDays);

    // --- CALCULATE MoM % CHANGES ---
    const calcChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const momTotalManaged = calcChange(currTotalManaged, prevTotalManaged);
    const momResidualVol = calcChange(
      currTotalResidualVol,
      prevTotalResidualVol,
    );
    // For rates like Diversion Rate, change is often represented as absolute difference in percentage points
    const momDiversionRate = currDiversionRate - prevDiversionRate;
    const momPerCapita = calcChange(currPerCapita, prevPerCapita);

    // --- TOP LOCATIONS ---
    const locationMap: Record<string, any> = {};
    currentData.forEach((row) => {
      const locName = row.Locations.location_name;
      if (!locationMap[locName]) {
        locationMap[locName] = {
          name: locName,
          total: 0,
          plastic: 0,
          paper: 0,
          food: 0,
          residual: 0,
        };
      }
      locationMap[locName].total += Number(row.total_waste_kg) || 0;
      locationMap[locName].plastic += Number(row.hard_plastic_kg) || 0;
      locationMap[locName].paper += Number(row.paper_kg) || 0;
      locationMap[locName].food += Number(row.food_waste_kg) || 0;
      locationMap[locName].residual += Number(row.residual_kg) || 0;
    });

    const topLocationsArray = Object.values(locationMap).map((loc) => {
      // Find dominant
      const types = [
        { key: "Plastik", val: loc.plastic, color: "bg-[#006699]" },
        { key: "Kertas & Kardus", val: loc.paper, color: "bg-[#66b3ff]" },
        { key: "Makanan Sisa", val: loc.food, color: "bg-[#66ccff]" },
        { key: "Residu", val: loc.residual, color: "bg-[#cc0000]" },
      ];
      types.sort((a, b) => b.val - a.val); // Sort descending
      const dominant = types[0];

      return {
        name: loc.name,
        total: loc.total,
        percentage:
          currTotalManaged > 0 ? (loc.total / currTotalManaged) * 100 : 0,
        dominantName: dominant.key,
        dominantVal: dominant.val,
        dominantColorClass: dominant.color,
      };
    });

    // Sort by total waste descending
    topLocationsArray.sort((a, b) => b.total - a.total);

    // --- RESPONSE PAYLOAD ---
    return NextResponse.json({
      summary: {
        diversionRate: { value: currDiversionRate, change: momDiversionRate },
        totalManaged: { value: currTotalManaged, change: momTotalManaged },
        perCapita: { value: currPerCapita, change: momPerCapita },
        residualVolume: { value: currTotalResidualVol, change: momResidualVol },
      },
      composition: {
        plastic: currPlastic,
        paper: currPaper,
        organic: currFood,
        residual: currResidual,
        total: currTotalManaged,
      },
      compareComposition: {
        period: prevPeriod,
        plastic: prevPlastic,
        paper: prevPaper,
        organic: prevFood,
        residual: prevResidual,
        total: prevTotalManaged,
      },
      topLocations: topLocationsArray,
      rawData: currentData.map((row) => ({
        date: row.audit_date,
        location: row.Locations.location_name,
        hardPlastic: Number(row.hard_plastic_kg) || 0,
        paper: Number(row.paper_kg) || 0,
        food: Number(row.food_waste_kg) || 0,
        residualKg: Number(row.residual_kg) || 0,
        residualVol: Number(row.residual_volume_l) || 0,
        totalKg: Number(row.total_waste_kg) || 0,
        totalVol: Number(row.total_waste_volume_l) || 0,
      })),
      compareRawData: prevData.map((row) => ({
        date: row.audit_date,
        location: row.Locations.location_name,
        hardPlastic: Number(row.hard_plastic_kg) || 0,
        paper: Number(row.paper_kg) || 0,
        food: Number(row.food_waste_kg) || 0,
        residualKg: Number(row.residual_kg) || 0,
        residualVol: Number(row.residual_volume_l) || 0,
        totalKg: Number(row.total_waste_kg) || 0,
        totalVol: Number(row.total_waste_volume_l) || 0,
      }))
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}
