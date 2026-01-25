const HAS_TZ = /([zZ]|[+-]\d{2}:\d{2})$/;

export function parseApiDate(s?: string | null): Date | null {
  if (!s) return null;
  // Si viene sin zona horaria, asumimos UTC (agregamos Z)
  const normalized = HAS_TZ.test(s) ? s : `${s}Z`;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

export function formatTimeEC(s?: string | null): string {
  const d = parseApiDate(s);
  if (!d) return "";
  return new Intl.DateTimeFormat("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
