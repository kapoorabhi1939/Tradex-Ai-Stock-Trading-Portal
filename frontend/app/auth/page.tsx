import { AuthClient } from "../../components/AuthClient";
import { Disclaimer } from "../../components/Disclaimer";

export default function AuthPage() {
  return (
    <main className="section-stack">
      <section className="hero">
        <div className="eyebrow">Authentication</div>
        <h1 style={{ maxWidth: "11ch" }}>Authenticate once, then personalize watchlists and alerts.</h1>
        <p>The backend issues a demo bearer token so protected routes can be exercised without introducing full identity infrastructure yet.</p>
      </section>
      <AuthClient />
      <Disclaimer />
    </main>
  );
}

