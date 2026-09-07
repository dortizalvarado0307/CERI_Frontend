export function decodeJwt(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
  } catch {
    return null;
  }
}

export const decodeUserIdFromToken = (token: string | null): number | null => {
  const payload = decodeJwt(token);
  if (!payload) return null;
  const candidate =
    payload.id_user ?? payload.userId ?? payload.id ?? payload.sub;
  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : null;
};

export const decodeRoleIdFromToken = (token: string | null): number | null => {
  const payload = decodeJwt(token);
  if (!payload) return null;
  const roleId = payload.roleId ?? payload.id_role ?? null;
  return roleId !== null ? Number(roleId) : null;
};