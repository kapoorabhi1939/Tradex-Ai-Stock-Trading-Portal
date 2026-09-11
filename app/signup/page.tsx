import Link from "next/link";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { signUp } from "@/app/actions/auth";
import { SignupForm } from "@/components/signup-form";
import { Brand } from "@/components/ui";

export const metadata = { title: "Create account" };

export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const requested = (await searchParams).plan;
  const plan =
    requested === "plus" ? "Plus" : requested === "pro" ? "Pro" : "Free";
  return (
    <main id="main-content" className="signup-page">
      <header>
        <Brand />
        <Link href="/login" className="button secondary small-button">
          Sign in
        </Link>
      </header>
      <section className="signup-layout">
        <div className="signup-copy">
          <p className="eyebrow">CREATE YOUR WORKSPACE</p>
          <h1>Your Tradex account starts with clarity.</h1>
          <p>
            Build your market workspace, track the assets you follow and
            understand every Tradex Signal.
          </p>
          <ul>
            <li>
              <CheckCircle2 size={17} /> Explore connected markets
            </li>
            <li>
              <CheckCircle2 size={17} /> Build a persistent research workspace
            </li>
            <li>
              <CheckCircle2 size={17} /> Understand every Tradex Signal factor
            </li>
          </ul>
        </div>
        <section className="signup-card" aria-labelledby="signup-title">
          <span className="login-lock">
            <LockKeyhole size={24} />
          </span>
          <p className="eyebrow">CREATE ACCOUNT</p>
          <h2 id="signup-title">Create your Tradex account.</h2>
          <p className="signup-plan-note">
            {plan === "Free"
              ? "Start with Tradex Free and upgrade whenever it suits your workflow."
              : plan +
                " selected. Checkout and payment processing are not currently enabled."}
          </p>
          <SignupForm action={signUp} />
          <Link href="/pricing" className="text-link">
            <ArrowLeft size={14} /> Compare plans
          </Link>
        </section>
      </section>
    </main>
  );
}
