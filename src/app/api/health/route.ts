import { NextResponse } from 'next/server';
import databaseService from '@/lib/database';

export async function GET() {
  try {
    const dbHealthy = await databaseService.healthCheck();
    const count = await databaseService.count();
    return NextResponse.json({ status: 'healthy', database: dbHealthy ? 'connected' : 'disconnected', sessionCount: count, timestamp: new Date().toISOString(), success: true });
  } catch (err) {
    return NextResponse.json({ status: 'unhealthy', database: 'error', error: 'DB connection failed', success: false }, { status: 500 });
  }
}
