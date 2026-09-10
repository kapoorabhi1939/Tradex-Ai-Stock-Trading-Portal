"use client";
import { useActionState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import type { FormState } from "@/app/actions/auth";
type Action = (state: FormState, form: FormData) => Promise<FormState>;
export function ActionForm({
  action,
  children,
  label,
  pendingLabel = "Saving…",
  className = "",
  buttonClass = "",
  confirmMessage,
  accessibleLabel,
}: {
  action: Action;
  children?: ReactNode;
  label: ReactNode;
  pendingLabel?: string;
  className?: string;
  buttonClass?: string;
  confirmMessage?: string;
  accessibleLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage))
          event.preventDefault();
      }}
    >
      <fieldset disabled={pending}>
        {children}
        <button
          aria-label={accessibleLabel}
          className={`button ${buttonClass}`}
          type="submit"
          disabled={pending}
        >
          {pending ? (
            <>
              <LoaderCircle size={15} className="spin" />
              {pendingLabel}
            </>
          ) : (
            label
          )}
        </button>
      </fieldset>
      {state.error && (
        <p className="form-message error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="form-message success" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
