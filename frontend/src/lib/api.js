const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchSummary() {
  const res = await fetch(`${API_BASE}/summary`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function fetchStates() {
  const res = await fetch(`${API_BASE}/states`);
  if (!res.ok) throw new Error("Failed to fetch states");
  return res.json();
}

export async function fetchFilterMetadata() {
  const res = await fetch(`${API_BASE}/metadata/filters`);
  if (!res.ok) throw new Error("Failed to fetch filter metadata");
  return res.json();
}

export async function fetchBuildings(queryString = "") {
  const url = queryString ? `${API_BASE}/buildings?${queryString}` : `${API_BASE}/buildings`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch buildings");
  return res.json();
}

export async function fetchBuilding(id) {
  const res = await fetch(`${API_BASE}/buildings/${id}`);
  if (!res.ok) throw new Error("Failed to fetch building");
  return res.json();
}
