import { ReactNode } from 'react';
import { api } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import type { Paged } from '../../types';

export function useAdminList<T>(path: string, filters: Record<string, string>, page: number) {
  const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), page: String(page) }).toString();
  return useAsync(() => api<Paged<T>>(`${path}?${qs}`), [path, qs]);
}

export const Table = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <div className="card overflow-x-auto">
    <table className="w-full min-w-[640px]">
      <thead className="border-b border-line bg-surface"><tr>{head.map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-line">{children}</tbody>
    </table>
  </div>
);
