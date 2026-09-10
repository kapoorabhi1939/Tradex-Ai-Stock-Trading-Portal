import Link from "next/link";
import { Brand } from "@/components/ui";
export default function NotFound() {
  return (
    <main id="main-content" className="standalone">
      <Brand />
      <p className="eyebrow">404 / OFF THE CHART</p>
      <h1>This page isn’t in our universe.</h1>
      <p className="muted">
        The link may be incorrect, or this equity is not part of the
        demonstration dataset.
      </p>
      <Link className="button" href="/research">
        Explore supported equities
      </Link>
      <Link className="text-link" href="/">
        Back to home
      </Link>
    </main>
  );
}
