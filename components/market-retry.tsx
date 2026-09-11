"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
export function MarketRetry() {
  const router = useRouter(),
    [pending, start] = useTransition();
  return (
    <button
      className="text-link"
      disabled={pending}
      onClick={() => start(() => router.refresh())}
    >
      {pending ? "Refreshing…" : "Try again ↗"}
    </button>
  );
}
