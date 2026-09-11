import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole, Check } from "lucide-react";
import { Brand, DemoBadge } from "@/components/ui";
import { ActionForm } from "@/components/action-form";
import { signIn } from "@/app/actions/auth";
import { supabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { safeDestination, safeLoginRequest } from "@/lib/validation";
export const metadata = { title: "Sign in" };
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; signedOut?: string }>;
}) {
  const params = await searchParams;
  const configured = supabaseConfigured();
  if (configured) {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (user) redirect(safeDestination(params.next));
  }
  return (
    <main id="main-content" className="login-page">
      <section className="login-story">
        <Brand />
        <div>
          <p className="eyebrow">A MORE THOUGHTFUL MARKET PERSPECTIVE</p>
          <h1>
            Less noise.
            <br />
            More understanding.
          </h1>
          <p>
            Bring your research, signals, and portfolio into one clear view.
          </p>
          <ul>
            {[
              "Understand the factors behind each signal",
              "See the bigger picture of your portfolio",
              "Keep your research workspace saved",
            ].map((text) => (
              <li key={text}>
                <Check size={18} />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <span className="login-story-foot">
          Built for informed decisions. Never for guaranteed returns.
        </span>
      </section>
      <section className="login-form-area">
        <Link href="/" className="text-link">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div className="login-form-box">
          <span className="login-lock">
            <LockKeyhole size={25} />
          </span>
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Your next insight starts here.</h2>
          <p className="muted">Sign in to your Tradex AI workspace.</p>
          {!configured && (
            <div className="setup-notice" role="status">
              <strong>Account access unavailable</strong>
              <p>
                Account access is being configured. Please contact your
                workspace administrator.
              </p>
            </div>
          )}
          {params.signedOut && (
            <p className="form-message success" role="status">
              You have been signed out.
            </p>
          )}
          <ActionForm
            action={signIn}
            label="Sign in to workspace →"
            pendingLabel="Signing in…"
            className="login-form"
          >
            <input
              type="hidden"
              name="next"
              value={safeLoginRequest(params.next)}
            />
            <label>
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@company.com"
                maxLength={254}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                maxLength={256}
                required
              />
            </label>
          </ActionForm>
          <p className="login-help">
            Use your workspace account. New to Tradex?
          </p>
          <Link href="/signup" className="text-link">
            Create an account →
          </Link>
          <div className="login-disclosure">
            <DemoBadge />
            <span>Your research, securely connected.</span>
          </div>
        </div>
        <p className="disclaimer">
          Educational and analytical output. Not investment advice.
        </p>
      </section>
    </main>
  );
}
