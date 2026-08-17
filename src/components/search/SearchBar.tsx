import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Package as PackageIcon, Search, TestTube, X } from "lucide-react";
import { packages, tests } from "../../data";
import { formatINR } from "../../data";
import { searchTests } from "../../lib/catalogue";
import { cn } from "../../lib/utils";

type Result =
  | { kind: "test"; slug: string; name: string; price: number }
  | { kind: "package"; slug: string; name: string; price: number };

const MAX_RESULTS = 6;

interface SearchBarProps {
  placeholder?: string;
  size?: "md" | "lg";
  autoFocus?: boolean;
  /** Controlled value (e.g. wired to quick-search chips). */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Called after a successful navigation, e.g. to close a mobile menu. */
  onNavigate?: () => void;
}

/**
 * Combobox search over the demo test & package catalogue.
 * Navigates to a match directly, or to /tests?q=… on plain submit.
 */
export function SearchBar({ placeholder = "Search for a test, package or health checkup...", size = "md", autoFocus, value, onValueChange, onNavigate }: SearchBarProps) {
  const navigate = useNavigate();
  const [internalQuery, setInternalQuery] = useState("");
  const query = value ?? internalQuery;
  const setQuery = (next: string) => {
    setInternalQuery(next);
    onValueChange?.(next);
  };
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches: Array<{ result: Result; score: number }> = [];

    for (const t of searchTests(tests, q)) {
      const name = t.name.toLowerCase();
      const score = name === q ? 0 : name.startsWith(q) ? 1 : name.includes(q) ? 2 : 3;
      matches.push({
        result: { kind: "test", slug: t.slug, name: t.name, price: t.startingPrice ?? t.priceFrom ?? 0 },
        score,
      });
    }

    for (const p of packages) {
      const haystack = `${p.name} ${p.description}`.toLowerCase();
      if (!haystack.includes(q)) continue;
      const name = p.name.toLowerCase();
      const score = name === q ? 0 : name.startsWith(q) ? 1 : name.includes(q) ? 2 : 3;
      matches.push({
        result: { kind: "package", slug: p.slug, name: p.name, price: p.startingPrice },
        score,
      });
    }

    matches.sort((a, b) => a.score - b.score || a.result.name.localeCompare(b.result.name));
    return matches.slice(0, MAX_RESULTS).map((m) => m.result);
  }, [query]);

  const goTo = (result: Result) => {
    setOpen(false);
    setQuery("");
    navigate(result.kind === "test" ? `/tests/${result.slug}` : `/packages/${result.slug}`);
    onNavigate?.();
  };

  const clear = () => {
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    if (results.length > 0) {
      goTo(results[0]);
      return;
    }
    setOpen(false);
    navigate(`/tests?q=${encodeURIComponent(q)}`);
    onNavigate?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => (i + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? Math.max(results.length - 1, 0) : i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (open && activeIndex >= 0 && results[activeIndex]) {
        goTo(results[activeIndex]);
      } else {
        submit();
      }
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const isLarge = size === "lg";

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          // Delay so a click inside the dropdown registers first.
          window.setTimeout(() => {
            setOpen(false);
            setActiveIndex(-1);
          }, 120);
        }
      }}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-slate-300 bg-white shadow-card transition-all focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/25",
          isLarge ? "px-4 py-1.5" : "px-3.5 py-1",
        )}
      >
        <Search className={cn("shrink-0 text-slate-400", isLarge ? "size-5" : "size-4.5")} aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-results-listbox"
          aria-activedescendant={open && activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-label="Search tests and packages"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none",
            isLarge ? "py-3 text-base" : "py-2 text-sm",
          )}
        />
        {query ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="grid size-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            aria-label="Search"
            className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-600 text-white transition-colors hover:bg-primary-700"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div
          id="search-results-listbox"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover animate-zoom-in"
        >
          {results.length === 0 ? (
            query.trim() ? (
              <p className="px-4 py-4 text-sm text-slate-500">
                No matching tests or packages. Press Enter to browse all tests.
              </p>
            ) : (
              <p className="px-4 py-4 text-sm text-slate-500">Start typing to search the catalogue…</p>
            )
          ) : (
            <ul>
              {results.map((result, index) => (
                <li key={`${result.kind}-${result.slug}`}>
                  <button
                    id={`search-result-${index}`}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goTo(result)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      activeIndex === index ? "bg-primary-50" : "bg-white hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg",
                        result.kind === "test" ? "bg-sky-50 text-sky-600" : "bg-primary-50 text-primary-600",
                      )}
                    >
                      {result.kind === "test" ? (
                        <TestTube className="size-4" aria-hidden="true" />
                      ) : (
                        <PackageIcon className="size-4" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">{result.name}</span>
                      <span className="block text-xs text-slate-500">
                        {result.kind === "test" ? "Test" : "Health Package"} · from {formatINR(result.price)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
            Press <kbd className="rounded bg-white px-1 font-sans ring-1 ring-slate-200">Enter</kbd> to browse all results
          </div>
        </div>
      )}
    </div>
  );
}
