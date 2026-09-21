// Central API base URL - reads from Vite env var in production
// In development, empty string so Vite proxy takes over
export const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}) {
  const url = API_BASE + path;
  const res = await fetch(url, options);
  return res;
}
