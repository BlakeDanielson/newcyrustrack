import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { method, notes } = body ?? {};

    if (!method || typeof method !== "string") {
      return NextResponse.json({ error: "'method' field is required" }, { status: 400 });
    }

    const session = await prisma.consumptionSession.create({
      data: {
        method,
        notes: notes && typeof notes === "string" ? notes : undefined,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    console.error("/api/sessions POST error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
