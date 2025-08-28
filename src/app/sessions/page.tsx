'use client';
import useSWR from 'swr';
import { cn } from '@/lib/utils';
import { ConsumptionSession } from '@/types/consumption';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SessionsPage() {
  const { data, isLoading, error } = useSWR('/api/sessions', fetcher);

  if (isLoading) return <p className="text-center mt-10">Loading…</p>;
  if (error) return <p className="text-center mt-10 text-red-600">Error loading sessions</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Recent Sessions</h1>
      {(!data || data.length === 0) && <p>No sessions yet.</p>}
      <ul className="space-y-3">
        {data?.map((s: ConsumptionSession) => (
          <li key={s.id} className={cn('border p-4 rounded-lg')}>
            <div className="font-medium">{s.vessel} - {s.strain_name}</div>
            <p className="text-sm text-gray-600 mt-1">{s.location}</p>
            <p className="text-xs text-gray-400 mt-2">{new Date(s.created_at).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
