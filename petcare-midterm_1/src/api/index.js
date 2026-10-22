import { demoApi } from "./demoApi";
export const isDemo = import.meta.env.VITE_API_MODE !== "real";
const base = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");
const tokenKey = "petcare-auth-token";
function parseError(payload, status) {
  if (typeof payload?.detail === "string") return payload.detail;
  if (typeof payload === "object" && payload)
    return Object.entries(payload)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join(" · ");
  return `Request failed (${status})`;
}
async function request(path, { signal, method = "GET", body } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  const token = localStorage.getItem(tokenKey);
  if (token) headers.Authorization = `Token ${token}`;
  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    signal,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(parseError(payload, response.status));
  return payload;
}
const asList = (data) => (Array.isArray(data) ? data : data?.results || []);
const realApi = {
  pets: async (signal) => asList(await request("/pets/", { signal })),
  pet: (id, signal) => request(`/pets/${id}/`, { signal }),
  addPet: (fields) => request("/pets/", { method: "POST", body: fields }),
  clinics: async (signal) => asList(await request("/clinics/", { signal })),
  services: async (signal) => asList(await request("/services/", { signal })),
  appointments: async (signal) =>
    asList(await request("/appointments/", { signal })),
  addAppointment: (fields) =>
    request("/appointments/", { method: "POST", body: fields }),
  cancelAppointment: (id) =>
    request(`/appointments/${id}/cancel/`, { method: "POST" }),
  login: async (email, password) => {
    const value = await request("/auth/login/", {
      method: "POST",
      body: { email, password },
    });
    localStorage.setItem(tokenKey, value.token);
    return value;
  },
  logout: async () => {
    try {
      await request("/auth/logout/", { method: "POST" });
    } finally {
      localStorage.removeItem(tokenKey);
    }
  },
  me: () => request("/auth/me/"),
};
export const api = isDemo ? demoApi : realApi;
export const hasAuth = () => !!localStorage.getItem(tokenKey);
