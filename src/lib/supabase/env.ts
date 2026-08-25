/** Central read of the Supabase env vars — throws a clear error at the call site instead of a cryptic "fetch failed" if a var is missing. */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}. Revisa .env.local / la configuración de Vercel.`);
  return value;
}

export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Server-only — bypasses Row Level Security. Never import this from a Client Component or expose it to the browser. */
export function getSupabaseServiceRoleKey(): string {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}
