import Link from "next/link";
import { Brand } from "@/components/ui";
export default function NotFound() {
  return (
    <main id="main-content" className="error-page">
      <Brand />
      <p className="eyebrow">404 / OFF THE CHART</p>
      <h1>This page isn’t in our universe.</h1>
      <p className="muted">
        The link may be incorrect or the instrument is unavailable. Search for
        an instrument to continue.
      </p>
      <Link className="button" href="/research">
        Explore instruments
      </Link>
      <Link className="text-link" href="/">
        Back to home
      </Link>
    </main>
  );
}
