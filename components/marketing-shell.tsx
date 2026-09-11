import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Brand, Disclaimer } from "./ui";

export function MarketingHeader() {
  return (
    <header className="marketing-header">
      <Brand />
      <nav aria-label="Public navigation">
        <Link href="/markets">Markets</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/login">Sign in</Link>
        <Link href="/signup" className="button small-button">
          Create account <ArrowRight size={14} />
        </Link>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <Brand />
      <nav aria-label="Footer navigation">
        <Link href="/markets">Markets</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/signup">Create account</Link>
        <Link href="/login">Sign in</Link>
      </nav>
      <Disclaimer />
    </footer>
  );
}
