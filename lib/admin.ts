import "server-only";
import { emailAllowed } from "./admin-access";

export function adminConfigured() {
  return Boolean(process.env.TRADEX_ADMIN_EMAILS?.trim());
}

export function isAdminEmail(email: string | null | undefined) {
  return emailAllowed(email, process.env.TRADEX_ADMIN_EMAILS);
}
