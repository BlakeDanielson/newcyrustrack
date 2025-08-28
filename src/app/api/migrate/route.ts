import { NextRequest, NextResponse } from 'next/server';
import databaseService from '@/lib/database';
import { CreateConsumptionSession } from '@/types/consumption';

export async function POST(req: NextRequest) {
  try {
    const { sessions } = await req.json();
    if (!Array.isArray(sessions)) return NextResponse.json({ error: 'Invalid payload', success: false }, { status: 400 });
    const valid: CreateConsumptionSession[] = sessions.map(({ id, created_at, updated_at, ...rest }: Record<string, unknown>) => {
      void id; void created_at; void updated_at; // Explicitly ignore these properties
      return rest as CreateConsumptionSession;
    });
    const created = await (databaseService as { createMany?: (sessions: CreateConsumptionSession[]) => Promise<number> }).createMany?.(valid) ?? 0;
    return NextResponse.json({ message: `Migrated ${created} sessions`, migrated: created, success: true });
  } catch {
    return NextResponse.json({ error: 'Migration failed', success: false }, { status: 500 });
  }
}
