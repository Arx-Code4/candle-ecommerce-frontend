export function getSafeRedirectPath(rawRedirect: string | null, fallback: string): string {
  if (!rawRedirect) return fallback;

  const trimmed = rawRedirect.trim();

  if (!trimmed.startsWith('/')) return fallback;
  if (trimmed.startsWith('//')) return fallback;
  if (trimmed.includes('\\')) return fallback;

  return trimmed;
}
