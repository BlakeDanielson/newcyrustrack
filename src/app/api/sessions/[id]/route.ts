import { NextRequest, NextResponse } from 'next/server';
import databaseService from '@/lib/database';
import { CreateConsumptionSession } from '@/types/consumption';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await databaseService.getById(id);
  if (!session) return NextResponse.json({ error: 'Not found', success: false }, { status: 404 });
  return NextResponse.json({ session, success: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: Partial<CreateConsumptionSession> = await req.json();
  const updated = await databaseService.update(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found', success: false }, { status: 404 });
  return NextResponse.json({ session: updated, success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const success = await databaseService.delete(id);
  if (!success) return NextResponse.json({ error: 'Not found', success: false }, { status: 404 });
  return NextResponse.json({ success: true });
}
