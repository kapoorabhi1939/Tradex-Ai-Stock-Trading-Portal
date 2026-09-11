"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpRight, LoaderCircle } from "lucide-react";
import type { MarketInstrument } from "@/lib/market-data/types";
export function InstrumentSearch({ lens = false }: { lens?: boolean }) {
  const [query, setQuery] = useState(""),
    [results, setResults] = useState<MarketInstrument[]>([]),
    [open, setOpen] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [active, setActive] = useState(-1);
  const root = useRef<HTMLDivElement>(null),
    input = useRef<HTMLInputElement>(null),
    id = useId(),
    router = useRouter();
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    if (query.trim().length < 2) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const r = await fetch(
          "/api/market/search?q=" + encodeURIComponent(query.trim()),
          { signal: controller.signal },
        );
        const data = await r.json();
        if (!controller.signal.aborted) {
          setResults(data.data ?? []);
          setError(data.error ?? "");
          setActive(-1);
        }
      } catch {
        if (!controller.signal.aborted)
          setError("Search is unavailable. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 450);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);
  const select = (r: MarketInstrument) => {
    setOpen(false);
    setQuery("");
    router.push(
      lens
        ? "/dashboard?symbol=" +
            encodeURIComponent(
              r.symbol +
                (r.exchange && /^[A-Z0-9._-]+$/i.test(r.exchange)
                  ? ":" + r.exchange
                  : ""),
            )
        : "/research/" +
            encodeURIComponent(
              r.symbol +
                (r.exchange && /^[A-Z0-9._-]+$/i.test(r.exchange)
                  ? ":" + r.exchange
                  : ""),
            ),
    );
  };
  return (
    <div className="instrument-search" ref={root}>
      <Search size={17} />
      <input
        ref={input}
        role="combobox"
        aria-label={
          lens ? "Select Market Lens instrument" : "Search instruments"
        }
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={id}
        aria-activedescendant={active >= 0 ? id + "-" + active : undefined}
        value={query}
        placeholder={
          lens ? "Change instrument…" : "Search any symbol or company…"
        }
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setLoading(e.target.value.trim().length >= 2);
          setResults([]);
          setActive(-1);
          setError("");
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            input.current?.focus();
          }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setActive((n) =>
              results.length
                ? (n < 0
                    ? e.key === "ArrowDown"
                      ? 0
                      : results.length - 1
                    : n + (e.key === "ArrowDown" ? 1 : -1) + results.length) %
                  results.length
                : -1,
            );
          }
          if (e.key === "Enter" && open && results[active >= 0 ? active : 0]) {
            e.preventDefault();
            select(results[active >= 0 ? active : 0]);
          }
        }}
      />
      {loading ? (
        <LoaderCircle size={16} className="search-loading" />
      ) : (
        <kbd>⌕</kbd>
      )}
      {open && (
        <div className="search-popover">
          <div className="search-caption">INSTRUMENT SEARCH</div>
          <div id={id} role="listbox" aria-label="Matching instruments">
            {results.map((r, i) => (
              <button
                type="button"
                role="option"
                aria-selected={active === i}
                id={id + "-" + i}
                className={
                  active === i ? "search-result selected" : "search-result"
                }
                key={r.symbol + r.exchange + i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(r)}
              >
                <span className="symbol-mark">{r.symbol.slice(0, 2)}</span>
                <span>
                  <strong>{r.symbol}</strong>
                  <span>{r.name}</span>
                  <small>
                    {[r.exchange, r.currency, r.type]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </span>
                <ArrowUpRight size={16} />
              </button>
            ))}
          </div>
          {!results.length && (
            <p role="status">
              {query.trim().length < 2
                ? "Search stocks, ETFs, currencies and more."
                : loading
                  ? "Searching…"
                  : error || "No matching instruments."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
