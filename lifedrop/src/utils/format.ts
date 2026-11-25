export const fmtDate = (d?: string | null) =>
  d ? new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const t: [number, string][] = [[31536000, 'year'], [2592000, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
  for (const [sec, name] of t) if (s >= sec) { const n = Math.floor(s / sec); return `${n} ${name}${n > 1 ? 's' : ''} ago`; }
  return 'just now';
}

/** Escapes LIKE wildcards so user input is matched literally. */
export const likeEscape = (s: string) => s.trim().replace(/[\\%_]/g, (c) => `\\${c}`);

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const todayISO = () => new Date().toISOString().slice(0, 10);
