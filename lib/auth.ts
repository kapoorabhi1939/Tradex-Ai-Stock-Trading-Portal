import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/config";

export const requireUser = cache(async () => {
  if (!supabaseConfigured()) redirect("/login?setup=required");
  const db = await createClient();
  const { data, error } = await db.auth.getClaims();
  const claims = data?.claims;
  if (
    error ||
    !claims?.sub ||
    claims.role !== "authenticated" ||
    typeof claims.email !== "string"
  )
    redirect("/login");
  return {
    db,
    user: {
      id: claims.sub,
      email: claims.email,
    },
  };
});
