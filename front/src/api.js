const CLES = { client: 'session', admin: 'session-admin' };
let espaceActif = 'client';

export function definirEspace(espace) {
  espaceActif = espace === 'admin' ? 'admin' : 'client';
}

function jeton() {
  const brut = localStorage.getItem(CLES[espaceActif]);
  if (!brut) return '';
  try {
    return JSON.parse(brut).token || '';
  } catch {
    return '';
  }
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = jeton();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch('/api' + path, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}
