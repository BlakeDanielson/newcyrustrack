import { ConsumptionSession, CreateConsumptionSession, QuantityValue } from '@/types/consumption';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

function convertPrismaToSession(s: Record<string, unknown>): ConsumptionSession {
  return {
    id: s.id as string,
    date: s.date as string,
    time: s.time as string,
    location: s.location as string,
    latitude: s.latitude as number | undefined,
    longitude: s.longitude as number | undefined,
    who_with: s.who_with as string,
    vessel: s.vessel as string,
    accessory_used: s.accessory_used as string,
    my_vessel: s.my_vessel as boolean,
    my_substance: s.my_substance as boolean,
    strain_name: s.strain_name as string,
    thc_percentage: s.thc_percentage as number | undefined,
    purchased_legally: s.purchased_legally as boolean,
    state_purchased: s.state_purchased as string | undefined,
    tobacco: s.tobacco as boolean,
    kief: s.kief as boolean,
    concentrate: s.concentrate as boolean,
    quantity: JSON.parse(s.quantity as string) as QuantityValue,
    quantity_legacy: s.quantity_legacy as number | undefined,
    created_at: (s.created_at as Date).toISOString(),
    updated_at: (s.updated_at as Date).toISOString(),
  };
}
function sessionToPrisma(input: CreateConsumptionSession): Prisma.ConsumptionSessionCreateInput {
  return { ...input, quantity: JSON.stringify(input.quantity) } as Prisma.ConsumptionSessionCreateInput;
}

export const databaseService = {
  getAll: async (): Promise<ConsumptionSession[]> => {
    const sessions = await prisma.consumptionSession.findMany({ orderBy: { created_at: 'desc' } });
    return sessions.map(convertPrismaToSession);
  },
  create: async (s: CreateConsumptionSession): Promise<ConsumptionSession> => {
    const created = await prisma.consumptionSession.create({ data: sessionToPrisma(s) });
    return convertPrismaToSession(created);
  },
  getById: async (id: string) => {
    const s = await prisma.consumptionSession.findUnique({ where: { id } });
    return s ? convertPrismaToSession(s) : null;
  },
  update: async (id: string, updates: Partial<CreateConsumptionSession>) => {
    const data: Record<string, unknown> = {};
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== undefined) data[k] = k === 'quantity' ? JSON.stringify(v) : v;
    });
    const updated = await prisma.consumptionSession.update({ where: { id }, data });
    return convertPrismaToSession(updated);
  },
  delete: async (id: string) => {
    await prisma.consumptionSession.delete({ where: { id } });
    return true;
  },
  count: async () => prisma.consumptionSession.count(),
  healthCheck: async () => {
    try { await prisma.$queryRaw`SELECT 1`; return true; } catch { return false; }
  },
};
export default databaseService;
