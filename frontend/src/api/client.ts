// URL de l'API Express.
// En dev sur émulateur/téléphone, "localhost" ne pointe PAS vers ton PC.
// - Web / iOS simulator : http://localhost:4000
// - Émulateur Android   : http://10.0.2.2:4000
// - Téléphone physique  : http://<IP-LOCALE-DE-TON-PC>:4000
// Configure la valeur dans frontend/.env (EXPO_PUBLIC_API_URL).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const message = await res.text();
    throw new Error(`API ${res.status}: ${message}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  // Ajoute put/patch/delete au besoin.
};
