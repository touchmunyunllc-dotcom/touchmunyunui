const DEFAULT_API_ORIGIN = 'https://touchmunyunapi.onrender.com';

/** Normalize env / pasted URLs into `https://host/api` (strips tabs/newlines/quotes). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_ORIGIN;
  const match = String(raw).match(/https?:\/\/[^\s\u0000-\u001F"'<>\\]+/i);
  const origin = (match ? match[0] : DEFAULT_API_ORIGIN)
    .replace(/\/+$/, '')
    .replace(/\/api$/i, '');

  const base = /^https?:\/\//i.test(origin) ? origin : DEFAULT_API_ORIGIN;
  return `${base}/api`;
}
