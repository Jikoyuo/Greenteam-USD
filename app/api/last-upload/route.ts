import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("DataAudit")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json({ lastUpload: null });
      }
      throw error;
    }

    return NextResponse.json({ lastUpload: data?.created_at || null });
  } catch (error: any) {
    console.error("Error fetching last upload:", error);
    return NextResponse.json(
      { error: "Failed to fetch last upload" },
      { status: 500 }
    );
  }
}
