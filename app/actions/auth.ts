"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { validateSignup } from "@/lib/signup";
import { safeDestination } from "@/lib/validation";

export type FormState = { error?: string; success?: string };

async function ensureProfile(
  db: Awaited<ReturnType<typeof createClient>>,
  id: string,
  displayName: string,
) {
  await db
    .from("profiles")
    .upsert(
      { id, display_name: displayName.slice(0, 60) },
      { onConflict: "id", ignoreDuplicates: true },
    );
}

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
    const { data, error } = await db.auth.signInWithPassword({
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
    if (data.user) {
      const displayName =
        typeof data.user.user_metadata?.display_name === "string"
          ? data.user.user_metadata.display_name.trim()
          : "";
      await ensureProfile(db, data.user.id, displayName);
    }
  } catch {
    return {
      error: "Unable to reach authentication. Please try again shortly.",
    };
  }
  revalidatePath("/", "layout");
  redirect(safeDestination(form.get("next")));
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  if (!supabaseConfigured())
    return {
      error:
        "Account creation is unavailable. Please contact your workspace administrator.",
    };
  const validated = validateSignup(form);
  if ("error" in validated) return { error: validated.error };

  try {
    const db = await createClient();
    const { data, error } = await db.auth.signUp({
      email: validated.data.email,
      password: validated.data.password,
      options: { data: { display_name: validated.data.name } },
    });
    if (error)
      return {
        error:
          error.code === "weak_password"
            ? "Use a stronger password with at least 8 characters."
            : "Account creation failed. Check your details or try again shortly.",
      };
    if (data.session && data.user) {
      await ensureProfile(db, data.user.id, validated.data.name);
      revalidatePath("/", "layout");
    } else {
      return {
        success:
          "Check your email to verify your account, then sign in to continue.",
      };
    }
  } catch {
    return {
      error: "Unable to reach account services. Please try again shortly.",
    };
  }
  redirect("/dashboard");
}

export async function signOut(_: FormState): Promise<FormState> {
  void _;
  const db = await createClient();
  const { error } = await db.auth.signOut({ scope: "local" });
  if (error) return { error: "Unable to sign out. Please try again." };
  revalidatePath("/", "layout");
  redirect("/login?signedOut=1");
}
