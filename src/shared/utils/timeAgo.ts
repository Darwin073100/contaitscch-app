/** "hace un momento", "hace 5 min", "hace 2 h", "hace 3 días". */
export function timeAgo(iso: string, nowIso: string): string {
  const minutes = Math.floor((Date.parse(nowIso) - Date.parse(iso)) / 60000);
  if (minutes < 1) return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
}
