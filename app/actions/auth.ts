"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { safeDestination } from "@/lib/validation";
export type FormState = { error?: string; success?: string };
export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  if (!supabaseConfigured())
    return {
      error:
        "Account access is unavailable. Please contact your workspace administrator.",
    };
  const email = form.get("email");
  const password = form.get("password");
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    email.length > 254 ||
    typeof password !== "string" ||
    !password ||
    password.length > 256
  )
    return { error: "Enter a valid email address and password." };
  try {
    const db = await createClient();
    const { error } = await db.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error)
      return {
        error:
          error.code === "email_not_confirmed"
            ? "Confirm your email before signing in."
            : "Sign-in failed. Check your email and password, or try again shortly.",
      };
  } catch {
    return {
      error: "Unable to reach authentication. Please try again shortly.",
    };
  }
  revalidatePath("/", "layout");
  redirect(safeDestination(form.get("next")));
}
export async function signOut(_: FormState): Promise<FormState> {
  void _;
  const db = await createClient();
  const { error } = await db.auth.signOut({ scope: "local" });
  if (error) return { error: "Unable to sign out. Please try again." };
  revalidatePath("/", "layout");
  redirect("/login?signedOut=1");
}
