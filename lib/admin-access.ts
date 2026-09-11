export function emailAllowed(
  email: string | null | undefined,
  configured: string | null | undefined,
) {
  if (!configured || !email) return false;
  const normalized = email.trim().toLowerCase();
  return configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalized);
}
