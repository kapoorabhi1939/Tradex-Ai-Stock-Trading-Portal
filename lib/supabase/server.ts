import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfigured } from "./config";
export async function createClient() {
  if (!supabaseConfigured())
    throw new Error(
      "Supabase is not configured. Add the two public project values to .env.local.",
    );
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            /* Server Components cannot write cookies. proxy.ts handles refresh. */
          }
        },
      },
    },
  );
}
