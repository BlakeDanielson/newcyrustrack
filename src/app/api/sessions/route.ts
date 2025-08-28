import { NextRequest, NextResponse } from "next/server";
import databaseService from "@/lib/database";
import { CreateConsumptionSession } from "@/types/consumption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateConsumptionSession;
    const session = await databaseService.create(body);
    return NextResponse.json({ session, success: true }, { status: 201 });
  } catch (err) {
    console.error("/api/sessions POST error", err);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sessions = await databaseService.getAll();
    return NextResponse.json({ sessions, success: true }, { status: 200 });
  } catch (err) {
    console.error("/api/sessions GET error", err);
    return NextResponse.json({ error: "Internal Server Error", success: false }, { status: 500 });
  }
}
