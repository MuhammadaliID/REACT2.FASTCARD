const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const ADMIN_ROLES = ["admin", "superadmin"];

export interface TokenInfo {
  userName: string;
  email: string;
  roles: string[];
}

const decodePayload = (token: string): Record<string, unknown> | null => {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const bytes = atob(padded);
    const json = decodeURIComponent(
      Array.from(bytes, (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const readRoles = (payload: Record<string, unknown>): string[] => {
  const raw = payload[ROLE_CLAIM] ?? payload.role ?? payload.roles;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string" && raw) return [raw];
  return [];
};

export const getToken = (): string | null => localStorage.getItem("token");

export const setToken = (token: string) => localStorage.setItem("token", token);

export const clearToken = () => localStorage.removeItem("token");

export const hasToken = (): boolean => Boolean(getToken());

export const getTokenInfo = (): TokenInfo | null => {
  const token = getToken();
  if (!token) return null;
  const payload = decodePayload(token);
  if (!payload) return null;
  const roles = readRoles(payload);
  return {
    userName: String(payload.name ?? payload.unique_name ?? ""),
    email: String(payload.email ?? ""),
    roles,
  };
};

export const isAdmin = (): boolean => {
  const info = getTokenInfo();
  if (!info) return false;
  return info.roles.some((role) => ADMIN_ROLES.includes(role.toLowerCase()));
};
