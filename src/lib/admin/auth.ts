import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Admin allowlist by email, via env var — deliberately not a database
 * role/table. This is the smallest thing that's actually correct: it's
 * server-only (never reaches the browser), can't be forged by a client
 * (no request input is trusted), and needs zero new schema for a first
 * cut. Revisit with a real `is_admin` column + RLS-aware admin policies
 * only once there's an actual need for more than one or two operators.
 */
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user?.email) return false;
  return getAdminEmails().includes(user.email.toLowerCase());
}
