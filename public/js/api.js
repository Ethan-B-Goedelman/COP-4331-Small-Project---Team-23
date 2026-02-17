// public/js/api.js
export async function apiPost(path, data) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
    body: JSON.stringify(data)
  });

  // Try to parse JSON even on errors
  let json = {};
  try { json = await res.json(); } catch (e) {}

  // Standardize errors
  if (!res.ok) {
    const msg = json?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return json;
}
