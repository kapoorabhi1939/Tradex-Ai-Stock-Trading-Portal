"use client";

import { useState } from "react";

import { login, persistSession, signup } from "../lib/api";

export function AuthClient() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    full_name: "Casey Investor",
    email: "demo@tradex.ai",
    password: "demo1234"
  });

  async function submit() {
    const session =
      mode === "login"
        ? await login({ email: form.email, password: form.password })
        : await signup(form);

    persistSession(session);
    setStatus(`Signed in as ${session.full_name}. Auth token stored for watchlist and alert routes.`);
  }

  return (
    <div className="panel">
      <div className="pill-row">
        <button className={mode === "login" ? "primary" : "secondary"} onClick={() => setMode("login")}>
          Login
        </button>
        <button className={mode === "signup" ? "primary" : "secondary"} onClick={() => setMode("signup")}>
          Sign up
        </button>
      </div>

      <div className="field-grid">
        {mode === "signup" ? (
          <label>
            Full name
            <input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
          </label>
        ) : null}

        <label>
          Email
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
      </div>

      <div className="cta-row" style={{ marginTop: 18 }}>
        <button className="primary" onClick={submit}>
          {mode === "login" ? "Enter dashboard" : "Create account"}
        </button>
      </div>

      {status ? <div className="status-banner">{status}</div> : null}
    </div>
  );
}

