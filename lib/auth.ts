import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/config";
export const requireUser = cache(async () => {
  if (!supabaseConfigured()) redirect("/login?setup=required");
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  return { db, user };
});
