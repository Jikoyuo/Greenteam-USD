import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('Campus')
      .select('id_campus, campus_name')
      .order('id_campus', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching campuses:", error);
    return NextResponse.json({ error: "Failed to fetch campuses" }, { status: 500 });
  }
}
