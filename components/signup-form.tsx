import type { FormState } from "@/app/actions/auth";
import { ActionForm } from "./action-form";

type SignupAction = (state: FormState, form: FormData) => Promise<FormState>;

export function SignupForm({ action }: { action: SignupAction }) {
  return (
    <ActionForm
      action={action}
      label="Create account"
      pendingLabel="Creating account…"
      className="signup-form"
    >
      <label>
        Name
        <input
          name="name"
          autoComplete="name"
          placeholder="Your name"
          maxLength={60}
          required
        />
      </label>
      <label>
        Email address
        <input
          name="email"
          autoComplete="email"
          type="email"
          placeholder="you@example.com"
          maxLength={254}
          required
        />
      </label>
      <label>
        Password
        <input
          name="password"
          autoComplete="new-password"
          type="password"
          placeholder="At least 8 characters"
          minLength={8}
          maxLength={256}
          required
        />
      </label>
      <label>
        Confirm password
        <input
          name="confirm_password"
          autoComplete="new-password"
          type="password"
          placeholder="Repeat your password"
          minLength={8}
          maxLength={256}
          required
        />
      </label>
      <label className="checkbox-label">
        <input name="terms" type="checkbox" required /> I agree to the terms and
        privacy policy.
      </label>
    </ActionForm>
  );
}
