import { NextRequest, NextResponse } from "next/server";
import * as xlsx from "xlsx";
import { supabase } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const period = formData.get("period") as string;
    const campus = formData.get("campus") as string;
    const mappingsStr = formData.get("mappings") as string;

    const mappings = mappingsStr ? JSON.parse(mappingsStr) : {};

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const { data: campusData, error: campusError } = await supabase
      .from("Campus")
      .select("id_campus")
      .eq("campus_name", campus)
      .single();

    if (campusError || !campusData) {
      console.error("Campus error:", campusError);
      return NextResponse.json(
        {
          error: `Kampus "${campus}" tidak ditemukan di database. Pastikan Anda sudah menjalankan SQL Setup.`,
        },
        { status: 400 },
      );
    }

    const campusId = campusData.id_campus;

    const { data: dbLocationsData, error: locError } = await supabase
      .from("Locations")
      .select("id_location, location_name")
      .eq("id_campus", campusId);

    if (locError) {
      return NextResponse.json(
        { error: "Gagal mengambil data lokasi dari database" },
        { status: 500 },
      );
    }

    const DB_LOCATIONS = dbLocationsData.map((row: any) => ({
      id: row.id_location,
      name: row.location_name,
    }));

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const data: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length < 5) {
      return NextResponse.json(
        { error: "Invalid format: Less than 5 rows" },
        { status: 400 },
      );
    }

    const headers = data[4];

    const dateIdx = headers.indexOf("Date");
    const locIdx = headers.indexOf("Location");
    const hpIdx = headers.indexOf("Weight of Hard Plastic (Kg)");
    const paperIdx = headers.indexOf("Weight of Paper (Kg)");
    const fwIdx = headers.indexOf("Weight Food Waste (Kg)");
    const resKgIdx = headers.indexOf("Residual Waste (Kg)");
    const resVolIdx = headers.indexOf("Residual Waste Volume (L)");
    const totKgIdx = headers.indexOf("Total Waste (Kg)");
    const totVolIdx = headers.indexOf("Total Waste Volume (L)");

    if (dateIdx === -1 || locIdx === -1) {
      return NextResponse.json(
        {
          error: "Required columns (Date, Location) not found in row 5 header",
        },
        { status: 400 },
      );
    }

    const cleanNum = (val: any) => {
      if (val === undefined || val === null || val === "" || val === " ")
        return 0;
      const num = parseFloat(val);
      if (isNaN(num)) return 0;
      return Math.round(num * 100) / 100;
    };

    const validLocations = new Set<string>();
    const auditData: any[] = [];

    for (let i = 5; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const dateRaw = row[dateIdx];
      const locRaw = row[locIdx];

      if (
        !dateRaw ||
        String(locRaw).trim().toUpperCase() === "TOTAL" ||
        String(dateRaw).trim().toUpperCase() === "TOTAL"
      ) {
        continue;
      }

      let auditDate = "";
      if (dateRaw instanceof Date) {
        const d = new Date(dateRaw);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        auditDate = d.toISOString().split("T")[0];
      } else {
        auditDate = String(dateRaw);
      }

      if (locRaw) {
        validLocations.add(String(locRaw).trim());
      }

      auditData.push({
        location: String(locRaw).trim(),
        auditDate,
        hardPlastic: cleanNum(row[hpIdx]),
        paper: cleanNum(row[paperIdx]),
        foodWaste: cleanNum(row[fwIdx]),
        residualKg: cleanNum(row[resKgIdx]),
        residualVol: cleanNum(row[resVolIdx]),
        totalKg: cleanNum(row[totKgIdx]),
        totalVol: cleanNum(row[totVolIdx]),
      });
    }

    const unrecognizedLocations: string[] = [];

    validLocations.forEach((loc) => {
      const existsInDB = DB_LOCATIONS.find(
        (dbLoc) => dbLoc.name.toLowerCase() === loc.toLowerCase(),
      );
      const isResolved = mappings[loc] !== undefined;

      if (!existsInDB && !isResolved) {
        unrecognizedLocations.push(loc);
      }
    });

    if (unrecognizedLocations.length > 0) {
      return NextResponse.json({
        requireConfirmation: true,
        unrecognizedLocations,
        existingLocations: DB_LOCATIONS,
      });
    }

    const finalLocationIdMap: Record<string, number> = {};

    for (const originalLoc of Array.from(validLocations)) {
      const dbMatch = DB_LOCATIONS.find(
        (dbLoc) => dbLoc.name.toLowerCase() === originalLoc.toLowerCase(),
      );

      if (dbMatch) {
        finalLocationIdMap[originalLoc] = dbMatch.id;
      } else {
        const resolution = mappings[originalLoc];
        if (resolution.action === "map") {
          finalLocationIdMap[originalLoc] = resolution.targetId;
        } else if (resolution.action === "create") {
          const { data: newLocData, error: newLocError } = await supabase
            .from("Locations")
            .insert({
              id_campus: campusId,
              location_name: originalLoc,
            })
            .select("id_location")
            .single();

          if (newLocError) throw newLocError;
          finalLocationIdMap[originalLoc] = newLocData.id_location;
        }
      }
    }

    const recordsToInsert = auditData.map((row) => ({
      id_location: finalLocationIdMap[row.location],
      audit_date: row.auditDate,
      period: period,
      hard_plastic_kg: row.hardPlastic,
      paper_kg: row.paper,
      food_waste_kg: row.foodWaste,
      residual_kg: row.residualKg,
      residual_volume_l: row.residualVol,
      total_waste_kg: row.totalKg,
      total_waste_volume_l: row.totalVol,
      is_active: true,
    }));

    const { error: upsertError } = await supabase
      .from("DataAudit")
      .upsert(recordsToInsert, { onConflict: "id_location,audit_date" });

    if (upsertError) {
      console.error("Upsert Error:", upsertError);
      throw upsertError;
    }

    return NextResponse.json({
      success: true,
      message: "Data audit berhasil disimpan ke Supabase!",
    });
  } catch (error: any) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error occurred" },
      { status: 500 },
    );
  }
}
